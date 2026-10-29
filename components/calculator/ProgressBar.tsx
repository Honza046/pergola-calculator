"use client";

import { calculatorSteps } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import type { StepId } from "@/types/calculator";

export function ProgressBar({ step, onStep }: { step: StepId; onStep: (step: StepId) => void }) {
  return (
    <nav aria-label="Kroky konfigurace" className="w-full">
      <ol className="flex gap-0.5 rounded-sm border border-line bg-moss/50 p-0.5">
        {calculatorSteps.map((item) => {
          const done = item.id < step;
          const current = item.id === step;
          const locked = item.id > step;
          return (
            <li key={item.id} className="min-w-0 flex-1">
              <button
                type="button"
                disabled={locked}
                aria-current={current ? "step" : undefined}
                onClick={() => onStep(item.id)}
                className={cn(
                  "w-full truncate rounded-[3px] px-1 py-1.5 text-center text-[11px] font-medium transition sm:px-2 sm:text-xs",
                  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-forest",
                  current && "bg-forest text-white shadow-[1px_1px_0_rgba(35,72,54,0.2)]",
                  done && "bg-card text-forest hover:bg-white",
                  locked && "cursor-default text-muted/50",
                )}
              >
                {item.short}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
