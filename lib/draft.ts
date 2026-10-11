import { dimensionsConfig } from "@/lib/calculator";
import type { CalculatorDraft } from "@/types/calculator";

export const initialDraft: CalculatorDraft = {
  structureType: null,
  anchoring: null,
  dimensions: {
    width: dimensionsConfig.width.default,
    depth: dimensionsConfig.depth.default,
  },
  addons: {
    led: false,
    screenSides: 0,
    sensors: false,
    heaterPrep: false,
    glassWalls: false,
    curtains: false,
  },
  location: {
    city: "",
    postalCode: "",
    timeline: null,
    photos: [],
  },
  contact: {
    fullName: "",
    phone: "",
    email: "",
    note: "",
    consent: false,
  },
};
