interface AnalysisBlockProps {
  batchIndex: number;
  text: string;
}

export function AnalysisBlock({ batchIndex, text }: AnalysisBlockProps) {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-4 md:p-6">
      <div className="flex items-center gap-2 mb-3">
        <svg
          className="w-5 h-5 text-blue-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
        </svg>
        <span className="text-sm font-medium text-blue-700">
          分析 #{batchIndex}（Q{(batchIndex - 1) * 5 + 1}-Q{batchIndex * 5}）
        </span>
      </div>
      <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
        {text}
      </p>
    </div>
  );
}
