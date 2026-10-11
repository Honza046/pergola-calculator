import {
  structureGroups,
  structureTypes,
  type StructureGroup,
  type StructureType,
} from "@/types/calculator";

/** Addon ids used in CompanyConfig.enabledAddons. */
export const addonIds = [
  "led",
  "screens",
  "screenSides",
  "sensors",
  "heaterPrep",
  "glassWalls",
  "curtains",
] as const;
export type AddonId = (typeof addonIds)[number];

export interface CompanyConfig {
  slug: string;
  companyName: string;
  city: string;
  phone: string;
  email: string;
  logoUrl: string;
  primaryColor: string;
  enabledCategories: StructureGroup[];
  enabledTypes: StructureType[];
  /** Addon keys: led, screens/screenSides, sensors, heaterPrep, glassWalls, curtains */
  enabledAddons: string[];
}

export const DEFAULT_COMPANY_SLUG = "atelier-venku";

const structureGroupSet = new Set<string>(structureGroups);
const structureTypeSet = new Set<string>(structureTypes);

const categoryAliases: Record<string, StructureGroup> = {
  pergola: "pergola",
  pergoly: "pergola",
  pergol: "pergola",
  winter_garden: "winter_garden",
  wintergarden: "winter_garden",
  "zimni-zahrady": "winter_garden",
  "zimni_zahrady": "winter_garden",
  zimnizahrady: "winter_garden",
  "zimní zahrady": "winter_garden",
  "zimni zahrady": "winter_garden",
  carport: "carport",
  carports: "carport",
  pristresky: "carport",
  "přístřešky": "carport",
  "pristresky pro auto": "carport",
  "přístřešky pro auto": "carport",
};

const typeAliases: Record<string, StructureType> = {
  bioclimatic: "bioclimatic",
  bioklimaticka: "bioclimatic",
  "bioklimatická": "bioclimatic",
  "bioklimaticka hlinikova pergola": "bioclimatic",
  glass: "glass",
  zasklena: "glass",
  "zasklená": "glass",
  prosklena: "glass",
  "prosklená": "glass",
  polycarbonate: "polycarbonate",
  polykarbonat: "polycarbonate",
  "polykarbonát": "polycarbonate",
  fixed_roof: "fixed_roof",
  "fixed-roof": "fixed_roof",
  fixni: "fixed_roof",
  "fixní střecha": "fixed_roof",
  "fixni strecha": "fixed_roof",
  fabric_sliding: "fabric_sliding",
  "fabric-sliding": "fabric_sliding",
  "posuvna latka": "fabric_sliding",
  "posuvná látka": "fabric_sliding",
  fabric_rolling: "fabric_rolling",
  "fabric-rolling": "fabric_rolling",
  "rolovaci latka": "fabric_rolling",
  "rolovací látka": "fabric_rolling",
  simple: "simple",
  photovoltaic: "photovoltaic",
  fotovoltaika: "photovoltaic",
  "fotovoltaická": "photovoltaic",
  winter_garden: "winter_garden",
  "winter-garden": "winter_garden",
  sezonni: "winter_garden",
  "sezónní": "winter_garden",
  winter_insulated: "winter_insulated",
  "winter-insulated": "winter_insulated",
  zateplena: "winter_insulated",
  "zateplená": "winter_insulated",
  carport: "carport",
  carbo: "carport",
  carport_trapez: "carport_trapez",
  "carport-trapez": "carport_trapez",
  trapez: "carport_trapez",
  carport_thermo: "carport_thermo",
  "carport-thermo": "carport_thermo",
  thermo: "carport_thermo",
};

