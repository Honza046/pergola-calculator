import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  areaSquareMeters,
  calculatePrice,
  ledPerimeter,
  priceConfig,
  tryCalculatePrice,
} from "./calculator";
import type { Addons, Anchoring, PricedConfiguration, StructureType } from "../types/calculator";
import { anchoringTypes, structureTypes } from "../types/calculator";

const emptyAddons: Addons = {
  led: false,
  screenSides: 0,
  sensors: false,
  heaterPrep: false,
  glassWalls: false,
  curtains: false,
};

function config(
  overrides: Partial<PricedConfiguration> & { width?: number; depth?: number } = {},
): PricedConfiguration {
  const { width, depth, dimensions, ...rest } = overrides;
  return {
    structureType: "bioclimatic",
    anchoring: "wall",
    dimensions: dimensions ?? { width: width ?? 5, depth: depth ?? 3.5 },
    addons: emptyAddons,
    ...rest,
  };
}

describe("calculatePrice", () => {
  it("spočítá referenční pásmo 5 × 3,5 m bioklimatické pergoly u zdi", () => {
    const quote = calculatePrice(config());
    assert.equal(quote.area, 17.5);
    assert.equal(quote.minPrice, 165_000);
    assert.equal(quote.maxPrice, 195_000);
    assert.match(quote.formattedRange, /165[\s\u00a0\u202f]000/);
    assert.match(quote.formattedRange, /195[\s\u00a0\u202f]000 Kč bez DPH/);
  });

  it("drží pořadí typů: simple < carport < bioklimatická < prosklená < zateplená zimní zahrada", () => {
    const simple = calculatePrice(config({ structureType: "simple" }));
    const carport = calculatePrice(config({ structureType: "carport" }));
    const bioclimatic = calculatePrice(config({ structureType: "bioclimatic" }));
    const glass = calculatePrice(config({ structureType: "glass" }));
    const winter = calculatePrice(config({ structureType: "winter_insulated" }));
    assert.ok(simple.minPrice < carport.minPrice);
    assert.ok(carport.minPrice < bioclimatic.minPrice);
    assert.ok(bioclimatic.minPrice < glass.minPrice);
    assert.ok(glass.minPrice < winter.minPrice);
  });

  it("má ceník pro všechny typy konstrukcí", () => {
    for (const structureType of structureTypes) {
      const quote = calculatePrice(config({ structureType }));
      assert.ok(quote.minPrice > 0);
      assert.ok(quote.maxPrice > quote.minPrice);
    }
  });

  it("zdraží samostojné provedení a zapíše příplatek", () => {
    const wall = calculatePrice(config({ anchoring: "wall" }));
    const freestanding = calculatePrice(config({ anchoring: "freestanding" }));
    assert.ok(freestanding.minPrice > wall.minPrice);
    assert.equal(
      freestanding.lines.some((line) => line.id === "freestanding"),
      true,
    );
  });

  it("účtuje větší rozpon až nad 6 m a větší výsuv až nad 4 m", () => {
    assert.equal(calculatePrice(config({ width: 6 })).lines.some((line) => line.id === "width"), false);
    assert.equal(calculatePrice(config({ width: 6.5 })).lines.some((line) => line.id === "width"), true);
    assert.equal(calculatePrice(config({ depth: 4 })).lines.some((line) => line.id === "depth"), false);
    assert.equal(calculatePrice(config({ depth: 4.5 })).lines.some((line) => line.id === "depth"), true);
  });

  it("účtuje nadstandardní plochu až nad 30 m²", () => {
    assert.equal(
      calculatePrice(config({ width: 8, depth: 3.5 })).lines.some((line) => line.id === "area"),
      false,
    );
    assert.equal(
      calculatePrice(config({ width: 8, depth: 4 })).lines.some((line) => line.id === "area"),
      true,
    );
  });

  it("počítá LED z obvodu a rolety násobí počtem stran", () => {
    assert.equal(ledPerimeter("wall", 5, 3.5), 12);
    assert.equal(ledPerimeter("freestanding", 5, 3.5), 17);

    const withLed = calculatePrice(config({ addons: { ...emptyAddons, led: true } }));
    const led = withLed.lines.find((line) => line.id === "led");
    assert.ok(led);
    assert.equal(led.min, Math.round(12 * priceConfig.led.minPerMeter));
    assert.equal(led.max, Math.round(12 * priceConfig.led.maxPerMeter));

    const one = calculatePrice(config({ addons: { ...emptyAddons, screenSides: 1 } }));
    const three = calculatePrice(config({ addons: { ...emptyAddons, screenSides: 3 } }));
    assert.equal(one.lines.find((line) => line.id === "screens")?.min, priceConfig.screens.minPerSide);
    assert.equal(
      three.lines.find((line) => line.id === "screens")?.min,
      priceConfig.screens.minPerSide * 3,
    );
    assert.equal(calculatePrice(config()).lines.some((line) => line.id === "screens"), false);
  });

  it("vrací zaokrouhlené kladné pásmo pro běžné kombinace", () => {
    const sizes = [
      [3, 2.5],
      [5, 3.5],
      [6, 4],
      [6.5, 4.5],
      [8, 5],
    ] as const;
    const addonSets: Addons[] = [
      emptyAddons,
      {
        led: true,
        screenSides: 3,
        sensors: true,
        heaterPrep: true,
        glassWalls: true,
        curtains: true,
      },
    ];

    for (const structureType of structureTypes) {
      for (const anchoring of anchoringTypes) {
        for (const [width, depth] of sizes) {
          for (const addons of addonSets) {
            const quote = calculatePrice({
              structureType: structureType as StructureType,
              anchoring: anchoring as Anchoring,
              dimensions: { width, depth },
              addons,
            });
            assert.equal(quote.area, areaSquareMeters(width, depth));
            assert.ok(quote.minPrice > 0);
            assert.ok(quote.maxPrice > quote.minPrice);
            assert.equal(quote.minPrice % priceConfig.roundTo, 0);
            assert.equal(quote.maxPrice % priceConfig.roundTo, 0);
          }
        }
      }
    }
  });

  it("bez typu nebo kotvení cenu nevrátí", () => {
    assert.equal(
      tryCalculatePrice({
        structureType: null,
        anchoring: "wall",
        dimensions: { width: 5, depth: 3.5 },
        addons: emptyAddons,
      }),
      null,
    );
  });
});
