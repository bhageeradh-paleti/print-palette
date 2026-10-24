export type Lab = { l: number; a: number; b: number };
export type Rgb = { r: number; g: number; b: number };

export function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n));
}

export function hexToRgb(hex: string): Rgb {
  const h = hex.replace("#", "").trim();
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h.slice(0, 6);
  const n = parseInt(full, 16);
  if (Number.isNaN(n)) return { r: 0.5, g: 0.5, b: 0.5 };
  return {
    r: ((n >> 16) & 255) / 255,
    g: ((n >> 8) & 255) / 255,
    b: (n & 255) / 255,
  };
}

export function rgbToHex(rgb: Rgb): string {
  const toByte = (v: number) =>
    Math.round(clamp01(v) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${toByte(rgb.r)}${toByte(rgb.g)}${toByte(rgb.b)}`.toUpperCase();
}

function srgbToLinear(c: number): number {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function linearToSrgb(c: number): number {
  return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
}

export function rgbToLab(rgb: Rgb): Lab {
  const r = srgbToLinear(rgb.r);
  const g = srgbToLinear(rgb.g);
  const b = srgbToLinear(rgb.b);

  let x = r * 0.4124564 + g * 0.3575761 + b * 0.1804375;
  let y = r * 0.2126729 + g * 0.7151522 + b * 0.072175;
  let z = r * 0.0193339 + g * 0.119192 + b * 0.9503041;

  x /= 0.95047;
  y /= 1.0;
  z /= 1.08883;

  const f = (t: number) =>
    t > 0.008856 ? Math.pow(t, 1 / 3) : 7.787 * t + 16 / 116;

  const fx = f(x);
  const fy = f(y);
  const fz = f(z);

  return {
    l: 116 * fy - 16,
    a: 500 * (fx - fy),
    b: 200 * (fy - fz),
  };
}

export function labToRgb(lab: Lab): Rgb {
  const y = (lab.l + 16) / 116;
  const x = lab.a / 500 + y;
  const z = y - lab.b / 200;

  const inv = (t: number) => {
    const t3 = t * t * t;
    return t3 > 0.008856 ? t3 : (t - 16 / 116) / 7.787;
  };

  let X = inv(x) * 0.95047;
  let Y = inv(y);
  let Z = inv(z) * 1.08883;

  const r = X * 3.2404542 + Y * -1.5371385 + Z * -0.4985314;
  const g = X * -0.969266 + Y * 1.8760108 + Z * 0.041556;
  const b = X * 0.0556434 + Y * -0.2040259 + Z * 1.0572252;

  return {
    r: linearToSrgb(Math.max(0, r)),
    g: linearToSrgb(Math.max(0, g)),
    b: linearToSrgb(Math.max(0, b)),
  };
}

export function hexToLab(hex: string): Lab {
  return rgbToLab(hexToRgb(hex));
}

export function labToHex(lab: Lab): string {
  return rgbToHex(labToRgb(lab));
}

export function deltaE76(a: Lab, b: Lab): number {
  return Math.sqrt(
    (a.l - b.l) ** 2 + (a.a - b.a) ** 2 + (a.b - b.b) ** 2,
  );
}

export function applyLabOffset(hex: string, offset?: { l: number; a: number; b: number }): Lab {
  const lab = hexToLab(hex);
  if (!offset) return lab;
  return {
    l: lab.l + offset.l,
    a: lab.a + offset.a,
    b: lab.b + offset.b,
  };
}

export function finishWeight(finish: "opaque" | "semi" | "transparent"): number {
  switch (finish) {
    case "opaque":
      return 1;
    case "semi":
      return 0.75;
    case "transparent":
      return 0.45;
  }
}

/** Volume-weighted mix in linear RGB (heuristic for opaque acrylics). */
export function mixPaintsLinear(
  entries: { hex: string; weight: number }[],
): Rgb {
  let r = 0;
  let g = 0;
  let b = 0;
  let wSum = 0;
  for (const e of entries) {
    if (e.weight <= 0) continue;
    const rgb = hexToRgb(e.hex);
    const lr = srgbToLinear(rgb.r);
    const lg = srgbToLinear(rgb.g);
    const lb = srgbToLinear(rgb.b);
    r += lr * e.weight;
    g += lg * e.weight;
    b += lb * e.weight;
    wSum += e.weight;
  }
  if (wSum <= 0) return { r: 0.5, g: 0.5, b: 0.5 };
  return {
    r: linearToSrgb(r / wSum),
    g: linearToSrgb(g / wSum),
    b: linearToSrgb(b / wSum),
  };
}

export function overlayOnBase(paint: Rgb, base: Rgb, coverage: number): Rgb {
  const c = clamp01(coverage);
  const pl = {
    r: srgbToLinear(paint.r),
    g: srgbToLinear(paint.g),
    b: srgbToLinear(paint.b),
  };
  const bl = {
    r: srgbToLinear(base.r),
    g: srgbToLinear(base.g),
    b: srgbToLinear(base.b),
  };
  return {
    r: linearToSrgb(pl.r * c + bl.r * (1 - c)),
    g: linearToSrgb(pl.g * c + bl.g * (1 - c)),
    b: linearToSrgb(pl.b * c + bl.b * (1 - c)),
  };
}

export function gcd(a: number, b: number): number {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  while (b) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a || 1;
}

export function simplifyRatios(weights: number[]): number[] {
  const scaled = weights.map((w) => Math.max(1, Math.round(w * 20)));
  let g = scaled[0];
  for (let i = 1; i < scaled.length; i++) g = gcd(g, scaled[i]);
  return scaled.map((s) => Math.max(1, Math.round(s / g)));
}
