import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import {
  getPreset,
  getPresetMetadata,
  getPresetFromDB,
  getPresetMetadataFromDB,
} from "@/lib/presets";
import { PresetSessionStarter } from "@/components/session/preset-session-starter";

interface PresetPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PresetPageProps): Promise<Metadata> {
  const { slug } = await params;

  // Try hardcoded first, then DB
  const preset = getPreset(slug) || (await getPresetFromDB(slug));
  const meta = getPresetMetadata(slug) || (await getPresetMetadataFromDB(slug));

  if (!preset) {
    return {};
  }

  const title = meta?.ogTitle || preset.title;
  const description = meta?.ogDescription || preset.purpose;
  const image = meta?.ogImage;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      ...(image && { images: [{ url: image, width: 1200, height: 630 }] }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(image && { images: [image] }),
    },
  };
}

export default async function PresetPage({ params }: PresetPageProps) {
  const { slug } = await params;

  // Try hardcoded first, then DB
  const preset = getPreset(slug) || (await getPresetFromDB(slug));

  if (!preset) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8 md:py-16">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <Suspense>
            <PresetSessionStarter preset={preset} />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
