"use client";

import * as Slider from "@radix-ui/react-slider";
import { useEffect, useState } from "react";

import { StepIntro } from "@/components/calculator/fields";
import { fieldClass } from "@/components/calculator/styles";
import { areaSquareMeters, dimensionsConfig } from "@/lib/calculator";
import { cn } from "@/lib/cn";
import { formatArea, formatMeterInput, formatMeters, parseMeterInput } from "@/lib/format";

export function Step2Dimensions({
  width,
  depth,
  onWidth,
  onDepth,
}: {
  width: number;
  depth: number;
  onWidth: (value: number) => void;
  onDepth: (value: number) => void;
}) {
  const area = areaSquareMeters(width, depth);

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <StepIntro
            title="Rozměry"
            hint="Upravte šířku a hloubku posuvníkem nebo číslem. Plocha se počítá hned."
          />
        </div>
        <p className="shrink-0 pt-0.5 text-right text-sm">
          <span className="text-xl font-semibold tracking-tight tabular-nums leading-none text-forest">
            {formatArea(area)}
          </span>
          <span className="mt-0.5 block text-xs tabular-nums text-muted">
            {formatMeters(width)} × {formatMeters(depth)}
          </span>
        </p>
      </div>

      <DimensionControl
        label="Šířka"
        value={width}
        min={dimensionsConfig.width.min}
        max={dimensionsConfig.width.max}
        step={dimensionsConfig.width.step}
        onChange={onWidth}
      />
      <DimensionControl
        label="Hloubka / výsuv"
        value={depth}
        min={dimensionsConfig.depth.min}
        max={dimensionsConfig.depth.max}
        step={dimensionsConfig.depth.step}
        onChange={onDepth}
      />
    </div>
  );
}

function DimensionControl({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) {
  const [text, setText] = useState(formatMeterInput(value));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) setText(formatMeterInput(value));
  }, [focused, value]);

  function commit(raw: string) {
    const parsed = parseMeterInput(raw);
    if (parsed == null) {
      setText(formatMeterInput(value));
      return;
    }
    const next = clamp(parsed, min, max);
    onChange(next);
    setText(formatMeterInput(next));
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-sm font-medium">{label}</p>
        <label className="flex items-center gap-1.5">
          <span className="sr-only">{label} v metrech</span>
          <input
            type="text"
            inputMode="decimal"
            value={text}
            aria-label={`${label} v metrech`}
            className={cn(fieldClass(), "h-9 w-20 px-2 text-right text-base tabular-nums")}
            onFocus={() => setFocused(true)}
            onChange={(event) => {
              const raw = event.target.value;
              if (!/^[\d.,\s]*$/.test(raw)) return;
              setText(raw);
              const parsed = parseMeterInput(raw);
              if (parsed != null && parsed >= min && parsed <= max) onChange(parsed);
            }}
            onBlur={() => {
              setFocused(false);
              commit(text);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.currentTarget.blur();
              }
            }}
          />
          <span className="text-sm text-muted">m</span>
        </label>
      </div>
      <Slider.Root
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={([next]) => onChange(clamp(next ?? value, min, max))}
        aria-label={label}
        className="relative flex h-7 w-full touch-none items-center select-none"
      >
        <Slider.Track className="relative h-1.5 grow rounded-sm bg-line">
          <Slider.Range className="absolute h-full rounded-sm bg-forest" />
        </Slider.Track>
        <Slider.Thumb
          aria-valuetext={formatMeters(value)}
          className="block size-5 rounded-[3px] border-2 border-forest bg-card shadow-[1px_1px_0_rgba(35,72,54,0.25)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
        />
      </Slider.Root>
      <div className="mt-1 flex justify-between text-[11px] text-muted">
        <span>{formatMeters(min)}</span>
        <span>{formatMeters(max)}</span>
      </div>
    </div>
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, Math.round(value * 100) / 100));
}
