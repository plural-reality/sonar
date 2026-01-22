"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { QuestionCitation } from "./question-citation";

interface QuestionData {
  question_index: number;
  statement: string;
  detail: string;
  options: string[];
  selectedOption: number | null;
  freeText?: string | null;
}

interface ReportViewProps {
  sessionId: string;
  reportText: string;
  version: number;
  questions: QuestionData[];
}

export function ReportView({
  sessionId,
  reportText,
  version,
  questions,
}: ReportViewProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/report/${sessionId}`;
    const shareData = {
      title: "診断レポート",
      text: "診断レポートをシェアします",
      url: shareUrl,
    };

    if (navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.error("Share failed:", err);
        }
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getAnswerLabel = (question: QuestionData): string | null => {
    if (question.selectedOption === null) return null;
    if (question.selectedOption === 5) {
      const trimmed = question.freeText?.trim();
      return trimmed ? `その他（自由記述）: ${trimmed}` : "その他（自由記述）";
    }
    return question.options[question.selectedOption] ?? null;
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">診断レポート</h1>
          <p className="text-sm text-gray-500 mt-1">バージョン {version}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
          <button
            onClick={handleShare}
            className="w-full sm:w-auto px-4 py-2.5 sm:py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
          >
            {copied ? "コピーしました" : "シェア"}
          </button>
          {/* <button
            onClick={() => router.push(`/report/${sessionId}/print`)}
            className="w-full sm:w-auto px-4 py-2.5 sm:py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
          >
            印刷用ページ
          </button> */}
          <button
            onClick={() => router.push(`/session/${sessionId}`)}
            className="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            回答を続ける
          </button>
        </div>
      </div>

      <div className="prose prose-blue max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-li:text-gray-700">
        <ReactMarkdown
          components={{
            p: ({ children }) => {
              // Process children to replace citation patterns
              const processChildren = (child: React.ReactNode): React.ReactNode => {
                if (typeof child === "string") {
                  const parts = child.split(/(\[\d+\])/g);
                  return parts.map((part, i) => {
                    const match = part.match(/\[(\d+)\]/);
                    if (match) {
                      const qNum = parseInt(match[1]);
                      const question = questions.find(
                        (q) => q.question_index === qNum
                      );
                      if (question) {
                        return (
                          <QuestionCitation
                            key={i}
                            questionIndex={qNum}
                            statement={question.statement}
                            selectedAnswer={getAnswerLabel(question)}
                          />
                        );
                      }
                    }
                    return part;
                  });
                }
                return child;
              };

              const processed = Array.isArray(children)
                ? children.map(processChildren)
                : processChildren(children);

              return <p>{processed}</p>;
            },
          }}
        >
          {reportText}
        </ReactMarkdown>
      </div>
    </div>
  );
}
