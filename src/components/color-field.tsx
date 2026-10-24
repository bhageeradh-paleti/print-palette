"use client";

import { ColorSwatch } from "@/components/color-swatch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  hex: string;
  onChange: (hex: string) => void;
  hint?: string;
  prominent?: boolean;
};

export function ColorField({ label, hex, onChange, hint, prominent }: Props) {
  const safe = /^#[0-9A-Fa-f]{6}$/.test(hex) ? hex : "#888888";

  return (
    <div className={cn("space-y-3", prominent && "ui-panel-muted p-4 sm:p-5")}>
      <Label className="ui-kicker">{label}</Label>
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
