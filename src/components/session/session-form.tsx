"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PdfUpload } from "./pdf-upload";

export function SessionForm() {
  const router = useRouter();
  const [purpose, setPurpose] = useState("");
  const [backgroundText, setBackgroundText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePdfExtract = (text: string) => {
    setBackgroundText((prev) => prev + "\n\n--- PDF Content ---\n" + text);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ purpose, backgroundText }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "セッションの作成に失敗しました");
      }

      const { sessionId } = await response.json();

      // Save to LocalStorage
      const sessions = JSON.parse(
        localStorage.getItem("sonar_sessions") || "[]"
      );
      sessions.unshift({
        id: sessionId,
        purpose,
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem(
        "sonar_sessions",
        JSON.stringify(sessions.slice(0, 20))
      );

      router.push(`/session/${sessionId}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "予期せぬエラーが発生しました"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="purpose"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          明確にしたいこと・言語化したいこと
        </label>
        <textarea
          id="purpose"
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          placeholder="例：転職を考えているが、自分が本当に求めている働き方を整理したい"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          rows={3}
          required
        />
      </div>

      <div>
        <label
          htmlFor="background"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          背景情報（任意）
        </label>
        <textarea
          id="background"
          value={backgroundText}
          onChange={(e) => setBackgroundText(e.target.value)}
          placeholder="関連する情報や文脈があれば入力してください"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          rows={6}
        />
      </div>

      <PdfUpload onExtract={handlePdfExtract} />

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting || !purpose.trim()}
        className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting ? "セッションを作成中..." : "セッションを開始する"}
      </button>
    </form>
  );
}
