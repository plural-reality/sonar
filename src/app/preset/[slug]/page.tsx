import { notFound } from "next/navigation";
import { getPreset } from "@/lib/presets";
import { PresetSessionStarter } from "@/components/session/preset-session-starter";

interface PresetPageProps {
  params: Promise<{ slug: string }>;
}

export default async function PresetPage({ params }: PresetPageProps) {
  const { slug } = await params;
  const preset = getPreset(slug);

  if (!preset) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8 md:py-16">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <PresetSessionStarter preset={preset} />
        </div>
      </div>
    </main>
  );
}
