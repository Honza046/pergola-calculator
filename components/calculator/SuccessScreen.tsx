"use client";

import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { brand } from "@/lib/brand";
import {
  anchoringCatalog,
  priceDisclaimer,
  selectedAddonLabels,
  structureCatalog,
  timelineCatalog,
} from "@/lib/catalog";
import { formatArea, formatMeters } from "@/lib/format";
import type { CalculatorDraft, PriceQuote } from "@/types/calculator";

export function SuccessScreen({
  draft,
  quote,
  leadId,
  demo,
  onReset,
}: {
  draft: CalculatorDraft;
  quote: PriceQuote;
  leadId: string;
  demo: boolean;
  onReset: () => void;
}) {
  const structure = draft.structureType ? structureCatalog[draft.structureType] : null;
  const anchoring = draft.anchoring ? anchoringCatalog[draft.anchoring] : null;
  const addons = selectedAddonLabels(draft.addons);

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-4">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-[3px] bg-moss text-forest shadow-[2px_2px_0_rgba(35,72,54,0.15)]">
          <Check className="size-5" strokeWidth={2.4} />
        </span>
        <div>
          <p className="text-xs font-medium tracking-[0.08em] text-brass uppercase">Poptávka {leadId}</p>
          <h2 className="font-display text-xl font-semibold tracking-tight">Odesláno.</h2>
          <p className="mt-1 text-sm text-muted">
            Ozveme se a domluvíme zaměření zdarma. {brand.responseTime}.
          </p>
        </div>
      </div>

      {demo ? (
        <p className="rounded-lg bg-paper px-3 py-2 text-xs leading-5 text-muted">
          Lokální režim: e-mail ani Sheets nejsou nastavené. Poptávka je v logu serveru.
        </p>
      ) : null}

      <dl className="divide-y divide-line rounded-sm border border-line bg-card text-sm shadow-[2px_2px_0_rgba(35,72,54,0.08)]">
        <Recap label="Konstrukce" value={structure?.short ?? "—"} />
        <Recap label="Kotvení" value={anchoring?.title ?? "—"} />
        <Recap
          label="Rozměry"
          value={`${formatMeters(draft.dimensions.width)} × ${formatMeters(draft.dimensions.depth)} · ${formatArea(quote.area)}`}
        />
        <Recap label="Doplňky" value={addons.length ? addons.join(", ") : "Bez doplňků"} />
        <Recap
          label="Místo"
          value={[draft.location.city, draft.location.postalCode].filter(Boolean).join(", ") || "—"}
        />
        <Recap
          label="Termín"
          value={draft.location.timeline ? timelineCatalog[draft.location.timeline].title : "—"}
        />
        <Recap label="Kontakt" value={`${draft.contact.fullName} · ${draft.contact.phone}`} />
        <Recap label="E-mail" value={draft.contact.email} />
        <Recap label="Cena" value={quote.formattedRange} />
      </dl>

      <p className="text-xs text-muted">{priceDisclaimer}</p>
      <Button variant="secondary" onClick={onReset} className="self-start">
        Nová kalkulace
      </Button>
    </div>
  );
}

function Recap({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 px-3 py-2">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}
