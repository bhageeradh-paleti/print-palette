"use client";

import { useCallback, useRef, useState } from "react";
import { ColorSwatch } from "@/components/color-swatch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type Props = {
  onPick: (hex: string) => void;
  lastPickedHex?: string;
};

export function ImageColorPicker({ onPick, lastPickedHex }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [picked, setPicked] = useState(false);

  const onFile = (file: File | null) => {
    if (!file) return;
    setSrc(URL.createObjectURL(file));
    setPicked(false);
  };

  const drawImage = useCallback((img: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const maxW = 560;
    const scale = Math.min(1, maxW / img.width);
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  }, []);

  const pickAt = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(((clientX - rect.left) / rect.width) * canvas.width);
    const y = Math.floor(((clientY - rect.top) / rect.height) * canvas.height);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const data = ctx.getImageData(x, y, 1, 1).data;
    const hex = `#${[data[0], data[1], data[2]]
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")}`.toUpperCase();
    setPicked(true);
    onPick(hex);
  };

  return (
    <div className="ui-panel-muted space-y-4 p-4 sm:p-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <Label className="ui-kicker">Reference image</Label>
        {lastPickedHex && picked ? (
          <ColorSwatch hex={lastPickedHex} size="sm" label="Sampled" sublabel={lastPickedHex} />
        ) : null}
      </div>
      <input
        type="file"
        accept="image/*"
        className="block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-foreground hover:file:bg-primary/90"
        onChange={(e) => onFile(e.target.files?.[0] ?? null)}
      />
      {src ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt=""
            className="hidden"
            onLoad={(e) => drawImage(e.currentTarget)}
          />
          <canvas
            ref={canvasRef}
            className="max-w-full cursor-crosshair rounded-xl ring-1 ring-black/10 shadow-md"
            onClick={(e) => pickAt(e.clientX, e.clientY)}
          />
          <p className="text-sm text-muted-foreground">
            Click anywhere on the image to set your target color.
          </p>
        </>
      ) : (
        <p className="text-sm text-muted-foreground">
          Upload a photo or screenshot of your reference.
        </p>
      )}
      {src ? (
        <Button type="button" variant="outline" size="sm" onClick={() => setSrc(null)}>
          Remove image
        </Button>
      ) : null}
    </div>
  );
}
