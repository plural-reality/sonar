import shugiin2026 from "./2026-shugiin-election.json";

export interface SessionPreset {
  title: string;
  purpose: string;
  backgroundText?: string;
  reportInstructions?: string;
}

export interface PresetMetadata {
  ogTitle: string;
  ogDescription: string;
  ogImage?: string;
}

const PRESETS: Record<string, SessionPreset> = {
  "2026-shugiin-election": shugiin2026,
};

const PRESET_METADATA: Record<string, PresetMetadata> = {
  "2026-shugiin-election": {
    ogTitle: "2026年 衆議院選挙 AIボートマッチ",
    ogDescription:
      "AIとの対話を通じて、あなたの価値観に近い政党を見つけましょう。各政党のマニフェストに基づいて相性を診断します。",
    ogImage: "/images/ogp.png",
  },
};

export function getPreset(slug: string): SessionPreset | null {
  return PRESETS[slug] ?? null;
}

export function getPresetMetadata(slug: string): PresetMetadata | null {
  return PRESET_METADATA[slug] ?? null;
}
