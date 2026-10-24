import {
  applyLabOffset,
  deltaE76,
  finishWeight,
  hexToLab,
  hexToRgb,
  labToHex,
  mixPaintsLinear,
  overlayOnBase,
  rgbToHex,
  simplifyRatios,
} from "./color";
import { REFERENCE_ONLY } from "./matou-palette";
import type { MixRecipe, Paint, SolverOptions } from "./types";

type Combo = Paint[];

function combinations(paints: Paint[], k: number): Combo[] {
  const out: Combo[] = [];
  const n = paints.length;
  if (k > n) return out;
  const idx = Array.from({ length: k }, (_, i) => i);

  const push = () => {
    out.push(idx.map((i) => paints[i]));
  };

  while (true) {
    push();
    let i = k - 1;
    while (i >= 0 && idx[i] === i + n - k) i--;
    if (i < 0) break;
    idx[i]++;
    for (let j = i + 1; j < k; j++) idx[j] = idx[j - 1] + 1;
  }
  return out;
}

function paintLab(p: Paint) {
  return applyLabOffset(p.hex, p.labOffset);
}

function predictHex(
  combo: Combo,
  weights: number[],
  coverage: number,
  baseHex: string,
): string {
  const entries = combo.map((p, i) => ({
    hex: labToHex(paintLab(p)),
    weight: weights[i] * finishWeight(p.finish),
  }));
  const mixed = mixPaintsLinear(entries);
  const onBase = overlayOnBase(mixed, hexToRgb(baseHex), coverage);
  return rgbToHex(onBase);
}

function optimizeWeights(
  combo: Combo,
  targetLab: ReturnType<typeof hexToLab>,
  coverage: number,
  baseHex: string,
): { weights: number[]; deltaE: number; hex: string } {
  const k = combo.length;
  const steps = k <= 2 ? 21 : 11;
  let best = {
    weights: combo.map(() => 1 / k),
    deltaE: Infinity,
    hex: "#000000",
  };

  const grid = (depth: number, weights: number[]): void => {
    if (depth === k - 1) {
      const last = 1 - weights.reduce((a, b) => a + b, 0);
      if (last < 0.02 || last > 0.98) return;
      const w = [...weights, last];
      const hex = predictHex(combo, w, coverage, baseHex);
      const d = deltaE76(hexToLab(hex), targetLab);
      if (d < best.deltaE) best = { weights: w, deltaE: d, hex };
      return;
    }
    for (let i = 0; i <= steps; i++) {
      const v = i / steps;
      if (v > 0.98) continue;
      grid(depth + 1, [...weights, v]);
    }
  };

  grid(0, []);

  // Local refinement
  for (let pass = 0; pass < 8; pass++) {
    let improved = false;
    for (let i = 0; i < k; i++) {
      for (const delta of [-0.03, 0.03]) {
        const w = [...best.weights];
        w[i] = Math.min(0.98, Math.max(0.02, w[i] + delta));
        const sum = w.reduce((a, b) => a + b, 0);
        const scaled = w.map((x) => x / sum);
        const hex = predictHex(combo, scaled, coverage, baseHex);
        const d = deltaE76(hexToLab(hex), targetLab);
        if (d < best.deltaE) {
          best = { weights: scaled, deltaE: d, hex };
          improved = true;
        }
      }
    }
    if (!improved) break;
  }

  return best;
}

function toRecipe(
  combo: Combo,
  weights: number[],
  coverage: number,
  baseHex: string,
  targetLab: ReturnType<typeof hexToLab>,
): MixRecipe {
  const parts = simplifyRatios(weights);
  const total = parts.reduce((a, b) => a + b, 0);
  const normalized = parts.map((p) => p / total);
  const hex = predictHex(combo, normalized, coverage, baseHex);
  const deltaE = deltaE76(hexToLab(hex), targetLab);
  const ratioLabel = parts.join(":");
  return {
    parts: combo.map((p, i) => ({ paintId: p.id, parts: parts[i] })),
    ratioLabel,
    predictedHex: hex,
    deltaE,
    paintCount: combo.length,
  };
}

