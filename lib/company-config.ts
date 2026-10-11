import type { CSSProperties } from "react";

import { brand } from "@/lib/brand";
import { structureCatalog } from "@/lib/catalog";
import {
  DEFAULT_COMPANY_SLUG,
  isAddonEnabled,
  normalizeCompanyConfig,
  type CompanyConfig,
} from "@/types/company-config";
import {
  structureGroups,
  structureTypes,
  type StructureGroup,
  type StructureType,
} from "@/types/calculator";

export { isAddonEnabled, DEFAULT_COMPANY_SLUG };
export type { CompanyConfig };

export function defaultCompanyConfig(): CompanyConfig {
  return normalizeCompanyConfig({
    slug: DEFAULT_COMPANY_SLUG,
    companyName: brand.name,
    city: brand.city,
    phone: brand.phoneDisplay,
    email: brand.email,
    logoUrl: "",
    primaryColor: "#1a1917",
    enabledCategories: [...structureGroups],
    enabledTypes: [...structureTypes],
    enabledAddons: ["led", "screens", "sensors", "heaterPrep", "glassWalls", "curtains"],
  });
}

export function resolveCompanyConfig(config?: CompanyConfig | null): CompanyConfig {
  return config ? normalizeCompanyConfig(config) : defaultCompanyConfig();
}

export function phoneToHref(phone: string) {
  const digits = phone.replace(/[^\d+]/g, "");
  return digits ? `tel:${digits}` : "#";
}

export function brandThemeStyle(config: CompanyConfig): CSSProperties {
  const color = config.primaryColor || "#1a1917";
  return {
    ["--forest" as string]: color,
    ["--forest-deep" as string]: color,
  };
}

export function filterGroupsByConfig(config: CompanyConfig): StructureGroup[] {
  const enabled = new Set(config.enabledCategories);
  const groups = structureGroups.filter((group) => enabled.has(group));
  return groups.length ? groups : [...structureGroups];
}

export function filterTypesByConfig(config: CompanyConfig, group?: StructureGroup): StructureType[] {
  const enabledTypes = new Set(config.enabledTypes);
  const enabledGroups = new Set(filterGroupsByConfig(config));
  const types = structureTypes.filter((type) => {
    if (!enabledTypes.has(type)) return false;
    if (!enabledGroups.has(structureCatalog[type].group)) return false;
    if (group && structureCatalog[type].group !== group) return false;
    return true;
  });
  if (types.length) return types;
  // Fallback: all types in enabled groups
  return structureTypes.filter((type) => {
    if (!enabledGroups.has(structureCatalog[type].group)) return false;
    if (group && structureCatalog[type].group !== group) return false;
    return true;
  });
}
