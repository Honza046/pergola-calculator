"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { SummaryLine } from "@/components/calculator/CalculatorSummary";
import { ProgressBar } from "@/components/calculator/ProgressBar";
import { Step1Type } from "@/components/calculator/Step1Type";
import { Step2Dimensions } from "@/components/calculator/Step2Dimensions";
import { Step3Addons } from "@/components/calculator/Step3Addons";
import { Step4Location } from "@/components/calculator/Step4Location";
import { Step5Contact } from "@/components/calculator/Step5Contact";
import { SuccessScreen } from "@/components/calculator/SuccessScreen";
import { Button } from "@/components/ui/button";
import { tryCalculatePrice } from "@/lib/calculator";
import { brand } from "@/lib/brand";
import { initialDraft } from "@/lib/draft";
import { formatCzkSpan } from "@/lib/format";
import { buildLeadRequest, readLeadResponse } from "@/lib/lead";
import { issuesByField, locationSchema } from "@/lib/schemas";
import { widgetMessageSource } from "@/lib/widget";
import type { Anchoring, CalculatorDraft, ContactDetails, StepId, StructureType } from "@/types/calculator";

const nextLabels: Record<StepId, string> = {
  1: "Další",
  2: "Další",
  3: "Další",
  4: "Zobrazit cenu",
  5: "Odeslat poptávku",
};

