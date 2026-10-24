export type ColorShortcut = { label: string; hex: string };

/** Common miniature / paint target hues — starting points before fine-tuning. */
export const TARGET_COLOR_SHORTCUTS: ColorShortcut[] = [
  { label: "Olive", hex: "#6B705C" },
  { label: "Forest", hex: "#228B22" },
  { label: "Navy", hex: "#1B2838" },
  { label: "Sky", hex: "#87CEEB" },
  { label: "Teal", hex: "#008080" },
  { label: "Blood red", hex: "#8B0000" },
  { label: "Burgundy", hex: "#722F37" },
  { label: "Gold", hex: "#D4AF37" },
  { label: "Rust", hex: "#B7410E" },
  { label: "Leather", hex: "#8B5A2B" },
  { label: "Bone", hex: "#E8DCC4" },
  { label: "Skin", hex: "#D4A574" },
  { label: "Lavender", hex: "#B57EDC" },
  { label: "Charcoal", hex: "#36454F" },
  { label: "Off-white", hex: "#F5F2EA" },
  { label: "Black", hex: "#1C1917" },
];

/** Typical 3D-print filament colors — shortcuts for the plastic base. */
export const FILAMENT_COLOR_SHORTCUTS: ColorShortcut[] = [
  { label: "White", hex: "#F8F8F6" },
  { label: "Black", hex: "#0D0D0D" },
  { label: "Grey", hex: "#7A7A7A" },
  { label: "Natural", hex: "#E8DCC8" },
  { label: "Red", hex: "#C41E3A" },
  { label: "Orange", hex: "#FF6F3C" },
  { label: "Yellow", hex: "#FFD23F" },
  { label: "Green", hex: "#2D6A4F" },
  { label: "Blue", hex: "#2563EB" },
  { label: "Purple", hex: "#7C3AED" },
  { label: "Pink", hex: "#EC4899" },
  { label: "Brown", hex: "#6B4423" },
  { label: "Tan", hex: "#C4A574" },
  { label: "Silver", hex: "#B8B8B8" },
  { label: "Transparent clear", hex: "#D8E8E8" },
];
