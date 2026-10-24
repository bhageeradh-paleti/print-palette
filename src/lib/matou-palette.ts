import type { Paint } from "./types";

/** Starter approximations for Matou 24 — edit swatches in the app for your tubes. */
const SEED: Omit<Paint, "id" | "inPalette">[] = [
  { name: "Chinese White", hex: "#F5F2E8", finish: "opaque" },
  { name: "Primary Lemon Yellow", hex: "#FFE94A", finish: "opaque" },
  { name: "Yellow Ochre", hex: "#C99700", finish: "opaque" },
  { name: "Primary Red Cadmium", hex: "#E41C24", finish: "opaque" },
  { name: "Alizarine Crimson", hex: "#9B1B30", finish: "semi" },
  { name: "English Light Green", hex: "#9CD66A", finish: "opaque" },
  { name: "Cerulean Blue Imit", hex: "#3A75C4", finish: "opaque" },
  { name: "Cobalt Blue", hex: "#0047AB", finish: "opaque" },
  { name: "Cobalt Violet Imit", hex: "#7B4FB3", finish: "opaque" },
  { name: "Burnt Sienna", hex: "#C45C26", finish: "opaque" },
  { name: "Burnt Umber", hex: "#6B3A2A", finish: "opaque" },
  { name: "Ivory Black", hex: "#2B2A28", finish: "opaque" },
  { name: "Orange", hex: "#FF8C00", finish: "opaque" },
  { name: "Yellow Mid", hex: "#FFD200", finish: "opaque" },
  { name: "Vermilion", hex: "#E34234", finish: "opaque" },
  { name: "Rose", hex: "#E75480", finish: "semi" },
  { name: "Flesh Tint", hex: "#F0C4A0", finish: "opaque" },
  { name: "Cerulean Blue", hex: "#2A7EBF", finish: "opaque" },
  { name: "Indigo Light", hex: "#6A7FBA", finish: "semi" },
  { name: "Violet", hex: "#7A1FA2", finish: "opaque" },
  { name: "Emerald Green", hex: "#3CB371", finish: "opaque" },
  { name: "Sap Green", hex: "#4A7023", finish: "opaque" },
  { name: "Green Deep", hex: "#0F5132", finish: "opaque" },
  { name: "Smoke Grey", hex: "#8B8D8A", finish: "opaque" },
];

export function createDefaultPalette(): Paint[] {
  return SEED.map((p, i) => ({
    ...p,
    id: `matou-${i}`,
    inPalette: true,
  }));
}

/** Reference colors not in the Matou set — for “a tube X would help” hints. */
export const REFERENCE_ONLY: { name: string; hex: string }[] = [
  { name: "Phthalo Green", hex: "#00805A" },
  { name: "Phthalo Blue", hex: "#004F6E" },
  { name: "Turquoise", hex: "#30D5C8" },
  { name: "Magenta", hex: "#D0417E" },
  { name: "Naples Yellow", hex: "#FADA5E" },
  { name: "Raw Umber", hex: "#5C4033" },
  { name: "Payne's Grey", hex: "#536878" },
  { name: "Teal", hex: "#008080" },
  { name: "Cyan", hex: "#00B7EB" },
  { name: "Warm Grey", hex: "#A89F91" },
  { name: "Cool Grey", hex: "#8C9AA3" },
  { name: "Titanium White (heavy)", hex: "#FFFFFF" },
];
