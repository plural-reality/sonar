import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { callOpenRouter } from "@/lib/openrouter/client";
import { buildReportPrompt } from "@/lib/openrouter/prompts";
import { z } from "zod";

const generateReportSchema = z.object({
  sessionId: z.string().uuid(),
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
  report_instructions: string | null;
  key_questions: string[] | null;
  status: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId } = generateReportSchema.parse(body);

    const supabase = await createClient();

    // Fetch session
    const { data: sessionData } = await supabase
      .from("sessions")
      .select("*")
      .eq("id", sessionId)
      .single();

    const session = sessionData as SessionData | null;

    if (!session) {
      return NextResponse.json(
        { error: "セッションが見つかりません" },
        { status: 404 }
      );
    }

    // Fetch all questions with answers
    const { data: questions } = await supabase
      .from("questions")
      .select("*, answers(*)")
      .eq("session_id", sessionId)
      .order("question_index", { ascending: true });

    const allQA = ((questions as QuestionWithAnswer[]) || [])
      .filter((q) => q.answers && q.answers.length > 0)
      .map((q) => ({
        index: q.question_index,
        statement: q.statement,
        detail: q.detail || "",
        options: q.options as string[],
        selectedOption: q.answers![0].selected_option,
        freeText: q.answers![0].free_text ?? null,
      }));

    if (allQA.length < 5) {
      return NextResponse.json(
        { error: "レポート生成には最低5問の回答が必要です" },
        { status: 400 }
      );
    }

    // Fetch all analyses
    const { data: analysesData } = await supabase
      .from("analyses")
      .select("analysis_text")
      .eq("session_id", sessionId)
      .order("batch_index", { ascending: true });

    const analyses = (analysesData || []) as Array<{ analysis_text: string }>;

    // Get current version
    const { data: existingReports } = await supabase
      .from("reports")
      .select("version")
      .eq("session_id", sessionId)
      .order("version", { ascending: false })
      .limit(1);

    const newVersion =
      existingReports && existingReports.length > 0
        ? existingReports[0].version + 1
        : 1;

    // Generate report
    const keyQuestions = Array.isArray(session.key_questions) ? session.key_questions : [];
    const prompt = buildReportPrompt({
      purpose: session.purpose,
      backgroundText: session.background_text || "",
      reportInstructions: session.report_instructions || undefined,
      keyQuestions: keyQuestions.length > 0 ? keyQuestions : undefined,
      allQA,
      allAnalyses: analyses.map((a) => a.analysis_text),
      version: newVersion,
    });

    const reportText = await callOpenRouter(
      [{ role: "user", content: prompt }],
      { temperature: 0.7, maxTokens: 4000 }
    );

    // Save report
    const { data: report, error } = await supabase
      .from("reports")
      .insert({
        session_id: sessionId,
        version: newVersion,
        report_text: reportText,
      })
      .select()
      .single();

    if (error) {
      console.error("Report save error:", error);
      return NextResponse.json(
        { error: "レポートの保存に失敗しました" },
        { status: 500 }
      );
    }

    // Update session status
    await supabase
      .from("sessions")
      .update({ status: "completed" })
      .eq("id", sessionId);

    return NextResponse.json({ report });
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
