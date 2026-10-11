"use client";

import { X } from "lucide-react";
import { useEffect, useId, useRef } from "react";

import { privacyNotice } from "@/lib/privacy";

export function PrivacyModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement;
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = original;
      if (previous instanceof HTMLElement) previous.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-3 sm:items-center">
      <button
        type="button"
        aria-label="Zavřít"
        className="absolute inset-0 bg-ink/40"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 flex max-h-[min(80dvh,560px)] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-line bg-card shadow-lg"
      >
        <div className="flex items-start justify-between gap-3 border-b border-line px-4 py-3">
          <h2 id={titleId} className="text-base font-semibold tracking-tight">
            {privacyNotice.title}
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Zavřít podmínky"
            className="grid size-8 shrink-0 place-items-center rounded-md border border-line text-ink hover:bg-paper"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="overflow-y-auto px-4 py-3 text-sm leading-relaxed text-ink">
          <p className="text-muted">{privacyNotice.intro}</p>
          <div className="mt-3 space-y-3">
            {privacyNotice.sections.map((section) => (
              <section key={section.heading}>
                <h3 className="font-medium">{section.heading}</h3>
                <p className="mt-0.5 text-muted">{section.body}</p>
              </section>
            ))}
          </div>
        </div>
        <div className="border-t border-line px-4 py-2.5">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-full items-center justify-center rounded-md bg-forest text-sm font-medium text-white hover:bg-forest-deep"
          >
            Rozumím
          </button>
        </div>
      </div>
    </div>
  );
}
