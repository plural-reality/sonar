"use client";

import Link from "next/link";
import ReactMarkdown from "react-markdown";

interface ReportPreviewProps {
  sessionId: string;
  reportText: string;
  version: number;
}

export function ReportPreview({
  sessionId,
  reportText,
  version,
}: ReportPreviewProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div>
          <h3 className="text-base font-semibold text-gray-900">
            診断レポート
          </h3>
          <p className="text-xs text-gray-500">バージョン {version}</p>
        </div>
      </div>

      <div className="relative max-h-56 overflow-hidden">
        <div className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-li:text-gray-700">
          <ReactMarkdown>{reportText}</ReactMarkdown>
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white to-transparent" />
      </div>

      <div className="mt-4">
        <Link
          href={`/report/${sessionId}`}
          className="inline-flex items-center justify-center w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        >
          レポート全文を見る
        </Link>
      </div>
    </div>
  );
}
