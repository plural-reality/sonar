import { QuestionFlow } from "@/components/question/question-flow";
import { VotematchSession } from "@/components/preset/votematch-session";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

interface SessionPageProps {
  params: Promise<{ id: string }>;
}

const VOTEMATCH_TITLE = "2026年の衆議院選挙 ボートマッチ";

export default async function SessionPage({ params }: SessionPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: session } = await supabase
    .from("sessions")
    .select("id, purpose, status, title")
    .eq("id", id)
    .single();

  if (!session) {
    redirect("/");
  }

  const isVotematch = session.title === VOTEMATCH_TITLE;

  // ボートマッチの場合は専用のレイアウト
  if (isVotematch) {
    return (
      <main className="min-h-screen bg-white">
        <div className="max-w-2xl mx-auto px-4 pb-6">
          <VotematchSession sessionId={id} />
        </div>
      </main>
    );
  }

  // 通常のセッション
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="mb-6">
          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-gray-700 mb-2 inline-block"
          >
            &larr; ホームに戻る
          </Link>
          <h1 className="text-lg font-medium text-gray-900 line-clamp-2">
            {session.purpose}
          </h1>
        </div>

        <QuestionFlow sessionId={id} />
      </div>
    </main>
  );
}
