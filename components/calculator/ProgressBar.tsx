"use client";

import { calculatorSteps } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import type { StepId } from "@/types/calculator";

export function ProgressBar({ step, onStep }: { step: StepId; onStep: (step: StepId) => void }) {
  return (
    <ol className="flex items-center gap-1">
      {calculatorSteps.map((item, index) => {
        const done = item.id < step;
        const current = item.id === step;
        return (
          <li key={item.id} className="flex min-w-0 flex-1 items-center gap-1">
            <button
              type="button"
              disabled={item.id > step}
              aria-current={current ? "step" : undefined}
              onClick={() => onStep(item.id)}
              className={cn(
                "flex min-w-0 items-center gap-1.5 rounded-md px-1 py-1 text-left text-xs focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest",
                item.id > step ? "cursor-default text-muted/60" : "text-ink",
                current && "font-medium",
              )}
            >
              <span
                className={cn(
                  "grid size-5 shrink-0 place-items-center rounded-full text-[10px]",
                  current && "bg-forest text-white",
                  done && "bg-moss text-ink",
                  item.id > step && "bg-line text-muted",
                )}
              >
                {item.id}
              </span>
              <span className="truncate">{item.short}</span>
            </button>
            {index < calculatorSteps.length - 1 ? (
              <span className={cn("h-px min-w-2 flex-1", done || current ? "bg-brass" : "bg-line")} aria-hidden="true" />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
