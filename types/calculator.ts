export const structureGroups = ["pergola", "winter_garden", "carport"] as const;
export type StructureGroup = (typeof structureGroups)[number];

export const structureTypes = [
  "bioclimatic",
  "glass",
  "polycarbonate",
  "fixed_roof",
  "fabric_sliding",
  "fabric_rolling",
  "simple",
  "photovoltaic",
  "winter_garden",
  "winter_insulated",
  "carport",
  "carport_trapez",
  "carport_thermo",
] as const;
export type StructureType = (typeof structureTypes)[number];

export const anchoringTypes = ["wall", "freestanding"] as const;
export type Anchoring = (typeof anchoringTypes)[number];

export const timelines = ["asap", "within_3_months", "next_year"] as const;
export type Timeline = (typeof timelines)[number];

export const stepIds = [1, 2, 3, 4, 5] as const;
export type StepId = (typeof stepIds)[number];

export const sources = ["landing", "embed"] as const;
export type CalculatorSource = (typeof sources)[number];

export type ScreenSides = 0 | 1 | 2 | 3;

/** Rozměry v metrech. */
export interface Dimensions {
  /** Šířka, povolený rozsah 3–8 m. */
  width: number;
  /** Hloubka / výsuv, povolený rozsah 2,5–5 m. */
  depth: number;
}

export interface Addons {
  led: boolean;
  screenSides: ScreenSides;
  sensors: boolean;
  heaterPrep: boolean;
  glassWalls: boolean;
  curtains: boolean;
}

export interface DraftPhoto {
  id: string;
  name: string;
  dataUrl: string;
}

export interface LeadPhoto {
  name: string;
  dataUrl: string;
}

export interface LocationDetails {
  city: string;
  postalCode: string;
  timeline: Timeline | null;
  photos: DraftPhoto[];
}

export interface ContactDetails {
  fullName: string;
  phone: string;
  email: string;
  note: string;
  consent: boolean;
}

export interface CalculatorDraft {
  structureType: StructureType | null;
  anchoring: Anchoring | null;
  dimensions: Dimensions;
  addons: Addons;
  location: LocationDetails;
  contact: ContactDetails;
}

/** Konfigurace, ze které už jde spočítat pásmo. */
export interface PricedConfiguration {
  structureType: StructureType;
  anchoring: Anchoring;
  dimensions: Dimensions;
  addons: Addons;
}

export interface PriceLine {
  id: string;
  label: string;
  min: number;
  max: number;
}

export interface PriceQuote {
  area: number;
  minPrice: number;
  maxPrice: number;
  /** Např. „165 000 – 195 000 Kč bez DPH“. */
  formattedRange: string;
  lines: PriceLine[];
}

export interface LeadRequest {
  structureType: StructureType;
  anchoring: Anchoring;
  dimensions: Dimensions;
  addons: Addons;
  location: {
    city: string;
    postalCode: string;
    timeline: Timeline;
  };
  photos: LeadPhoto[];
  contact: ContactDetails;
  source: CalculatorSource;
  pageUrl: string;
  referrer: string;
  hpField: string;
}

export interface LeadResponse {
  ok: true;
  leadId: string;
  quote: PriceQuote;
  delivery: {
    email: "sent" | "partial" | "skipped" | "failed";
    sheet: "sent" | "skipped" | "failed";
  };
}
