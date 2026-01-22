import shugiin2026 from "./2026-shugiin-election.json";

export interface SessionPreset {
  title: string;
  purpose: string;
  backgroundText?: string;
  reportInstructions?: string;
}

const PRESETS: Record<string, SessionPreset> = {
  "2026-shugiin-election": shugiin2026,
};

export function getPreset(slug: string): SessionPreset | null {
  return PRESETS[slug] ?? null;
}
