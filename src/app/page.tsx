import { SessionForm } from "@/components/session/session-form";
import { SessionList } from "@/components/session/session-list";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8 md:py-16">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sonar</h1>
          <p className="text-gray-600">
            AIとの対話を通じて、あなたの考えを言語化する
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
