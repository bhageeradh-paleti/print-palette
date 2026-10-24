"use client";

import { ColorSwatch } from "@/components/color-swatch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ColorShortcut } from "@/lib/color-presets";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  hex: string;
  onChange: (hex: string) => void;
  hint?: string;
  prominent?: boolean;
  shortcuts?: ColorShortcut[];
};

function normalizeHex(hex: string): string {
  const h = hex.trim().toUpperCase();
  return /^#[0-9A-F]{6}$/.test(h) ? h : "";
}

export function ColorField({ label, hex, onChange, hint, prominent, shortcuts }: Props) {
  const safe = /^#[0-9A-Fa-f]{6}$/.test(hex) ? hex : "#888888";
  const current = normalizeHex(safe);

  return (
    <div className={cn("space-y-3", prominent && "ui-panel-muted p-4 sm:p-5")}>
      <Label className="ui-kicker">{label}</Label>
      {shortcuts?.length ? (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Quick picks</p>
          <div className="flex flex-wrap gap-1.5" role="list" aria-label={`${label} quick picks`}>
            {shortcuts.map((s) => {
              const selected = current === normalizeHex(s.hex);
              return (
                <button
                  key={`${s.label}-${s.hex}`}
                  type="button"
                  role="listitem"
                  onClick={() => onChange(s.hex.toUpperCase())}
                  className={cn(
                    "size-8 shrink-0 rounded-md ring-1 ring-black/15 shadow-sm transition hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                    selected && "ring-2 ring-primary ring-offset-2",
                  )}
                  style={{ backgroundColor: s.hex }}
                  title={`${s.label} · ${s.hex}`}
                  aria-label={`${s.label}, ${s.hex}`}
                  aria-pressed={selected}
                />
              );
            })}
          </div>
        </div>
      ) : null}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <ColorSwatch hex={safe} size={prominent ? "lg" : "md"} />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <label className="relative cursor-pointer">
              <input
                type="color"
                value={safe}
                onChange={(e) => onChange(e.target.value.toUpperCase())}
                className="absolute inset-0 size-full cursor-pointer opacity-0"
                aria-label={`${label} color picker`}
              />
              <span className="inline-flex h-10 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90">
                Pick color
              </span>
            </label>
            <Input
              value={hex}
              onChange={(e) => {
                let v = e.target.value.trim();
                if (!v.startsWith("#")) v = `#${v}`;
                onChange(v.toUpperCase());
              }}
              className="h-10 min-w-[8rem] flex-1 font-mono text-sm uppercase"
              spellCheck={false}
            />
          </div>
          <p className="font-mono text-xs text-muted-foreground">{safe}</p>
          {hint ? <p className="text-sm text-muted-foreground">{hint}</p> : null}
        </div>
      </div>
    </div>
  );
}
