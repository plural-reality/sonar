import { Metadata } from "next";
import { SessionForm } from "@/components/session/session-form";
import { SessionList } from "@/components/session/session-list";

export const metadata: Metadata = {
  title: "1人で壁打ちする - 倍速アンケート",
  description: "AIとの対話を通じて、あなたの考えを言語化し、思考を整理します",
};

export default function SoloPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8 md:py-16">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            1人で壁打ちする
          </h1>
          <p className="text-gray-600 text-sm">
            AIが質問を投げかけ、あなたの考えを掘り下げるお手伝いをします
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <SessionForm />
        </div>

        <SessionList />
      </div>
    </main>
  );
}
