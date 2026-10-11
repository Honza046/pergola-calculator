import { createOpenAI } from "@ai-sdk/openai";
import { generateText, Output, type LanguageModel } from "ai";
import { z } from "zod";

import { structureCatalog } from "@/lib/catalog";
import {
  mapAddonAlias,
  mapCategoryAlias,
  mapTypeAlias,
  normalizeCompanyConfig,
  slugifyCompanyName,
  type CompanyConfig,
} from "@/types/company-config";
import { structureGroups, structureTypes, type StructureGroup, type StructureType } from "@/types/calculator";

const llmSchema = z.object({
  companyName: z.string().describe("Oficiální nebo obchodní název firmy"),
  city: z.string().describe("Město sídla nebo hlavní působnosti, pokud je známé"),
  phone: z.string().describe("Telefonní číslo ve formátu +420 …, prázdné pokud není"),
  email: z.string().describe("Kontaktní e-mail, prázdný pokud není"),
  primaryColor: z
    .string()
    .describe("Hex barva značky (#RRGGBB), jinak #1a1917"),
  enabledCategories: z
    .array(z.string())
    .describe("Kategorie: pergola | winter_garden | carport (nebo české aliasy)"),
  enabledTypes: z
    .array(z.string())
    .describe("Anglická ID typů z katalogu, nebo české názvy"),
  enabledAddons: z
    .array(z.string())
    .describe("led, screens, sensors, heaterPrep, glassWalls, curtains"),
  notes: z.string().optional().describe("Krátké zdůvodnění výběru"),
});

export type PageSignals = {
  text: string;
  logoUrl: string;
  ogImage: string;
  favicon: string;
  title: string;
};

export async function fetchPageSignals(url: string): Promise<PageSignals> {
  const target = normalizeHttpUrl(url);
  const jinaUrl = `https://r.jina.ai/${target}`;

  const [textResult, htmlResult] = await Promise.allSettled([
    fetch(jinaUrl, {
      headers: { Accept: "text/plain" },
      signal: AbortSignal.timeout(25_000),
      cache: "no-store",
    }).then(async (res) => {
      if (!res.ok) throw new Error(`Jina fetch failed (${res.status})`);
      return (await res.text()).slice(0, 24_000);
    }),
    fetch(target, {
      headers: {
        Accept: "text/html,application/xhtml+xml",
        "User-Agent": "PergolaCalculatorBot/1.0 (+https://localhost)",
      },
      signal: AbortSignal.timeout(15_000),
      cache: "no-store",
      redirect: "follow",
    }).then(async (res) => {
      if (!res.ok) throw new Error(`HTML fetch failed (${res.status})`);
      return (await res.text()).slice(0, 200_000);
    }),
  ]);

  const text =
    textResult.status === "fulfilled"
      ? textResult.value
      : htmlResult.status === "fulfilled"
        ? stripHtml(htmlResult.value).slice(0, 24_000)
        : "";

  if (!text.trim()) {
    throw new Error("Nepodařilo se načíst obsah stránky.");
  }

  const html = htmlResult.status === "fulfilled" ? htmlResult.value : "";
  const meta = extractMeta(html, target);

  return {
    text,
    logoUrl: meta.logoUrl || meta.favicon || meta.ogImage,
    ogImage: meta.ogImage,
    favicon: meta.favicon,
    title: meta.title,
  };
}

