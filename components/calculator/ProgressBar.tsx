"use client";

import { calculatorSteps } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import type { StepId } from "@/types/calculator";

export function ProgressBar({ step, onStep }: { step: StepId; onStep: (step: StepId) => void }) {
  return (
    <ol className="flex w-full items-center">
      {calculatorSteps.map((item, index) => {
        const done = item.id < step;
        const current = item.id === step;
        const last = index === calculatorSteps.length - 1;
        return (
          <li key={item.id} className={cn("flex min-w-0 items-center", !last && "flex-1")}>
            <button
              type="button"
              disabled={item.id > step}
              aria-current={current ? "step" : undefined}
              onClick={() => onStep(item.id)}
              className={cn(
                "flex min-w-0 shrink-0 items-center gap-1.5 rounded-sm px-0.5 py-0.5 text-xs focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest",
                item.id > step ? "cursor-default text-muted/55" : "text-ink",
                current && "font-medium",
              )}
            >
              <span
                className={cn(
                  "grid size-5 shrink-0 place-items-center rounded-[3px] text-[10px] tabular-nums transition-colors",
                  current && "bg-forest text-white",
                  done && "bg-moss text-forest",
                  item.id > step && "border border-line bg-card text-muted",
                )}
              >
                {item.id}
              </span>
              <span className="max-w-[4.5rem] truncate tracking-tight sm:max-w-none">{item.short}</span>
            </button>
            {!last ? (
              <span
                className={cn(
                  "mx-1 h-px min-w-2 flex-1 transition-colors",
                  done || current ? "bg-forest/45" : "bg-line",
                )}
                aria-hidden="true"
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