export function Calculator({ variant = "landing" }: { variant?: "landing" | "embed" }) {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const opened = useRef(false);
  const [step, setStep] = useState<StepId>(1);
  const [direction, setDirection] = useState(1);
  const [draft, setDraft] = useState<CalculatorDraft>(initialDraft);
  const [showErrors, setShowErrors] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submission, setSubmission] = useState<{
    draft: CalculatorDraft;
    leadId: string;
    quote: NonNullable<ReturnType<typeof tryCalculatePrice>>;
    demo: boolean;
  } | null>(null);

  const quote = useMemo(
    () =>
      tryCalculatePrice({
        structureType: draft.structureType,
        anchoring: draft.anchoring,
        dimensions: draft.dimensions,
        addons: draft.addons,
      }),
    [draft.addons, draft.anchoring, draft.dimensions, draft.structureType],
  );

  const locationParsed = locationSchema.safeParse({
    city: draft.location.city,
    postalCode: draft.location.postalCode,
    timeline: draft.location.timeline ?? undefined,
  });
  const locationErrors =
    showErrors && !locationParsed.success ? issuesByField(locationParsed.error) : {};

  const flowError =
    submitError ||
    (showErrors && step === 4 && !locationParsed.success ? "Doplňte město, PSČ a termín." : null);

  const updateContact = useCallback((contact: ContactDetails) => {
    setDraft((current) => ({ ...current, contact }));
  }, []);

  useEffect(() => {
    if (variant !== "embed") return;
    const post = () => {
      const height = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
      window.parent.postMessage({ source: widgetMessageSource, type: "resize", height }, "*");
    };
    post();
    const observer = new ResizeObserver(post);
    observer.observe(document.body);
    return () => observer.disconnect();
  }, [variant, step, submission, showErrors]);

  useEffect(() => {
    if (!opened.current) {
      opened.current = true;
      return;
    }
    panelRef.current?.focus({ preventScroll: true });
  }, [step, submission]);

  function goTo(next: StepId) {
    setDirection(next > step ? 1 : -1);
    setShowErrors(false);
    setSubmitError(null);
    setStep(next);
  }

  function continueFlow() {
    if (step === 1 && (!draft.structureType || !draft.anchoring)) {
      setShowErrors(true);
      return;
    }
    if (step === 4 && !locationParsed.success) {
      setShowErrors(true);
      const key = String(locationParsed.error.issues[0]?.path[0] ?? "city");
      const id = key === "postalCode" ? "postal-code" : key === "timeline" ? "timeline-asap" : "location-city";
      document.getElementById(id)?.focus();
      return;
    }
    if (step < 5) goTo((step + 1) as StepId);
  }

  async function submit(contact: ContactDetails, hpField: string) {
    if (submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    const nextDraft = { ...draft, contact };
    setDraft(nextDraft);
    try {
      const payload = buildLeadRequest({
        draft: nextDraft,
        contact,
        source: variant === "embed" ? "embed" : "landing",
        pageUrl: window.location.href,
        referrer: document.referrer,
        hpField,
      });
      const response = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        cache: "no-store",
      });
      let body: unknown = null;
      try {
        body = await response.json();
      } catch {
        throw new Error("Poptávku se nepodařilo odeslat. Zkuste to prosím znovu.");
      }
      const data = readLeadResponse(body);
      if (variant === "embed" && window.parent !== window) {
        window.parent.postMessage(
          { source: widgetMessageSource, type: "lead", leadId: data.leadId },
          "*",
        );
      }
      setSubmission({
        draft: nextDraft,
        leadId: data.leadId,
        quote: data.quote,
        demo: data.delivery.email === "skipped",
      });
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Poptávku se nepodařilo odeslat.");
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setDraft(initialDraft);
    setStep(1);
    setDirection(-1);
    setShowErrors(false);
    setSubmitError(null);
    setSubmission(null);
  }

  const priceLabel = quote ? formatCzkSpan(quote.minPrice, quote.maxPrice) : "—";
  const shell = variant === "landing";

  return (
    <section ref={sectionRef} id={shell ? "kalkulacka" : undefined} className="w-full">
      {variant === "embed" ? (
        <p className="pb-1.5 text-center text-[11px] text-muted">
          Orientační kalkulace · {brand.name}
        </p>
      ) : null}

      <div className="rounded-xl border border-line bg-card">
        {submission ? (
          <div className="p-4 sm:p-5">
            <SuccessScreen
              draft={submission.draft}
              quote={submission.quote}
              leadId={submission.leadId}
              demo={submission.demo}
              onReset={reset}
            />
          </div>
        ) : (
          <>
            <div className="border-b border-line px-3 py-1.5 sm:px-3.5">
              <ProgressBar step={step} onStep={(next) => next < step && goTo(next)} />
              <div className="mt-1 flex items-baseline justify-between gap-3">
                <p className="min-w-0 truncate text-xs text-muted">
                  <SummaryLine draft={draft} quote={quote} step={step} />
                </p>
                {step >= 5 && quote ? (
                  <p className="shrink-0 text-right">
                    <span className="block text-[10px] tracking-wide text-muted uppercase">bez DPH</span>
                    <span className="text-sm font-medium tabular-nums leading-none sm:text-base">
                      {priceLabel}
                    </span>
                  </p>
                ) : (
                  <p className="shrink-0 text-right text-[11px] text-muted">Cena na konci</p>
                )}
              </div>
            </div>

            <div className="px-3 py-1.5 sm:px-3.5">
              <AnimatePresence mode="wait" initial={false} custom={direction}>
                <motion.div
                  key={step}
                  ref={panelRef}
                  tabIndex={-1}
                  role="region"
                  aria-label={nextLabels[step]}
                  custom={direction}
                  variants={
                    reduceMotion
                      ? {
                          enter: { opacity: 0 },
                          center: { opacity: 1 },
                          exit: { opacity: 0 },
                        }
                      : {
                          enter: (value: number) => ({ opacity: 0, x: value * 16 }),
                          center: { opacity: 1, x: 0 },
                          exit: (value: number) => ({ opacity: 0, x: value * -16 }),
                        }
                  }
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: reduceMotion ? 0.01 : 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className="outline-none"
                >
                  {step === 1 ? (
                    <Step1Type
                      structureType={draft.structureType}
                      anchoring={draft.anchoring}
                      showErrors={showErrors}
                      onStructureType={(structureType: StructureType | null) => {
                        setShowErrors(false);
                        setDraft((current) => ({ ...current, structureType }));
                      }}
                      onAnchoring={(anchoring: Anchoring | null) => {
                        setShowErrors(false);
                        setDraft((current) => ({ ...current, anchoring }));
                      }}
                    />
                  ) : null}
                  {step === 2 ? (
                    <Step2Dimensions
                      width={draft.dimensions.width}
                      depth={draft.dimensions.depth}
                      onWidth={(width) =>
                        setDraft((current) => ({
                          ...current,
                          dimensions: { ...current.dimensions, width },
                        }))
                      }
                      onDepth={(depth) =>
                        setDraft((current) => ({
                          ...current,
                          dimensions: { ...current.dimensions, depth },
                        }))
                      }
                    />
                  ) : null}
                  {step === 3 ? (
                    <Step3Addons
                      addons={draft.addons}
                      onChange={(addons) => setDraft((current) => ({ ...current, addons }))}
                    />
                  ) : null}
                  {step === 4 ? (
                    <Step4Location
                      location={draft.location}
                      errors={locationErrors}
                      onChange={(location) => {
                        setShowErrors(false);
                        setDraft((current) => ({ ...current, location }));
                      }}
                    />
                  ) : null}
                  {step === 5 && quote ? (
                    <Step5Contact
                      contact={draft.contact}
                      quote={quote}
                      structureType={draft.structureType}
                      onContactChange={updateContact}
                      onSubmit={submit}
                    />
                  ) : null}
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="border-t border-line px-3 py-1.5 sm:px-3.5">
              {flowError ? (
                <p role="alert" className="mb-1 text-xs text-danger">
                  {flowError}
                </p>
              ) : null}
              <div className="flex items-center gap-2">
                {step > 1 ? (
                  <Button variant="secondary" onClick={() => goTo((step - 1) as StepId)} className="h-9 w-20">
                    Zpět
                  </Button>
                ) : null}
                {step === 5 ? (
                  <Button
                    type="submit"
                    form="lead-form"
                    disabled={submitting}
                    className="h-9 min-h-9 flex-1 whitespace-normal py-1.5 leading-snug"
                  >
                    {submitting ? "Odesíláme…" : nextLabels[5]}
                  </Button>
                ) : (
                  <Button onClick={continueFlow} className="h-9 flex-1">
                    {nextLabels[step]}
                  </Button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