const addonAliases: Record<string, string> = {
  led: "led",
  "led osvetleni": "led",
  "led osvětlení": "led",
  screens: "screens",
  screensides: "screenSides",
  screenSides: "screenSides",
  screen: "screens",
  screeny: "screens",
  "screenove rolety": "screens",
  "screenové rolety": "screens",
  sensors: "sensors",
  senzory: "sensors",
  "destove a vetrne senzory": "sensors",
  heaterPrep: "heaterPrep",
  heaterprep: "heaterPrep",
  "heater-prep": "heaterPrep",
  infrazaric: "heaterPrep",
  "příprava na infrazářič": "heaterPrep",
  glassWalls: "glassWalls",
  glasswalls: "glassWalls",
  "glass-walls": "glassWalls",
  proskleni: "glassWalls",
  "posuvné prosklení": "glassWalls",
  curtains: "curtains",
  zavesy: "curtains",
  "textilní závěsy": "curtains",
};

function normalizeKey(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[_/]+/g, " ")
    .replace(/\s+/g, " ");
}

export function mapCategoryAlias(value: string): StructureGroup | null {
  const raw = value.trim();
  if (structureGroupSet.has(raw)) return raw as StructureGroup;
  const key = normalizeKey(raw);
  return categoryAliases[key] ?? categoryAliases[raw.toLowerCase()] ?? null;
}

export function mapTypeAlias(value: string): StructureType | null {
  const raw = value.trim();
  if (structureTypeSet.has(raw)) return raw as StructureType;
  const key = normalizeKey(raw);
  return typeAliases[key] ?? typeAliases[raw.toLowerCase()] ?? null;
}

/** Canonical addon id used in UI filtering (screens covers screenSides). */
export function mapAddonAlias(value: string): string | null {
  const raw = value.trim();
  if (addonIds.includes(raw as AddonId)) {
    return raw === "screenSides" ? "screens" : raw;
  }
  const key = normalizeKey(raw).replace(/\s+/g, " ");
  const mapped = addonAliases[key] ?? addonAliases[raw];
  if (!mapped) return null;
  return mapped === "screenSides" ? "screens" : mapped;
}

export function isAddonEnabled(enabledAddons: string[] | undefined, addon: string) {
  if (!enabledAddons || enabledAddons.length === 0) return true;
  const wanted = mapAddonAlias(addon) ?? addon;
  return enabledAddons.some((item) => {
    const mapped = mapAddonAlias(item);
    if (!mapped) return false;
    if (mapped === wanted) return true;
    // screens ↔ screenSides
    if (
      (wanted === "screens" || wanted === "screenSides") &&
      (mapped === "screens" || mapped === "screenSides")
    ) {
      return true;
    }
    return false;
  });
}

export function slugifyCompanyName(name: string) {
  const base = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return base || "firma";
}

export function normalizeCompanyConfig(input: Partial<CompanyConfig> & { companyName?: string }): CompanyConfig {
  const companyName = (input.companyName ?? "Firma").trim() || "Firma";
  const slug = (input.slug?.trim() || slugifyCompanyName(companyName)).toLowerCase();

  const categories = (input.enabledCategories ?? [])
    .map((item) => mapCategoryAlias(String(item)))
    .filter((item): item is StructureGroup => item != null);
  const types = (input.enabledTypes ?? [])
    .map((item) => mapTypeAlias(String(item)))
    .filter((item): item is StructureType => item != null);
  const addons = (input.enabledAddons ?? [])
    .map((item) => mapAddonAlias(String(item)))
    .filter((item): item is string => item != null);

  const uniqueCategories = [...new Set(categories.length ? categories : [...structureGroups])];
  const uniqueTypes = [...new Set(types.length ? types : [...structureTypes])];
  const uniqueAddons = [
    ...new Set(
      addons.length
        ? addons
        : ["led", "screens", "sensors", "heaterPrep", "glassWalls", "curtains"],
    ),
  ];

  return {
    slug,
    companyName,
    city: (input.city ?? "").trim(),
    phone: (input.phone ?? "").trim(),
    email: (input.email ?? "").trim(),
    logoUrl: (input.logoUrl ?? "").trim(),
    primaryColor: (input.primaryColor ?? "#1a1917").trim() || "#1a1917",
    enabledCategories: uniqueCategories,
    enabledTypes: uniqueTypes,
    enabledAddons: uniqueAddons,
  };
}
