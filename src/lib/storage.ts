import { createDefaultPalette } from "./matou-palette";
import type { FeedbackDirection, Paint, SavedRecipeFile } from "./types";

const PALETTE_KEY = "print-paint-mixer:palette-v1";
const FEEDBACK_KEY = "print-paint-mixer:feedback-v1";

export function loadPalette(): Paint[] {
  if (typeof window === "undefined") return createDefaultPalette();
  try {
    const raw = localStorage.getItem(PALETTE_KEY);
    if (!raw) return createDefaultPalette();
    const parsed = JSON.parse(raw) as Paint[];
    if (!Array.isArray(parsed) || parsed.length === 0) return createDefaultPalette();
    const enabled = parsed.filter((p) => p.inPalette).length;
    if (enabled < 2) return createDefaultPalette();
    return parsed;
  } catch {
    return createDefaultPalette();
  }
}

export function savePalette(paints: Paint[]): void {
  localStorage.setItem(PALETTE_KEY, JSON.stringify(paints));
}

export function resetPalette(): Paint[] {
  const p = createDefaultPalette();
  savePalette(p);
  return p;
}

const FEEDBACK_NUDGE: Record<FeedbackDirection, { l: number; a: number; b: number }> = {
  lighter: { l: 2.5, a: 0, b: 0 },
  darker: { l: -2.5, a: 0, b: 0 },
  more_red: { l: 0, a: 2, b: 0 },
  less_red: { l: 0, a: -2, b: 0 },
  more_blue: { l: 0, a: 0, b: -2 },
  less_blue: { l: 0, a: 0, b: 2 },
  more_yellow: { l: 0, a: -1.5, b: 2 },
  less_yellow: { l: 0, a: 1.5, b: -2 },
  more_green: { l: 0, a: -2, b: 1 },
  less_green: { l: 0, a: 2, b: -1 },
};

export function applyFeedbackToRecipePaints(
  paints: Paint[],
  recipePaintIds: string[],
  direction: FeedbackDirection,
): Paint[] {
  const nudge = FEEDBACK_NUDGE[direction];
  const share = 1 / recipePaintIds.length;
  return paints.map((p) => {
    if (!recipePaintIds.includes(p.id)) return p;
    const prev = p.labOffset ?? { l: 0, a: 0, b: 0 };
    return {
      ...p,
      labOffset: {
        l: prev.l + nudge.l * share,
        a: prev.a + nudge.a * share,
        b: prev.b + nudge.b * share,
      },
    };
  });
}

export function downloadRecipeFile(data: SavedRecipeFile): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${data.name.replace(/\s+/g, "-").toLowerCase() || "recipe"}.paint-mix.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function loadRecipeFile(file: File): Promise<SavedRecipeFile> {
  const text = await file.text();
  const data = JSON.parse(text) as SavedRecipeFile;
  if (data.version !== 1) throw new Error("Unsupported recipe file version");
  return data;
}
