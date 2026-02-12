"use client";

import { useState, useRef } from "react";
import { extractTextFromPDF } from "@/lib/pdf/extractor";

interface PdfUploadProps {
  onExtract: (text: string) => void;
}

export function PdfUpload({ onExtract }: PdfUploadProps) {
  const [isExtracting, setIsExtracting] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setError("PDFファイルを選択してください");
      return;
    }

    setError(null);
    setIsExtracting(true);
    setFileName(file.name);

    try {
      const text = await extractTextFromPDF(file);
      onExtract(text);
    } catch (err) {
      setError("PDFの読み取りに失敗しました");
      console.error(err);
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        参考資料（PDF）
      </label>
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="hidden"
        />
        {isExtracting ? (
          <div className="text-gray-500">
            <svg
              className="animate-spin h-8 w-8 mx-auto mb-2"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <p>テキストを抽出中...</p>
          </div>
        ) : fileName ? (
          <div className="text-green-600">
            <svg
              className="w-8 h-8 mx-auto mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <p>{fileName}</p>
            <p className="text-sm text-gray-500 mt-1">
              クリックして別のファイルを選択
            </p>
          </div>
        ) : (
          <div className="text-gray-500">
            <svg
              className="w-8 h-8 mx-auto mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p>PDFをアップロード</p>
            <p className="text-sm mt-1">クリックまたはドラッグ&ドロップ</p>
          </div>
        )}
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
