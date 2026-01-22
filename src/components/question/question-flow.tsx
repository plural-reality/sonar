"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { QuestionCard } from "./question-card";
import { QuestionSkeleton } from "./question-skeleton";
import { AnalysisBlock } from "@/components/analysis/analysis-block";
import { AnalysisSkeleton } from "@/components/analysis/analysis-skeleton";
import { ReportPreview } from "@/components/report/report-preview";
import { Progress } from "@/components/ui/progress";
import { useSession } from "@/hooks/use-session";

interface QuestionFlowProps {
  sessionId: string;
}

export function QuestionFlow({ sessionId }: QuestionFlowProps) {
  const router = useRouter();
  const {
    session,
    questions,
    analyses,
    report,
    isLoading,
    isGeneratingQuestions,
    isGeneratingAnalysis,
    isGeneratingReport,
    submitAnswer,
    generateNextBatch,
    generateAnalysis,
    generateReport,
  } = useSession(sessionId);

  const [pendingAnswer, setPendingAnswer] = useState<{
    questionId: string;
    optionIndex: number;
    freeText?: string | null;
  } | null>(null);
  const [processingBatch, setProcessingBatch] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(false);
  const prevAnalysisCount = useRef(0);

  // Handle finish and generate report with auto-redirect
  const handleFinish = useCallback(async () => {
    setIsFinishing(true);
    await generateReport();
    router.push(`/report/${sessionId}`);
  }, [generateReport, router, sessionId]);

  // Calculate current progress
  const answeredCount = questions.filter(
    (q) => q.selectedOption !== null
  ).length;
  const totalTarget = 50;

  // Find unanswered questions
  const unansweredQuestions = questions.filter(
    (q) => q.selectedOption === null
  );
  const firstUnansweredQuestion = unansweredQuestions[0] ?? null;

  // Scroll to unanswered question
  const scrollToUnanswered = useCallback(() => {
    if (firstUnansweredQuestion) {
      const element = document.getElementById(
        `question-${firstUnansweredQuestion.question_index}`
      );
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [firstUnansweredQuestion]);

  // Handle answer selection
  const handleSelect = useCallback(
    async (
      questionId: string,
      optionIndex: number,
      freeText?: string | null
    ) => {
      setPendingAnswer({ questionId, optionIndex, freeText });
      await submitAnswer(questionId, optionIndex, freeText);
      setPendingAnswer(null);
    },
    [submitAnswer]
  );

  // Auto-generate next batch and analysis when batch is complete
  useEffect(() => {
    const batchComplete = answeredCount > 0 && answeredCount % 5 === 0;

    if (
      batchComplete &&
      !isGeneratingAnalysis &&
      !isGeneratingQuestions &&
      !processingBatch
    ) {
      const batchIndex = answeredCount / 5;
      const analysisExists = analyses.some((a) => a.batch_index === batchIndex);

      if (!analysisExists) {
        setProcessingBatch(true);
        const startIndex = (batchIndex - 1) * 5 + 1;
        const endIndex = batchIndex * 5;

        // Generate analysis and next questions
        Promise.all([
          generateAnalysis(batchIndex, startIndex, endIndex),
          answeredCount < totalTarget
            ? generateNextBatch(endIndex + 1, endIndex + 5)
            : Promise.resolve(),
        ]).finally(() => setProcessingBatch(false));
      }
    }
  }, [
    answeredCount,
    analyses,
    isGeneratingAnalysis,
    isGeneratingQuestions,
    processingBatch,
    generateAnalysis,
    generateNextBatch,
  ]);

  // Auto-scroll to the latest analysis block only when a new one is added
  useEffect(() => {
    if (analyses.length <= prevAnalysisCount.current) {
      prevAnalysisCount.current = analyses.length;
      return;
    }

    const latestAnalysis = analyses[analyses.length - 1];
    const target = document.getElementById(
      `analysis-${latestAnalysis.batch_index}`
    );
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    prevAnalysisCount.current = analyses.length;
  }, [analyses]);

  // Detect when scrolled to bottom
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const threshold = 100; // px from bottom
      setIsAtBottom(scrollTop + windowHeight >= documentHeight - threshold);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Check initial state
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Group questions and analyses for display
  type ContentBlock =
    | { type: "questions"; items: typeof questions }
    | { type: "analysis"; item: (typeof analyses)[0] }
    | { type: "report"; item: NonNullable<typeof report> };

  const contentBlocks: ContentBlock[] = [];
  let questionBatch: typeof questions = [];
  let reportInserted = false;
  const reportTime = report ? new Date(report.created_at).getTime() : null;
  const reportAfterBatchIndex =
    report && reportTime
      ? analyses
          .filter((analysis) => {
            const analysisTime = new Date(analysis.created_at).getTime();
            return Number.isFinite(analysisTime) && analysisTime <= reportTime;
          })
          .sort((a, b) => a.batch_index - b.batch_index)
          .at(-1)?.batch_index ?? null
      : null;

  for (const question of questions) {
    questionBatch.push(question);

    if (questionBatch.length === 5) {
      contentBlocks.push({ type: "questions" as const, items: [...questionBatch] });

      // Find analysis for this batch
      const batchIndex = Math.floor((question.question_index - 1) / 5) + 1;
      const analysis = analyses.find((a) => a.batch_index === batchIndex);

      if (analysis) {
        contentBlocks.push({ type: "analysis" as const, item: analysis });
      }
      if (
        !reportInserted &&
        report &&
        reportAfterBatchIndex !== null &&
        reportAfterBatchIndex === batchIndex
      ) {
        contentBlocks.push({ type: "report" as const, item: report });
        reportInserted = true;
      }

      questionBatch = [];
    }
  }

  // Add remaining questions
  if (questionBatch.length > 0) {
    contentBlocks.push({ type: "questions" as const, items: questionBatch });
  }

  if (report && !reportInserted) {
    contentBlocks.push({ type: "report" as const, item: report });
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Progress current={0} total={totalTarget} />
        {[...Array(5)].map((_, i) => (
          <QuestionSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Fixed progress header */}
      <div className="sticky top-0 bg-gray-50 py-4 z-10 border-b border-gray-200 -mx-4 px-4">
        <Progress current={answeredCount} total={totalTarget} />
        {answeredCount >= totalTarget && !isFinishing && (
          <div className="mt-3 text-center">
            <button
              onClick={handleFinish}
              disabled={isGeneratingReport}
              className="w-full sm:w-auto px-6 py-2.5 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm sm:text-base"
            >
              回答を終える
            </button>
          </div>
        )}
        {isFinishing && (
          <div className="mt-3 text-center">
            <div className="inline-flex items-center gap-2 px-6 py-2 bg-blue-100 text-blue-700 rounded-lg">
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              全体分析レポートを生成中...
            </div>
          </div>
        )}
        {answeredCount >= 5 &&
          answeredCount < totalTarget &&
          answeredCount % 5 === 0 && (
          <div className="mt-3 text-center">
            <button
              onClick={generateReport}
              disabled={isGeneratingReport}
              className="w-full sm:w-auto px-4 py-2 sm:py-1.5 text-sm border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              {isGeneratingReport
                ? "レポートを生成中..."
                : "回答を中断する"}
            </button>
          </div>
        )}
      </div>

      {/* Content blocks */}
      <div className="space-y-6">
        {contentBlocks.map((block, blockIndex) => {
          if (block.type === "questions") {
            return (
              <div key={`questions-${blockIndex}`} className="space-y-4">
                {block.items.map((question) => (
                  <div
                    key={question.id}
                    id={`question-${question.question_index}`}
                  >
                    <QuestionCard
                      questionIndex={question.question_index}
                      statement={question.statement}
                      detail={question.detail || ""}
                      options={question.options as string[]}
                      selectedOption={question.selectedOption}
                      freeText={question.freeText ?? null}
                      onSelect={(optionIndex, freeText) =>
                        handleSelect(question.id, optionIndex, freeText)
                      }
                      isLoading={pendingAnswer?.questionId === question.id}
                    />
                  </div>
                ))}
              </div>
            );
          }

          if (block.type === "analysis") {
            return (
              <div
                key={`analysis-${blockIndex}`}
                id={`analysis-${block.item.batch_index}`}
              >
                <AnalysisBlock
                  batchIndex={block.item.batch_index}
                  text={block.item.analysis_text}
                />
              </div>
            );
          }

          if (block.type === "report") {
            return (
              <ReportPreview
                key={`report-${blockIndex}`}
                sessionId={sessionId}
                reportText={block.item.report_text}
                version={block.item.version}
              />
            );
          }

          return null;
        })}

        {/* Loading states */}
        {isGeneratingAnalysis && <AnalysisSkeleton />}
        {isGeneratingQuestions && (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <QuestionSkeleton key={i} />
            ))}
          </div>
        )}
      </div>

      {/* Jump to unanswered question button - shows only at bottom */}
      {isAtBottom && unansweredQuestions.length > 0 && questions.length > 0 && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={scrollToUnanswered}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors text-sm"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 15l7-7 7 7"
              />
            </svg>
            未回答の質問へ（残り{unansweredQuestions.length}件）
          </button>
        </div>
      )}
    </div>
  );
}
