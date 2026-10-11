import { z } from "zod";

import { dimensionsConfig } from "@/lib/calculator";
import type { LeadRequest } from "@/types/calculator";
import { anchoringTypes, sources, structureTypes, timelines } from "@/types/calculator";

const czechPhone = /^(\+420)?\d{9}$/;
const postalCode = /^\d{3}\s?\d{2}$/;
const cityPattern = /^[\p{L}\d\s.'-]{2,80}$/u;
const photoDataUrl = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/;

function enumSchema<T extends string>(values: readonly T[], message: string) {
  return z.enum(values as unknown as [T, ...T[]], {
    errorMap: () => ({ message }),
  });
}

export const contactSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(3, "Uveďte jméno a příjmení.")
    .max(80, "Jméno je příliš dlouhé.")
    .refine((value) => value.split(/\s+/).filter(Boolean).length >= 2, "Uveďte jméno i příjmení."),
  phone: z
    .string()
    .trim()
    .refine(
      (value) => czechPhone.test(value.replace(/\s+/g, "")),
      "Zadejte telefon, například 777 123 456.",
    ),
  email: z.string().trim().email("Zadejte e-mail ve tvaru jmeno@domena.cz.").max(120),
  note: z.string().trim().max(1000, "Poznámka je příliš dlouhá."),
  consent: z.boolean().refine((value) => value, {
    message: "Pro odeslání je potřeba souhlas se zpracováním údajů.",
  }),
});

export type ContactFormValues = z.infer<typeof contactSchema>;

export const locationSchema = z.object({
  city: z
    .string()
    .trim()
    .min(2, "Uveďte město montáže.")
    .max(80, "Název města je příliš dlouhý.")
    .regex(cityPattern, "Uveďte město montáže."),
  postalCode: z
    .string()
    .trim()
    .refine((value) => postalCode.test(value), "PSČ má mít 5 číslic, například 602 00."),
  timeline: enumSchema(timelines, "Vyberte termín realizace."),
});

export const leadSchema = z.object({
  structureType: enumSchema(structureTypes, "Vyberte typ konstrukce."),
  anchoring: enumSchema(anchoringTypes, "Vyberte způsob kotvení."),
  dimensions: z.object({
    width: z
      .number({ invalid_type_error: "Chybí šířka." })
      .min(dimensionsConfig.width.min, `Šířka musí být aspoň ${dimensionsConfig.width.min} m.`)
      .max(dimensionsConfig.width.max, `Šířka smí být nejvýše ${dimensionsConfig.width.max} m.`),
    depth: z
      .number({ invalid_type_error: "Chybí hloubka." })
      .min(dimensionsConfig.depth.min, `Hloubka musí být aspoň ${dimensionsConfig.depth.min} m.`)
      .max(dimensionsConfig.depth.max, `Hloubka smí být nejvýše ${dimensionsConfig.depth.max} m.`),
  }),
  addons: z.object({
    led: z.boolean(),
    screenSides: z.number().int().min(0).max(3),
    sensors: z.boolean(),
    heaterPrep: z.boolean(),
    glassWalls: z.boolean(),
    curtains: z.boolean(),
  }),
  location: locationSchema,
  photos: z
    .array(
      z.object({
        name: z.string().trim().min(1).max(180),
        dataUrl: z
          .string()
          .max(1_800_000, "Fotografie je po zmenšení pořád příliš velká.")
          .regex(photoDataUrl, "Fotografie se nepodařilo načíst."),
      }),
    )
    .max(2, "Můžete nahrát nejvýše 2 fotografie."),
  contact: contactSchema,
  source: enumSchema(sources, "Neznámý zdroj poptávky."),
  pageUrl: z.string().max(500),
  referrer: z.string().max(500),
  hpField: z.string().max(200).optional().default(""),
});

export function parseLeadRequest(input: unknown) {
  return leadSchema.safeParse(input) as z.SafeParseReturnType<unknown, LeadRequest>;
}

export function issuesByField(error: z.ZodError) {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "");
    if (key && !fields[key]) fields[key] = issue.message;
  }
  return fields;
}
