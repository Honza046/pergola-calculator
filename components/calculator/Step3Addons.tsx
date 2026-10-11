"use client";

import { Check, Minus, Plus } from "lucide-react";
import Image from "next/image";

import { optionCard } from "@/components/calculator/styles";
import { addonCatalog, screenSidesLabel } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import type { Addons, ScreenSides } from "@/types/calculator";

export function Step3Addons({
  addons,
  onChange,
}: {
  addons: Addons;
  onChange: (addons: Addons) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-end justify-between gap-2">
        <h2 className="text-base font-semibold tracking-tight">Doplňky</h2>
        <p className="text-[11px] text-muted">Ukázkový výběr — ceny na míru</p>
      </div>

      <div className="grid gap-1 sm:grid-cols-2">
        <ToggleCard
          checked={addons.led}
          title={addonCatalog.led.title}
          description={addonCatalog.led.description}
          image={addonCatalog.led.image}
          onChange={(led) => onChange({ ...addons, led })}
        />

        <div className={cn(optionCard(addons.screenSides > 0), "flex-row items-center gap-2 p-1.5")}>
          <span className="relative size-12 shrink-0 overflow-hidden rounded-md bg-[#efe8dc] sm:size-14">
            <Image
              src={addonCatalog.screens.image}
              alt={addonCatalog.screens.title}
              fill
              sizes="56px"
              className="object-cover"
            />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium leading-snug">{addonCatalog.screens.title}</p>
            <p className="text-[11px] text-muted">{screenSidesLabel(addons.screenSides)}</p>
          </div>
          <div className="flex shrink-0 items-center gap-0.5">
            <button
              type="button"
              aria-label="Ubrat stranu rolety"
              disabled={addons.screenSides === 0}
              onClick={() => onChange({ ...addons, screenSides: clamp(addons.screenSides - 1) })}
              className="grid size-7 place-items-center rounded-md border border-line disabled:opacity-40"
            >
              <Minus className="size-3.5" />
            </button>
            <span className="w-5 text-center text-sm font-medium" aria-live="polite">
              {addons.screenSides}
            </span>
            <button
              type="button"
              aria-label="Přidat stranu rolety"
              disabled={addons.screenSides === 3}
              onClick={() => onChange({ ...addons, screenSides: clamp(addons.screenSides + 1) })}
              className="grid size-7 place-items-center rounded-md border border-line disabled:opacity-40"
            >
              <Plus className="size-3.5" />
            </button>
          </div>
        </div>

        <ToggleCard
          checked={addons.glassWalls}
          title={addonCatalog.glassWalls.title}
          description={addonCatalog.glassWalls.description}
          image={addonCatalog.glassWalls.image}
          onChange={(glassWalls) => onChange({ ...addons, glassWalls })}
        />
        <ToggleCard
          checked={addons.curtains}
          title={addonCatalog.curtains.title}
          description={addonCatalog.curtains.description}
          image={addonCatalog.curtains.image}
          onChange={(curtains) => onChange({ ...addons, curtains })}
        />
        <ToggleCard
          checked={addons.sensors}
          title={addonCatalog.sensors.title}
          description={addonCatalog.sensors.description}
          image={addonCatalog.sensors.image}
          onChange={(sensors) => onChange({ ...addons, sensors })}
        />
        <ToggleCard
          checked={addons.heaterPrep}
          title={addonCatalog.heaterPrep.title}
          description={addonCatalog.heaterPrep.description}
          image={addonCatalog.heaterPrep.image}
          onChange={(heaterPrep) => onChange({ ...addons, heaterPrep })}
        />
      </div>
    </div>
  );
}

function ToggleCard({
  checked,
  title,
  description,
  image,
  onChange,
}: {
  checked: boolean;
  title: string;
  description: string;
  image: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className={cn(optionCard(checked), "flex-row items-start gap-2 p-1.5")}>
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className="relative size-12 shrink-0 overflow-hidden rounded-md bg-[#efe8dc] sm:size-14">
        <Image src={image} alt={title} fill sizes="56px" className="object-cover" />
      </span>
      <span className="min-w-0 flex-1 pr-6">
        <span className="block text-sm font-medium leading-snug">{title}</span>
        <span className="mt-0.5 block text-[11px] leading-snug text-muted line-clamp-2">{description}</span>
      </span>
      <span
        className={cn(
          "absolute top-1.5 right-1.5 z-10 grid size-5 place-items-center rounded-full border",
          checked ? "border-forest bg-forest text-white" : "border-line bg-white",
        )}
        aria-hidden="true"
      >
        {checked ? <Check className="size-3" strokeWidth={2.5} /> : null}
      </span>
    </label>
  );
}

function clamp(value: number): ScreenSides {
  return Math.min(3, Math.max(0, value)) as ScreenSides;
}