export async function generateCompanyFromPage(
  url: string,
  signals: PageSignals,
): Promise<Omit<CompanyConfig, "slug"> & { suggestedSlug: string }> {
  const catalogHint = structureTypes
    .map((id) => `${id} (${structureCatalog[id].title}, skupina ${structureCatalog[id].group})`)
    .join("; ");

  const { output } = await generateText({
    model: resolveLanguageModel(),
    output: Output.object({ schema: llmSchema }),
    system: `Jsi asistent pro onboarding české firmy vyrábějící/montující pergoly, zimní zahrady a přístřešky.
Z webu vytáhni kontaktní údaje a odhadni, které kategorie, typy konstrukcí a doplňky firma nabízí.
Vždy mapuj na anglická ID z katalogu. Pokud si nejsi jistý, raději zapni běžné pergoly (bioclimatic, polycarbonate, fixed_roof) a LED/screens.
Kategorie: pergola, winter_garden, carport.
Doplňky: led, screens, sensors, heaterPrep, glassWalls, curtains.
Typy: ${catalogHint}`,
    prompt: `URL: ${url}
Titulek: ${signals.title || "(neznámý)"}

Obsah stránky:
${signals.text}`,
  });

  if (!output) {
    throw new Error("Model nevrátil strukturovanou konfiguraci.");
  }

  const categories = uniqueMapped(
    output.enabledCategories,
    mapCategoryAlias,
    [...structureGroups],
  ) as StructureGroup[];

  let types = uniqueMapped(output.enabledTypes, mapTypeAlias, []) as StructureType[];
  if (!types.length) {
    types = structureTypes.filter((id) => categories.includes(structureCatalog[id].group));
  } else {
    types = types.filter((id) => categories.includes(structureCatalog[id].group));
    if (!types.length) {
      types = structureTypes.filter((id) => categories.includes(structureCatalog[id].group));
    }
  }

  const addons = uniqueMapped(output.enabledAddons, mapAddonAlias, [
    "led",
    "screens",
    "sensors",
    "heaterPrep",
    "glassWalls",
    "curtains",
  ]);

  const companyName = output.companyName.trim() || signals.title.trim() || "Firma";
  const config = normalizeCompanyConfig({
    companyName,
    city: output.city,
    phone: output.phone,
    email: output.email,
    logoUrl: signals.logoUrl,
    primaryColor: sanitizeHex(output.primaryColor),
    enabledCategories: categories,
    enabledTypes: types,
    enabledAddons: addons,
  });

  return {
    ...config,
    suggestedSlug: slugifyCompanyName(companyName),
  };
}

function resolveLanguageModel(): LanguageModel | string {
  if (process.env.AI_GATEWAY_API_KEY) {
    return "openai/gpt-4o-mini";
  }
  if (process.env.OPENAI_API_KEY) {
    return createOpenAI({ apiKey: process.env.OPENAI_API_KEY })("gpt-4o-mini");
  }
  throw new Error("Chybí AI_GATEWAY_API_KEY nebo OPENAI_API_KEY.");
}

function uniqueMapped<T extends string>(
  values: string[],
  map: (value: string) => T | null,
  fallback: T[],
): T[] {
  const out = [...new Set(values.map(map).filter((item): item is T => item != null))];
  return out.length ? out : fallback;
}

function sanitizeHex(value: string) {
  const match = value.trim().match(/^#?[0-9a-fA-F]{6}$/);
  if (!match) return "#1a1917";
  return value.startsWith("#") ? value : `#${value}`;
}

export function normalizeHttpUrl(raw: string) {
  const trimmed = raw.trim();
  if (!trimmed) throw new Error("Zadejte URL webu klienta.");
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  let parsed: URL;
  try {
    parsed = new URL(withProtocol);
  } catch {
    throw new Error("Neplatná URL.");
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("Povolené jsou jen http/https URL.");
  }
  return parsed.toString();
}

function stripHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractMeta(html: string, pageUrl: string) {
  const title = matchContent(html, /<title[^>]*>([^<]*)<\/title>/i);
  const ogImage =
    matchAttr(html, /property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ||
    matchAttr(html, /content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
  const icon =
    matchAttr(html, /rel=["'](?:shortcut )?icon["'][^>]*href=["']([^"']+)["']/i) ||
    matchAttr(html, /href=["']([^"']+)["'][^>]*rel=["'](?:shortcut )?icon["']/i) ||
    matchAttr(html, /rel=["']apple-touch-icon["'][^>]*href=["']([^"']+)["']/i);
  const logoGuess =
    matchAttr(html, /(?:class|id)=["'][^"']*logo[^"']*["'][^>]*src=["']([^"']+)["']/i) ||
    matchAttr(html, /src=["']([^"']+)["'][^>]*(?:class|id)=["'][^"']*logo[^"']*["']/i);

  return {
    title: decodeEntities(title),
    ogImage: absolutize(ogImage, pageUrl),
    favicon: absolutize(icon || "/favicon.ico", pageUrl),
    logoUrl: absolutize(logoGuess, pageUrl),
  };
}

function matchContent(html: string, re: RegExp) {
  return html.match(re)?.[1]?.trim() ?? "";
}

function matchAttr(html: string, re: RegExp) {
  return html.match(re)?.[1]?.trim() ?? "";
}

function absolutize(value: string, base: string) {
  if (!value) return "";
  try {
    return new URL(value, base).toString();
  } catch {
    return "";
  }
}

function decodeEntities(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}
