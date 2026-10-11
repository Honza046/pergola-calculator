import { anchoringCatalog, screenSidesLabel, structureCatalog } from "@/lib/catalog";
import { formatCzkRange } from "@/lib/format";
import type {
  Addons,
  Anchoring,
  Dimensions,
  PriceLine,
  PriceQuote,
  PricedConfiguration,
  StructureType,
} from "@/types/calculator";

/**
 * Orientační ceník bez DPH.
 * Sazby upravujte tady — `calculatePrice` z nich skládá minimum a maximum.
 *
 * Základ je sazba za m². Procentní příplatky se počítají jen ze základu konstrukce,
 * navzájem se nesčítají do řetězu. Doplňky se přičítají až potom jako pevné částky.
 * Výsledné pásmo se zaokrouhlí na celé tisíce: minimum dolů, maximum nahoru.
 *
 * Reference: 5 × 3,5 m, bioklimatická pergola, kotvená ke zdi, bez doplňků
 * → 165 000 – 195 000 Kč bez DPH.
 */
export const priceConfig = {
  roundTo: 1000,
  structures: {
    bioclimatic: { minPerM2: 9429, maxPerM2: 11142 },
    glass: { minPerM2: 12800, maxPerM2: 16400 },
    polycarbonate: { minPerM2: 7600, maxPerM2: 9800 },
    fixed_roof: { minPerM2: 7200, maxPerM2: 9400 },
    fabric_sliding: { minPerM2: 8400, maxPerM2: 11200 },
    fabric_rolling: { minPerM2: 9200, maxPerM2: 12800 },
    simple: { minPerM2: 5600, maxPerM2: 7600 },
    photovoltaic: { minPerM2: 14800, maxPerM2: 19600 },
    winter_garden: { minPerM2: 11200, maxPerM2: 14800 },
    winter_insulated: { minPerM2: 16800, maxPerM2: 22800 },
    carport: { minPerM2: 6900, maxPerM2: 8900 },
    carport_trapez: { minPerM2: 7400, maxPerM2: 9600 },
    carport_thermo: { minPerM2: 8800, maxPerM2: 11800 },
  } satisfies Record<StructureType, { minPerM2: number; maxPerM2: number }>,
  /** Podíl ze základu. 0.16 = +16 %. */
  freestandingSurcharge: { min: 0.16, max: 0.22 },
  /** Šířka nad 6 m. */
  widthSurcharge: { above: 6, min: 0.07, max: 0.11 },
  /** Hloubka nad 4 m. */
  depthSurcharge: { above: 4, min: 0.05, max: 0.09 },
  /** Plocha nad 30 m². */
  areaSurcharge: { above: 30, min: 0.04, max: 0.07 },
  /**
   * LED po obvodu. U kotvené konstrukce tři volné strany,
   * u samostojné celý obvod.
   */
  led: { minPerMeter: 740, maxPerMeter: 1120 },
  screens: { minPerSide: 15400, maxPerSide: 20600 },
  sensors: { min: 8800, max: 13200 },
  heaterPrep: { min: 5600, max: 9100 },
  /** Orientační pásmo za boční posuvné prosklení (typicky 1–2 strany). */
  glassWalls: { min: 42000, max: 78000 },
  curtains: { min: 12000, max: 22000 },
};

export const dimensionsConfig = {
  /** Slider a ruční zadání; krok 1 cm. */
  width: { min: 3, max: 8, step: 0.01, default: 5 },
  depth: { min: 2.5, max: 5, step: 0.01, default: 3.5 },
} as const;

export function areaSquareMeters(width: number, depth: number) {
  return Math.round(width * depth * 100) / 100;
}

export function ledPerimeter(anchoring: Anchoring, width: number, depth: number) {
  const safeWidth = Math.max(0, width);
  const safeDepth = Math.max(0, depth);
  if (anchoring === "wall") return safeWidth + safeDepth * 2;
  return (safeWidth + safeDepth) * 2;
}

