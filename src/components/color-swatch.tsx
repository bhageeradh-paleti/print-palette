"use client";

import { cn } from "@/lib/utils";

export type SwatchSize = "xs" | "sm" | "md" | "lg" | "xl" | "hero";

const sizeClasses: Record<SwatchSize, string> = {
  xs: "size-5 rounded-md",
  sm: "size-9 rounded-lg",
  md: "size-14 rounded-xl",
  lg: "size-20 rounded-2xl",
  xl: "size-24 rounded-2xl sm:size-28",
  hero: "size-32 rounded-3xl sm:size-36",
};

function safeHex(hex: string): string {
  return /^#[0-9A-Fa-f]{6}$/.test(hex) ? hex : "#888888";
}

type ColorSwatchProps = {
  hex: string;
  size?: SwatchSize;
  label?: string;
  sublabel?: string;
  className?: string;
  checker?: boolean;
};

export function ColorSwatch({
  hex,
  size = "md",
  label,
  sublabel,
  className,
  checker = true,
}: ColorSwatchProps) {
  const color = safeHex(hex);

  return (
    <div className={cn("flex flex-col gap-2.5", className)}>
      <div
        className={cn(
          "relative shrink-0 overflow-hidden ring-1 ring-black/10 shadow-md shadow-black/10",
          sizeClasses[size],
        )}
        title={color}
      >
        {checker ? (
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                "linear-gradient(45deg, #d4d4d4 25%, transparent 25%), linear-gradient(-45deg, #d4d4d4 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #d4d4d4 75%), linear-gradient(-45deg, transparent 75%, #d4d4d4 75%)",
              backgroundSize: "10px 10px",
              backgroundPosition: "0 0, 0 5px, 5px -5px, -5px 0",
            }}
          />
        ) : null}
        <div className="absolute inset-0" style={{ backgroundColor: color }} />
      </div>
      {label ? (
        <div className="min-w-0 space-y-0.5">
          <p className="text-sm font-medium text-foreground">{label}</p>
          {sublabel ? (
            <p className="font-mono text-xs text-muted-foreground">{sublabel}</p>
          ) : null}
        </div>
      ) : sublabel ? (
        <p className="font-mono text-xs text-muted-foreground">{sublabel}</p>
      ) : null}
    </div>
  );
}

type SwatchCompareProps = {
  items: { hex: string; label: string }[];
  className?: string;
  size?: SwatchSize;
};

export function SwatchCompare({ items, className, size = "lg" }: SwatchCompareProps) {
  return (
    <div
      className={cn(
        "grid gap-5 sm:gap-8",
        items.length === 2 && "grid-cols-2",
        items.length === 3 && "grid-cols-3",
        items.length >= 4 && "grid-cols-2 sm:grid-cols-4",
        className,
      )}
    >
      {items.map((item) => (
        <ColorSwatch
          key={item.label}
          hex={item.hex}
          size={size}
          label={item.label}
          sublabel={safeHex(item.hex)}
        />
      ))}
    </div>
  );
}

type MixBarPart = { hex: string; parts: number; name: string };

export function MixRatioBar({ parts, className }: { parts: MixBarPart[]; className?: string }) {
  const total = parts.reduce((s, p) => s + p.parts, 0) || 1;
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex h-12 overflow-hidden rounded-xl ring-1 ring-black/10 sm:h-14">
        {parts.map((p) => (
          <div
            key={p.name}
            className="h-full min-w-[10%] transition-[flex-grow] duration-300"
            style={{
              flexGrow: p.parts,
              backgroundColor: safeHex(p.hex),
            }}
            title={`${p.name} (${p.parts}/${total})`}
          />
        ))}
      </div>
      <div className="flex flex-col gap-3">
        {parts.map((p) => (
          <div
            key={p.name}
            className="flex items-center gap-3 rounded-xl bg-muted/60 px-3 py-2.5"
          >
            <ColorSwatch hex={p.hex} size="sm" checker={false} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{p.name}</p>
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold tabular-nums text-foreground">{p.parts}</span> parts
                · {Math.round((p.parts / total) * 100)}%
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
