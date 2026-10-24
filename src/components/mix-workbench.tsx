"use client";

import { useEffect, useMemo, useState } from "react";
import { ColorField } from "@/components/color-field";
import { ColorSwatch, MixRatioBar, SwatchCompare } from "@/components/color-swatch";
import { ImageColorPicker } from "@/components/image-color-picker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  applyFeedbackToRecipePaints,
  downloadRecipeFile,
  loadPalette,
  loadRecipeFile,
  resetPalette,
  savePalette,
} from "@/lib/storage";
import { createDefaultPalette } from "@/lib/matou-palette";
import { buildSteps, solveMixes, suggestBetterPaint } from "@/lib/solver";
import type { FeedbackDirection, MixRecipe, Paint, PaintFinish, SavedRecipeFile } from "@/lib/types";
import { APP_UI_VERSION } from "@/lib/app-version";
import { cn } from "@/lib/utils";

function deltaLabel(d: number): string {
  if (d < 3) return "Excellent";
  if (d < 6) return "Good for tabletop";
  if (d < 10) return "Acceptable";
  return "Rough — tweak or calibrate swatches";
}

export function MixWorkbench() {
  const [paints, setPaints] = useState<Paint[]>(createDefaultPalette);
  const [targetHex, setTargetHex] = useState("#5A8F6E");
  const [baseHex, setBaseHex] = useState("#E8A0BF");
  const [coverage, setCoverage] = useState(0.88);
  const [recipeName, setRecipeName] = useState("mini-mix");
  const [notes, setNotes] = useState("");
  const [selectedRecipe, setSelectedRecipe] = useState(0);

  useEffect(() => {
    setPaints(loadPalette());
  }, []);

  const paintsById = useMemo(() => new Map(paints.map((p) => [p.id, p])), [paints]);

  const recipes = useMemo(
    () =>
      solveMixes({
        paints,
        targetHex,
        baseHex,
        coverage,
        minPaints: 2,
        maxPaints: 3,
      }),
    [paints, targetHex, baseHex, coverage],
  );

  const betterHint = useMemo(() => {
    if (recipes.length === 0) return null;
    const names = new Set(paints.map((p) => p.name.toLowerCase()));
    return suggestBetterPaint(targetHex, names, recipes[0].deltaE);
  }, [recipes, targetHex, paints]);

  const activeRecipe = recipes[selectedRecipe];

  const persistPaints = (next: Paint[]) => {
    setPaints(next);
    savePalette(next);
  };

  const updatePaint = (id: string, patch: Partial<Paint>) => {
    persistPaints(paints.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  };

  const onFeedback = (direction: FeedbackDirection) => {
    if (!activeRecipe) return;
    const ids = activeRecipe.parts.map((p) => p.paintId);
    const next = applyFeedbackToRecipePaints(paints, ids, direction);
    persistPaints(next);
  };

  const saveFile = () => {
    const data: SavedRecipeFile = {
      version: 1,
      savedAt: new Date().toISOString(),
      name: recipeName,
      targetHex,
      baseHex,
      coverage,
      recipes,
      chosenIndex: selectedRecipe,
      notes,
    };
    downloadRecipeFile(data);
  };

  const onLoadFile = async (file: File | null) => {
    if (!file) return;
    try {
      const data = await loadRecipeFile(file);
      setTargetHex(data.targetHex);
      setBaseHex(data.baseHex);
      setCoverage(data.coverage);
      setRecipeName(data.name);
      setNotes(data.notes ?? "");
      setSelectedRecipe(data.chosenIndex ?? 0);
    } catch {
      alert("Could not read recipe file.");
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-10 pb-24 sm:px-6 lg:px-8">
      <header className="space-y-3">
        <p className="ui-kicker">Color Buddy · Matou 24</p>
        <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          Print Paint Mixer
        </h1>
        <p className="ui-subtext max-w-2xl">
          Mix ratios for minis on colored filament — set target and base, then read recipes below.
        </p>
      </header>

      <Tabs defaultValue="mix" className="w-full">
        <TabsList className="mb-2 h-11 w-full max-w-xs rounded-xl bg-muted p-1">
          <TabsTrigger value="mix" className="flex-1 rounded-lg py-2 text-sm font-medium">
            Mix
          </TabsTrigger>
          <TabsTrigger value="palette" className="flex-1 rounded-lg py-2 text-sm font-medium">
            Tubes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="mix" className="mt-8 space-y-8">
          <div className="grid gap-8 lg:grid-cols-2">
            <section className="ui-panel p-6 sm:p-8">
              <h2 className="ui-heading text-xl sm:text-2xl">Target & surface</h2>
              <p className="mt-2 ui-subtext">
                Set the color you want and the plastic already on the model.
              </p>
              <div className="mt-8 space-y-8">
                <ColorField label="Target color" hex={targetHex} onChange={setTargetHex} prominent />
                <ColorField
                  label="Filament / model base"
                  hex={baseHex}
                  onChange={setBaseHex}
                  hint="The plastic color showing through thin paint."
                  prominent
                />
                <div className="space-y-4">
                  <Label className="ui-kicker">
                    Coverage · {Math.round(coverage * 100)}%
                  </Label>
                  <Slider
                    min={0.5}
                    max={0.98}
                    step={0.01}
                    value={[coverage]}
                    onValueChange={(v) => setCoverage(Array.isArray(v) ? (v[0] ?? coverage) : v)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Lower if the base still shifts the hue; higher after solid coats.
                  </p>
                </div>
                <ImageColorPicker onPick={setTargetHex} lastPickedHex={targetHex} />
              </div>
            </section>

            <section className="ui-panel p-6 sm:p-8">
              <h2 className="ui-heading text-xl sm:text-2xl">Recipes</h2>
              <p className="mt-2 ui-subtext">
                Best 2- and 3-paint mixes — volume ratios.
              </p>
              <div className="mt-8 space-y-6">
                {recipes.length === 0 ? (
                  <p className="text-muted-foreground">Enable at least two paints under Tubes.</p>
                ) : (
                  <>
                    <div className="flex flex-wrap gap-3">
                      {recipes.map((r, i) => (
                        <button
                          key={`${r.paintCount}-${r.ratioLabel}-${i}`}
                          type="button"
                          onClick={() => setSelectedRecipe(i)}
                          className={cn(
                            "flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all",
                            selectedRecipe === i
                              ? "border-primary bg-primary text-primary-foreground shadow-md"
                              : "border-border bg-card hover:border-primary/40 hover:bg-muted/50",
                          )}
                        >
                          <MiniRecipeSwatches recipe={r} paintsById={paintsById} />
                          <span className="text-sm font-bold">
                            {r.paintCount} paints
                            <span className="mt-0.5 block font-mono text-xs font-normal opacity-80">
                              ΔE {r.deltaE.toFixed(1)}
                            </span>
                          </span>
                        </button>
                      ))}
                    </div>
                    {activeRecipe ? (
                      <RecipeDetail
                        recipe={activeRecipe}
                        paintsById={paintsById}
                        targetHex={targetHex}
                      />
                    ) : null}
                    {betterHint ? (
                      <div className="flex gap-4 rounded-xl border border-accent-foreground/10 bg-accent/40 p-5">
                        <ColorSwatch hex={betterHint.hex} size="lg" checker={false} />
                        <div className="min-w-0 text-sm">
                          <p className="font-bold">Not in your set: {betterHint.name}</p>
                          <p className="mt-1 text-muted-foreground">{betterHint.reason}</p>
                          <p className="mt-2 font-mono text-xs">{betterHint.hex}</p>
                        </div>
                      </div>
                    ) : null}
                  </>
                )}
              </div>
            </section>
          </div>

          {activeRecipe ? (
            <section className="ui-panel p-6 sm:p-8">
              <h2 className="ui-heading text-xl sm:text-2xl">Adjust & save</h2>
              <p className="mt-2 ui-subtext">
                Nudge the mix; corrections stay on this device.
              </p>
              <div className="mt-8 space-y-6">
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      ["lighter", "Too dark"],
                      ["darker", "Too light"],
                      ["more_red", "More red"],
                      ["more_blue", "More blue"],
                      ["more_yellow", "More yellow"],
                      ["more_green", "More green"],
                    ] as [FeedbackDirection, string][]
                  ).map(([dir, label]) => (
                    <Button
                      key={dir}
                      type="button"
                      variant="secondary"
                      className="rounded-lg font-medium"
                      size="sm"
                      onClick={() => onFeedback(dir)}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="ui-kicker">File name</Label>
                    <Input
                      value={recipeName}
                      onChange={(e) => setRecipeName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label className="ui-kicker">Notes</Label>
                    <Input
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g. 2 thin coats on pink PLA"
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button type="button" size="lg" onClick={saveFile}>
                    Download recipe
                  </Button>
                  <label className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-border bg-background px-5 py-2.5 text-sm font-medium shadow-sm hover:bg-muted">
                    Load recipe
                    <input
                      type="file"
                      accept="application/json,.json"
                      className="hidden"
                      onChange={(e) => onLoadFile(e.target.files?.[0] ?? null)}
                    />
                  </label>
                </div>
              </div>
            </section>
          ) : null}
        </TabsContent>

        <TabsContent value="palette" className="mt-8">
          <section className="ui-panel overflow-hidden">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border p-6 sm:p-8">
              <div>
                <h2 className="ui-heading text-xl sm:text-2xl">Matou 24 tubes</h2>
                <p className="mt-2 ui-subtext max-w-xl">
                  Each tube is a swatch — tune hex from dried paint on your filament.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => persistPaints(resetPalette())}
              >
                Reset defaults
              </Button>
            </div>
            <ul className="grid gap-0 sm:grid-cols-2 lg:grid-cols-3">
              {paints.map((p) => (
                <li
                  key={p.id}
                  className={cn(
                    "flex flex-col gap-4 border-b border-border/60 p-5 sm:flex-row sm:p-6",
                    !p.inPalette && "opacity-45 grayscale-[0.2]",
                  )}
                >
                  <div className="relative shrink-0 self-start">
                    <ColorSwatch hex={p.hex} size="lg" checker />
                    <label className="absolute -bottom-2 -right-2 flex size-8 cursor-pointer items-center justify-center rounded-full border border-border bg-card shadow-sm">
                      <input
                        type="checkbox"
                        checked={p.inPalette}
                        onChange={(e) => updatePaint(p.id, { inPalette: e.target.checked })}
                        className="size-4 accent-foreground"
                        aria-label={`Include ${p.name}`}
                      />
                    </label>
                  </div>
                  <div className="min-w-0 flex-1 space-y-3">
                    <p className="font-semibold leading-tight">{p.name}</p>
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="cursor-pointer">
                        <input
                          type="color"
                          value={/^#[0-9A-Fa-f]{6}$/.test(p.hex) ? p.hex : "#888888"}
                          onChange={(e) => updatePaint(p.id, { hex: e.target.value.toUpperCase() })}
                          className="sr-only"
                        />
                        <span className="text-xs font-medium text-primary underline-offset-2 hover:underline">
                          Adjust swatch
                        </span>
                      </label>
                      <Input
                        className="h-9 max-w-[6.5rem] font-mono text-xs uppercase"
                        value={p.hex}
                        onChange={(e) => updatePaint(p.id, { hex: e.target.value.toUpperCase() })}
                      />
                      <Select
                        value={p.finish}
                        onValueChange={(v) => updatePaint(p.id, { finish: v as PaintFinish })}
                      >
                        <SelectTrigger className="h-9 w-[7.5rem] text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="opaque">Opaque</SelectItem>
                          <SelectItem value="semi">Semi</SelectItem>
                          <SelectItem value="transparent">Transparent</SelectItem>
                        </SelectContent>
                      </Select>
                      {(p.labOffset?.l || p.labOffset?.a || p.labOffset?.b) ? (
                        <Badge variant="secondary" className="font-medium">
                          Tuned
                        </Badge>
                      ) : null}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </TabsContent>
      </Tabs>

      <footer className="text-center">
        <p className="font-mono text-xs text-muted-foreground">
          UI {APP_UI_VERSION} · Hard refresh if styles look old (Ctrl+Shift+R)
        </p>
      </footer>
    </div>
  );
}

function MiniRecipeSwatches({
  recipe,
  paintsById,
}: {
  recipe: MixRecipe;
  paintsById: Map<string, Paint>;
}) {
  return (
    <div className="flex -space-x-2">
      {recipe.parts.map((part) => {
        const paint = paintsById.get(part.paintId);
        return (
          <div
            key={part.paintId}
            className="size-10 rounded-lg ring-1 ring-black/10 shadow-sm"
            style={{ backgroundColor: paint?.hex ?? "#ccc" }}
            title={paint?.name}
          />
        );
      })}
    </div>
  );
}

function RecipeDetail({
  recipe,
  paintsById,
  targetHex,
}: {
  recipe: MixRecipe;
  paintsById: Map<string, Paint>;
  targetHex: string;
}) {
  const steps = buildSteps(recipe, paintsById);
  const barParts = recipe.parts.map((part) => {
    const paint = paintsById.get(part.paintId);
    return {
      hex: paint?.hex ?? "#ccc",
      parts: part.parts,
      name: paint?.name ?? "Unknown",
    };
  });

  return (
    <div className="space-y-8 border-t border-border pt-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <SwatchCompare
          items={[
            { hex: targetHex, label: "Target" },
            { hex: recipe.predictedHex, label: "Predicted" },
          ]}
          className="max-w-xs"
        />
        <Badge variant="secondary" className="px-3 py-1.5 text-sm font-medium">
          {deltaLabel(recipe.deltaE)} · ΔE {recipe.deltaE.toFixed(1)}
        </Badge>
      </div>

      <div>
        <p className="ui-kicker mb-3">Ratio {recipe.ratioLabel}</p>
        <MixRatioBar parts={barParts} />
      </div>

      <ol className="list-decimal space-y-2 pl-5 text-muted-foreground">
        {steps.map((s, i) => (
          <li key={i} className="text-sm leading-relaxed">{s}</li>
        ))}
      </ol>
    </div>
  );
}
