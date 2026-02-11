import { NextRequest, NextResponse } from "next/server";
import { callOpenRouter } from "@/lib/openrouter/client";
import { z } from "zod";

const generateKeyQuestionsSchema = z.object({
  purpose: z.string().min(1, "目的を入力してください").max(5000),
  backgroundText: z.string().max(50000).optional(),
});

function buildKeyQuestionsPrompt(purpose: string, backgroundText?: string): string {
  return `あなたはアンケート設計の専門家です。
ユーザーが設定した「目的」と「背景情報」をもとに、アンケートの軸となるキークエスチョン（大きな粒度の問い）を5つ生成してください。

## ユーザーの目的
${purpose}

## 背景情報
${backgroundText || "特になし"}

## キークエスチョンの設計指針

### 粒度
- すぐに一言で答えられるような細かい質問ではなく、多角的に深掘りできるマクロな問いにしてください
- 各キークエスチョンを軸に、さらに具体的な質問を展開できるレベルの抽象度を保ちます
- ただし抽象的すぎて答えようがないレベルにはしないでください

### 網羅性
- 目的に対して偏りなく、異なる観点からの問いを設計してください
- 5つの問いが互いに重複せず、全体として目的のテーマを広くカバーするようにしてください

### 形式
- 疑問形（「〜か？」「〜だろうか？」）で記述してください
- 各質問は40〜80文字程度にしてください
- 具体的な文脈を含めつつ、回答者が自分の考えを深められるような問いにしてください

## 出力形式
以下のJSON形式のみで出力してください。説明文は不要です。

{
  "keyQuestions": [
    "キークエスチョン1",
    "キークエスチョン2",
    "キークエスチョン3",
    "キークエスチョン4",
    "キークエスチョン5"
  ]
}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = generateKeyQuestionsSchema.parse(body);

    const prompt = buildKeyQuestionsPrompt(
      validated.purpose,
      validated.backgroundText
    );

    const response = await callOpenRouter(
      [{ role: "user", content: prompt }],
      { temperature: 0.7, maxTokens: 1000 }
    );

    // Extract JSON from response
    let parsed: { keyQuestions: string[] };
    try {
      const fencedMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/i);
      const jsonStr = fencedMatch?.[1]?.trim() || response.trim();

      const firstBrace = jsonStr.indexOf("{");
      const lastBrace = jsonStr.lastIndexOf("}");
      if (firstBrace === -1 || lastBrace === -1) {
        throw new Error("No JSON found");
      }

      parsed = JSON.parse(jsonStr.slice(firstBrace, lastBrace + 1));
    } catch (parseError) {
      console.error("Key questions JSON parse error:", parseError, response);
      return NextResponse.json(
        { error: "キークエスチョンの生成に失敗しました" },
        { status: 500 }
      );
    }

    if (!parsed || !Array.isArray(parsed.keyQuestions) || parsed.keyQuestions.length === 0) {
      console.error("Invalid key questions payload:", response);
      return NextResponse.json(
        { error: "キークエスチョンの生成に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({ keyQuestions: parsed.keyQuestions });
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
