import Image from "next/image";
import { PresetCreator } from "@/components/preset/preset-creator";
import { FormHistory } from "@/components/preset/form-history";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8 md:py-16">
        <div className="text-center mb-8">
          <Image
            src="/logo.png"
            alt="倍速アンケート"
            width={200}
            height={40}
            className="mx-auto mb-2"
            priority
          />
          <p className="text-gray-600 text-sm">
            AIとの対話で、深い意見を素早く集める
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <PresetCreator />
        </div>

        <div className="mt-6">
          <FormHistory />
        </div>
      </div>
    </main>
  );
}
