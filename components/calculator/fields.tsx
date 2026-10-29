import type { ReactNode } from "react";

export function StepIntro({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="mb-0.5">
      <h2 className="font-display text-lg font-semibold tracking-tight">{title}</h2>
      <p className="text-[11px] leading-snug text-muted">{hint}</p>
    </div>
  );
}

export function Field({
  id,
  label,
  error,
  hint,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-xs font-medium text-ink">
        {label}
      </label>
      {children}
      {hint && !error ? <p className="text-xs text-muted">{hint}</p> : null}
      {error ? (
        <p id={`${id}-error`} className="text-xs text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
