import { calculatePrice } from "@/lib/calculator";
import {
  anchoringCatalog,
  screenSidesLabel,
  selectedAddonLabels,
  structureCatalog,
  timelineCatalog,
} from "@/lib/catalog";
import { formatDateTime, formatPostalInput } from "@/lib/format";
import type { CalculatorDraft, ContactDetails, LeadRequest, LeadResponse } from "@/types/calculator";

export interface ReadyLead {
  leadId: string;
  submittedAt: string;
  source: LeadRequest["source"];
  structureType: LeadRequest["structureType"];
  anchoring: LeadRequest["anchoring"];
  width: number;
  depth: number;
  area: number;
  addons: LeadRequest["addons"];
  city: string;
  postalCode: string;
  timeline: LeadRequest["location"]["timeline"];
  photos: LeadRequest["photos"];
  photoCount: number;
  fullName: string;
  phone: string;
  email: string;
  note: string;
  pageUrl: string;
  referrer: string;
  quote: ReturnType<typeof calculatePrice>;
}

export function buildLeadRequest(input: {
  draft: CalculatorDraft;
  contact: ContactDetails;
  source: LeadRequest["source"];
  pageUrl: string;
  referrer: string;
  hpField: string;
}): LeadRequest {
  if (!input.draft.structureType || !input.draft.anchoring || !input.draft.location.timeline) {
    throw new Error("Kalkulace není kompletní.");
  }

  return {
    structureType: input.draft.structureType,
    anchoring: input.draft.anchoring,
    dimensions: input.draft.dimensions,
    addons: input.draft.addons,
    location: {
      city: input.draft.location.city.trim(),
      postalCode: formatPostalInput(input.draft.location.postalCode),
      timeline: input.draft.location.timeline,
    },
    photos: input.draft.location.photos.slice(0, 2).map((photo) => ({
      name: photo.name.slice(0, 160) || "fotografie.jpg",
      dataUrl: photo.dataUrl,
    })),
    contact: {
      ...input.contact,
      fullName: input.contact.fullName.trim(),
      phone: input.contact.phone.trim().replace(/\s+/g, " "),
      email: input.contact.email.trim(),
      note: input.contact.note.trim(),
    },
    source: input.source,
    pageUrl: input.pageUrl.slice(0, 500),
    referrer: input.referrer.slice(0, 500),
    hpField: input.hpField.slice(0, 200),
  };
}

export function prepareLead(request: LeadRequest): ReadyLead {
  const quote = calculatePrice({
    structureType: request.structureType,
    anchoring: request.anchoring,
    dimensions: request.dimensions,
    addons: request.addons,
  });

  return {
    leadId: makeLeadId(),
    submittedAt: new Date().toISOString(),
    source: request.source,
    structureType: request.structureType,
    anchoring: request.anchoring,
    width: request.dimensions.width,
    depth: request.dimensions.depth,
    area: quote.area,
    addons: request.addons,
    city: request.location.city.trim(),
    postalCode: formatPostalInput(request.location.postalCode),
    timeline: request.location.timeline,
    photos: request.photos,
    photoCount: request.photos.length,
    fullName: request.contact.fullName.trim(),
    phone: request.contact.phone.trim().replace(/\s+/g, " "),
    email: request.contact.email.trim(),
    note: request.contact.note.trim(),
    pageUrl: request.pageUrl,
    referrer: request.referrer,
    quote,
  };
}

export function sheetRow(lead: ReadyLead) {
  return {
    submittedAt: lead.submittedAt,
    leadId: lead.leadId,
    structure: sheetCell(structureCatalog[lead.structureType].title),
    anchoring: sheetCell(anchoringCatalog[lead.anchoring].title),
    widthM: lead.width,
    depthM: lead.depth,
    areaM2: lead.area,
    led: lead.addons.led ? "ano" : "ne",
    screenSides: lead.addons.screenSides,
    sensors: lead.addons.sensors ? "ano" : "ne",
    heaterPrep: lead.addons.heaterPrep ? "ano" : "ne",
    glassWalls: lead.addons.glassWalls ? "ano" : "ne",
    curtains: lead.addons.curtains ? "ano" : "ne",
    city: sheetCell(lead.city),
    postalCode: sheetCell(lead.postalCode),
    timeline: sheetCell(timelineCatalog[lead.timeline].title),
    photoCount: lead.photoCount,
    fullName: sheetCell(lead.fullName),
    phone: sheetCell(lead.phone),
    email: sheetCell(lead.email),
    note: sheetCell(lead.note),
    minPrice: lead.quote.minPrice,
    maxPrice: lead.quote.maxPrice,
    priceLabel: sheetCell(lead.quote.formattedRange),
    source: lead.source,
    pageUrl: sheetCell(lead.pageUrl),
    referrer: sheetCell(lead.referrer),
  };
}

export function leadRecap(lead: ReadyLead) {
  const addons = selectedAddonLabels(lead.addons);
  return [
    ["Číslo poptávky", lead.leadId],
    ["Odesláno", formatDateTime(lead.submittedAt)],
    ["Konstrukce", structureCatalog[lead.structureType].title],
    ["Kotvení", anchoringCatalog[lead.anchoring].title],
    ["Rozměry", `${lead.width} × ${lead.depth} m`],
    ["Plocha", `${lead.area} m²`],
    ["Doplňky", addons.length ? addons.join(", ") : "bez doplňků"],
    ["Screeny", screenSidesLabel(lead.addons.screenSides)],
    ["Město", `${lead.city}, ${lead.postalCode}`],
    ["Termín", timelineCatalog[lead.timeline].title],
    ["Fotografie", String(lead.photoCount)],
    ["Jméno", lead.fullName],
    ["Telefon", lead.phone],
    ["E-mail", lead.email],
    ["Poznámka", lead.note || "—"],
    ["Cena", lead.quote.formattedRange],
    ["Zdroj", lead.source === "embed" ? "widget" : "landing page"],
    ["Stránka", lead.pageUrl || "—"],
  ] as const;
}

export function readLeadResponse(value: unknown): LeadResponse {
  if (typeof value !== "object" || value === null) {
    throw new Error("Poptávku se nepodařilo odeslat. Zkuste to prosím znovu.");
  }
  const record = value as Record<string, unknown>;
  if (record.ok !== true) {
    const message =
      typeof record.message === "string"
        ? record.message
        : "Poptávku se nepodařilo odeslat. Zkuste to prosím znovu.";
    throw new Error(message);
  }
  const quote = record.quote;
  if (
    typeof record.leadId !== "string" ||
    typeof quote !== "object" ||
    quote === null ||
    typeof (quote as { minPrice?: unknown }).minPrice !== "number" ||
    typeof (quote as { maxPrice?: unknown }).maxPrice !== "number" ||
    typeof (quote as { formattedRange?: unknown }).formattedRange !== "string"
  ) {
    throw new Error("Poptávku se nepodařilo odeslat. Zkuste to prosím znovu.");
  }
  const delivery = record.delivery as LeadResponse["delivery"] | undefined;
  return {
    ok: true,
    leadId: record.leadId,
    quote: quote as LeadResponse["quote"],
    delivery: delivery ?? { email: "sent", sheet: "skipped" },
  };
}

function makeLeadId() {
  const token = crypto.randomUUID().replaceAll("-", "").slice(0, 8).toUpperCase();
  return `AV-${token}`;
}

function sheetCell(value: string) {
  const trimmed = value.trim();
  if (/^[=+\-@\t\r]/.test(trimmed)) return `'${trimmed}`;
  return trimmed;
}
