export type PaintFinish = "opaque" | "semi" | "transparent";

export type Paint = {
  id: string;
  name: string;
  hex: string;
  finish: PaintFinish;
  /** User-enabled for mixing */
  inPalette: boolean;
  /** Lab calibration offset from feedback */
  labOffset?: { l: number; a: number; b: number };
};

export type RatioPart = {
  paintId: string;
  parts: number;
};

export type MixRecipe = {
  parts: RatioPart[];
  /** Simplified ratio string e.g. "3:1:1" */
  ratioLabel: string;
  predictedHex: string;
  deltaE: number;
  paintCount: number;
};

export type SavedRecipeFile = {
  version: 1;
  savedAt: string;
  name: string;
  targetHex: string;
  baseHex: string;
  coverage: number;
  recipes: MixRecipe[];
  chosenIndex?: number;
  notes?: string;
  feedbackLog?: FeedbackEntry[];
};

export type FeedbackEntry = {
  at: string;
  direction: FeedbackDirection;
  recipeIndex: number;
};

export type FeedbackDirection =
  | "lighter"
  | "darker"
  | "more_red"
  | "less_red"
  | "more_blue"
  | "less_blue"
  | "more_yellow"
  | "less_yellow"
  | "more_green"
  | "less_green";

export type SolverOptions = {
  maxPaints: number;
  minPaints: number;
  coverage: number;
  baseHex: string;
  targetHex: string;
  paints: Paint[];
};
