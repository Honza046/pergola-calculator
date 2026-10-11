"use client";

import { selectedAddonLabels, anchoringCatalog, structureCatalog, timelineCatalog } from "@/lib/catalog";
import { formatArea, formatMeters } from "@/lib/format";
import type { CalculatorDraft, PriceQuote, StepId } from "@/types/calculator";

/** Compact one-line recap for the shell header — jen to, co už uživatel prošel. */
export function SummaryLine({
  draft,
  quote,
  step,
}: {
  draft: CalculatorDraft;
  quote: PriceQuote | null;
  step: StepId;
}) {
  const parts: string[] = [];
  if (draft.structureType) parts.push(structureCatalog[draft.structureType].short);
  if (draft.anchoring) parts.push(anchoringCatalog[draft.anchoring].title);

  if (step >= 2 && quote) {
    parts.push(
      `${formatMeters(draft.dimensions.width)} × ${formatMeters(draft.dimensions.depth)} (${formatArea(quote.area)})`,
    );
  }

  if (step >= 3) {
    const addons = selectedAddonLabels(draft.addons);
    parts.push(addons.length ? addons.join(", ") : "Bez doplňků");
  }

  if (step >= 4) {
    if (draft.location.city) {
      parts.push([draft.location.city, draft.location.postalCode].filter(Boolean).join(", "));
    }
    if (draft.location.timeline) {
      parts.push(timelineCatalog[draft.location.timeline].title);
    }
  }

  if (!parts.length) return <span className="text-muted">Vyberte konstrukci</span>;
  return <span className="truncate">{parts.join(" · ")}</span>;
}

export function SummaryDetails({
  draft,
  quote,
  step,
}: {
  draft: CalculatorDraft;
  quote: PriceQuote | null;
  step: StepId;
  showPrice?: boolean;
}) {
  const structure = draft.structureType ? structureCatalog[draft.structureType] : null;
  const anchoring = draft.anchoring ? anchoringCatalog[draft.anchoring] : null;
  const addons = selectedAddonLabels(draft.addons);

  if (!structure) {
    return <p className="text-sm text-muted">Shrnutí se doplní s výběrem.</p>;
  }

  return (
    <dl className="space-y-1.5 text-sm">
      <Row label="Konstrukce" value={structure.short} />
      {anchoring ? <Row label="Kotvení" value={anchoring.title} /> : null}
      {step >= 2 && quote ? (
        <Row
          label="Rozměry"
          value={`${formatMeters(draft.dimensions.width)} × ${formatMeters(draft.dimensions.depth)} · ${formatArea(quote.area)}`}
        />
      ) : null}
      {step >= 3 ? <Row label="Doplňky" value={addons.length ? addons.join(", ") : "Bez doplňků"} /> : null}
      {step >= 4 && draft.location.city ? (
        <Row label="Místo" value={[draft.location.city, draft.location.postalCode].filter(Boolean).join(", ")} />
      ) : null}
      {step >= 4 && draft.location.timeline ? (
        <Row label="Termín" value={timelineCatalog[draft.location.timeline].title} />
      ) : null}
    </dl>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}
