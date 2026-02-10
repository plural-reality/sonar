import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { callOpenRouter } from "@/lib/openrouter/client";
import { buildQuestionGenerationPrompt } from "@/lib/openrouter/prompts";
import { getPhaseForQuestionIndex } from "@/lib/utils/phase";
import { z } from "zod";

const generateQuestionsSchema = z.object({
  sessionId: z.string().uuid(),
  startIndex: z.number().int().min(1),
  endIndex: z.number().int().min(1),
});

interface QuestionWithAnswer {
  question_index: number;
  statement: string;
  detail: string | null;
  options: string[];
  answers?: Array<{ selected_option: number; free_text: string | null }>;
}

interface SessionData {
  id: string;
  purpose: string;
  background_text: string | null;
  key_questions: string[] | null;
  phase_profile: {
    ranges: Array<{
      start: number;
      end: number;
      phase: "exploration" | "deep-dive";
    }>;
  };
  status: string;
  current_question_index: number;
}

function extractJsonPayload(response: string): string | null {
  const fencedMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fencedMatch?.[1]) {
    return fencedMatch[1].trim();
  }

  const firstBrace = response.indexOf("{");
  const lastBrace = response.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    return null;
  }

  return response.slice(firstBrace, lastBrace + 1).trim();
}

function normalizeJsonPayload(raw: string): string {
  return raw.replace(/,\s*([}\]])/g, "$1").replace(/}\s*{/g, "},{");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, startIndex, endIndex } =
      generateQuestionsSchema.parse(body);

    const supabase = await createClient();

    // Fetch session
    const { data: sessionData, error: sessionError } = await supabase
      .from("sessions")
      .select("*")
      .eq("id", sessionId)
      .single();

    const session = sessionData as SessionData | null;

    if (sessionError || !session) {
      return NextResponse.json(
        { error: "セッションが見つかりません" },
        { status: 404 }
      );
    }

    // Fetch existing questions and answers
    const { data: existingQuestions } = await supabase
      .from("questions")
      .select("*, answers(*)")
      .eq("session_id", sessionId)
      .order("question_index", { ascending: true });

    const previousQA = ((existingQuestions as QuestionWithAnswer[]) || []).map(
      (q) => ({
        index: q.question_index,
        statement: q.statement,
        detail: q.detail || "",
        options: q.options as string[],
        selectedOption: q.answers?.[0]?.selected_option ?? null,
        freeText: q.answers?.[0]?.free_text ?? null,
      })
    );

    const phase = getPhaseForQuestionIndex(startIndex, session.phase_profile);

    // Generate questions via OpenRouter
    const keyQuestions = Array.isArray(session.key_questions) ? session.key_questions : [];
    const prompt = buildQuestionGenerationPrompt({
      purpose: session.purpose,
      backgroundText: session.background_text || "",
      keyQuestions: keyQuestions.length > 0 ? keyQuestions : undefined,
      previousQA,
      startIndex,
      endIndex,
      phase,
    });

    const response = await callOpenRouter([{ role: "user", content: prompt }], {
      temperature: 0.8,
    });

    // Parse JSON response
    let generatedQuestions: {
      questions: Array<{
        statement: string;
        detail: string;
        options: string[];
      }>;
    };
    try {
      // Extract JSON from response (handle potential markdown code blocks)
      const jsonPayload = extractJsonPayload(response);
      if (!jsonPayload) throw new Error("No JSON found");
      try {
        generatedQuestions = JSON.parse(jsonPayload);
      } catch {
        generatedQuestions = JSON.parse(normalizeJsonPayload(jsonPayload));
      }
    } catch (parseError) {
      console.error("JSON parse error:", parseError, response);
      return NextResponse.json(
        { error: "質問の生成に失敗しました" },
        { status: 500 }
      );
    }

    if (
      !generatedQuestions ||
      !Array.isArray(generatedQuestions.questions) ||
      generatedQuestions.questions.length === 0
    ) {
      console.error("Invalid questions payload:", response);
      return NextResponse.json(
        { error: "質問の生成に失敗しました" },
        { status: 500 }
      );
    }

    const existingIndexSet = new Set(
      ((existingQuestions as QuestionWithAnswer[]) || []).map(
        (q) => q.question_index
      )
    );

    // Insert questions into database
    const questionsToInsert = generatedQuestions.questions
      .map((q, i) => ({
        session_id: sessionId,
        question_index: startIndex + i,
        statement: q.statement,
        detail: q.detail,
        options: q.options,
        phase,
      }))
      .filter((q) => !existingIndexSet.has(q.question_index));

    let insertedQuestions: QuestionWithAnswer[] = [];

    if (questionsToInsert.length > 0) {
      const { data, error: insertError } = await supabase
        .from("questions")
        .upsert(questionsToInsert, {
          onConflict: "session_id,question_index",
          ignoreDuplicates: true,
        })
        .select();

      if (insertError) {
        console.error("Question insert error:", insertError);
        return NextResponse.json(
          { error: "質問の保存に失敗しました" },
          { status: 500 }
        );
      }

      insertedQuestions = (data as QuestionWithAnswer[]) || [];
    }

    // Update session's current question index
    await supabase
      .from("sessions")
      .update({ current_question_index: endIndex })
      .eq("id", sessionId);

    return NextResponse.json({ questions: insertedQuestions });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "予期せぬエラーが発生しました" },
      { status: 500 }
    );
  }
}