export function calculatePrice(config: PricedConfiguration): PriceQuote {
  const width = config.dimensions.width;
  const depth = config.dimensions.depth;
  if (!(width > 0) || !(depth > 0)) {
    throw new Error("Rozměry musí být větší než nula.");
  }

  const area = areaSquareMeters(width, depth);
  const rates = priceConfig.structures[config.structureType];
  const baseMin = area * rates.minPerM2;
  const baseMax = area * rates.maxPerM2;
  let totalMin = baseMin;
  let totalMax = baseMax;

  const lines: PriceLine[] = [
    {
      id: "base",
      label: `Základní sazba za m² · ${structureCatalog[config.structureType].short}`,
      min: Math.round(baseMin),
      max: Math.round(baseMax),
    },
  ];

  const addPercent = (id: string, label: string, factor: { min: number; max: number }) => {
    const extraMin = baseMin * factor.min;
    const extraMax = baseMax * factor.max;
    totalMin += extraMin;
    totalMax += extraMax;
    lines.push({
      id,
      label,
      min: Math.round(extraMin),
      max: Math.round(extraMax),
    });
  };

  if (config.anchoring === "freestanding") {
    addPercent(
      "freestanding",
      `Příplatek za samostojné provedení · ${anchoringCatalog.freestanding.title}`,
      priceConfig.freestandingSurcharge,
    );
  }
  if (width > priceConfig.widthSurcharge.above) {
    addPercent("width", "Příplatek za větší rozpon", priceConfig.widthSurcharge);
  }
  if (depth > priceConfig.depthSurcharge.above) {
    addPercent("depth", "Příplatek za větší výsuv", priceConfig.depthSurcharge);
  }
  if (area > priceConfig.areaSurcharge.above) {
    addPercent("area", "Příplatek za nadstandardní plochu", priceConfig.areaSurcharge);
  }

  if (config.addons.led) {
    const perimeter = ledPerimeter(config.anchoring, width, depth);
    const min = perimeter * priceConfig.led.minPerMeter;
    const max = perimeter * priceConfig.led.maxPerMeter;
    totalMin += min;
    totalMax += max;
    lines.push({
      id: "led",
      label: "Obvodové LED osvětlení",
      min: Math.round(min),
      max: Math.round(max),
    });
  }

  const sides = clampSides(config.addons.screenSides);
  if (sides > 0) {
    const min = priceConfig.screens.minPerSide * sides;
    const max = priceConfig.screens.maxPerSide * sides;
    totalMin += min;
    totalMax += max;
    lines.push({
      id: "screens",
      label: `Screenové rolety (${screenSidesLabel(sides)})`,
      min: Math.round(min),
      max: Math.round(max),
    });
  }

  if (config.addons.sensors) {
    totalMin += priceConfig.sensors.min;
    totalMax += priceConfig.sensors.max;
    lines.push({
      id: "sensors",
      label: "Dešťové a větrné senzory",
      min: priceConfig.sensors.min,
      max: priceConfig.sensors.max,
    });
  }

  if (config.addons.heaterPrep) {
    totalMin += priceConfig.heaterPrep.min;
    totalMax += priceConfig.heaterPrep.max;
    lines.push({
      id: "heater",
      label: "Příprava na infrazářič",
      min: priceConfig.heaterPrep.min,
      max: priceConfig.heaterPrep.max,
    });
  }

  if (config.addons.glassWalls) {
    totalMin += priceConfig.glassWalls.min;
    totalMax += priceConfig.glassWalls.max;
    lines.push({
      id: "glassWalls",
      label: "Posuvné prosklení",
      min: priceConfig.glassWalls.min,
      max: priceConfig.glassWalls.max,
    });
  }

  if (config.addons.curtains) {
    totalMin += priceConfig.curtains.min;
    totalMax += priceConfig.curtains.max;
    lines.push({
      id: "curtains",
      label: "Textilní závěsy",
      min: priceConfig.curtains.min,
      max: priceConfig.curtains.max,
    });
  }

  let minPrice = floorToStep(totalMin, priceConfig.roundTo);
  let maxPrice = ceilToStep(totalMax, priceConfig.roundTo);
  if (maxPrice < minPrice) {
    const low = maxPrice;
    maxPrice = minPrice;
    minPrice = low;
  }
  if (maxPrice === minPrice) maxPrice += priceConfig.roundTo;

  return {
    area,
    minPrice,
    maxPrice,
    formattedRange: formatCzkRange(minPrice, maxPrice),
    lines,
  };
}

export function tryCalculatePrice(input: {
  structureType: StructureType | null;
  anchoring: Anchoring | null;
  dimensions: Dimensions;
  addons: Addons;
}): PriceQuote | null {
  if (!input.structureType || !input.anchoring) return null;
  return calculatePrice({
    structureType: input.structureType,
    anchoring: input.anchoring,
    dimensions: input.dimensions,
    addons: input.addons,
  });
}

function clampSides(value: number) {
  return Math.min(3, Math.max(0, Math.round(value))) as Addons["screenSides"];
}

function floorToStep(value: number, step: number) {
  const crowns = Math.round(value);
  const remainder = positiveMod(crowns, step);
  return crowns - remainder;
}

function ceilToStep(value: number, step: number) {
  const crowns = Math.round(value);
  const remainder = positiveMod(crowns, step);
  if (remainder === 0) return crowns;
  return crowns + (step - remainder);
}

function positiveMod(value: number, step: number) {
  return ((value % step) + step) % step;
}