function rankPaintsByRelevance(paints: Paint[], targetHex: string, limit: number): Paint[] {
  const targetLab = hexToLab(targetHex);
  const scored = paints.map((p) => ({
    p,
    d: deltaE76(paintLab(p), targetLab),
  }));
  scored.sort((a, b) => a.d - b.d);
  const picked = scored.slice(0, limit).map((s) => s.p);
  const must = paints.filter((p) =>
    /white|black/i.test(p.name),
  );
  const ids = new Set(picked.map((p) => p.id));
  for (const m of must) {
    if (!ids.has(m.id)) picked.push(m);
  }
  return picked;
}

export function solveMixes(options: SolverOptions): MixRecipe[] {
  const enabled = options.paints.filter((p) => p.inPalette);
  const active = rankPaintsByRelevance(
    enabled,
    options.targetHex,
    Math.min(16, enabled.length),
  );
  const targetLab = hexToLab(options.targetHex);
  const results: MixRecipe[] = [];

  for (let k = options.minPaints; k <= options.maxPaints; k++) {
    const combos = combinations(active, k);
    let bestForK: MixRecipe | null = null;
    for (const combo of combos) {
      const opt = optimizeWeights(combo, targetLab, options.coverage, options.baseHex);
      const recipe = toRecipe(
        combo,
        opt.weights,
        options.coverage,
        options.baseHex,
        targetLab,
      );
      if (!bestForK || recipe.deltaE < bestForK.deltaE) bestForK = recipe;
    }
    if (bestForK) results.push(bestForK);
  }

  results.sort((a, b) => a.deltaE - b.deltaE);
  return results;
}

export type BetterPaintHint = {
  name: string;
  hex: string;
  deltaEIfSingle: number;
  reason: string;
};

export function suggestBetterPaint(
  targetHex: string,
  ownedNames: Set<string>,
  bestMixDeltaE: number,
): BetterPaintHint | null {
  const targetLab = hexToLab(targetHex);
  let best: BetterPaintHint | null = null;

  for (const ref of REFERENCE_ONLY) {
    if (ownedNames.has(ref.name.toLowerCase())) continue;
    const d = deltaE76(hexToLab(ref.hex), targetLab);
    if (!best || d < best.deltaEIfSingle) {
      const closerThanMix = d < bestMixDeltaE - 2;
      best = {
        name: ref.name,
        hex: ref.hex,
        deltaEIfSingle: d,
        reason: closerThanMix
          ? `A dedicated ${ref.name} tube would likely match closer than your best mix (reference ΔE ${d.toFixed(1)} vs mix ${bestMixDeltaE.toFixed(1)}).`
          : `Your mix is close; ${ref.name} is the nearest common tube not in your set (reference ΔE ${d.toFixed(1)}).`,
      };
    }
  }

  return best;
}

export function buildSteps(
  recipe: MixRecipe,
  paintsById: Map<string, Paint>,
): string[] {
  const items = recipe.parts
    .map((p) => ({
      paint: paintsById.get(p.paintId),
      parts: p.parts,
    }))
    .filter((x) => x.paint && x.parts > 0) as { paint: Paint; parts: number }[];

  items.sort((a, b) => b.parts - a.parts);
  const steps: string[] = [];
  const [first, ...rest] = items;
  steps.push(
    `Put ${first.parts} part${first.parts > 1 ? "s" : ""} of ${first.paint.name} on your mixing surface (ratio base).`,
  );
  for (const item of rest) {
    steps.push(
      `Add ${item.parts} part${item.parts > 1 ? "s" : ""} of ${item.paint.name} and mix until even.`,
    );
  }
  steps.push("Test on a spare bit of the same filament (or model underside) before committing.");
  steps.push("For airbrush: thin until milk-like; ratios stay the same by volume.");
  return steps;
}
