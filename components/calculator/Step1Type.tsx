"use client";

import { Check } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

import {
  anchoringCatalog,
  structureCatalog,
  structureGroupCatalog,
  structureGroupsList,
  structuresInGroup,
} from "@/lib/catalog";
import { cn } from "@/lib/cn";
import type { Anchoring, StructureGroup, StructureType } from "@/types/calculator";

export function Step1Type({
  structureType,
  anchoring,
  showErrors,
  onStructureType,
  onAnchoring,
}: {
  structureType: StructureType | null;
  anchoring: Anchoring | null;
  showErrors: boolean;
  onStructureType: (value: StructureType | null) => void;
  onAnchoring: (value: Anchoring | null) => void;
}) {
  const selectedGroup = structureType ? structureCatalog[structureType].group : "pergola";
  const [group, setGroup] = useState<StructureGroup>(selectedGroup);
  const items = structuresInGroup(group);

  useEffect(() => {
    if (structureType) setGroup(structureCatalog[structureType].group);
  }, [structureType]);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-end justify-between gap-2">
        <h2 className="text-base font-semibold tracking-tight">Typ konstrukce</h2>
        <p className="text-[11px] text-muted">{items.length} varianty</p>
      </div>

      <div className="flex flex-wrap gap-0.5 rounded-lg border border-line bg-paper p-0.5">
        {structureGroupsList.map((item) => {
          const active = group === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setGroup(item.id)}
              className={cn(
                "flex-1 rounded-md px-2 py-1 text-xs font-medium transition",
                active ? "bg-forest text-white" : "text-muted hover:text-ink",
              )}
            >
              {structureGroupCatalog[item.id].short}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-4 gap-1">
        {items.map((item) => {
          const active = structureType === item.id;
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={active}
              onClick={() => onStructureType(active ? null : item.id)}
              className={cn(
                "relative flex w-full flex-col overflow-hidden rounded-lg border bg-white text-left transition",
                "focus-visible:ring-2 focus-visible:ring-ink/20 focus-visible:outline-none",
                active ? "border-ink shadow-[0_0_0_1px_#141311]" : "border-line hover:border-ink/30",
              )}
            >
              <span className="relative block aspect-[2/1] w-full overflow-hidden bg-[#efe8dc]">
                <Image
                  src={item.image}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 25vw, 160px"
                  className="object-cover"
                />
              </span>
              <span className="flex flex-col gap-0.5 px-1.5 py-1 pr-5">
                <span className="truncate text-[11px] font-medium leading-tight sm:text-xs">{item.short}</span>
                <span className="line-clamp-2 text-[10px] leading-snug text-muted">{item.description}</span>
              </span>
              <ChoiceMark active={active} />
            </button>
          );
        })}
      </div>
      {showErrors && !structureType ? <p className="text-xs text-danger">Vyberte typ konstrukce.</p> : null}

      <div>
        <p className="mb-1 text-xs font-medium">Kotvení</p>
        <div className="grid grid-cols-2 gap-1">
          {(["wall", "freestanding"] as const).map((id) => {
            const active = anchoring === id;
            return (
              <button
                key={id}
                type="button"
                aria-pressed={active}
                onClick={() => onAnchoring(active ? null : id)}
                className={cn(
                  "rounded-lg border bg-white px-2.5 py-1.5 text-left text-xs transition sm:text-sm",
                  "focus-visible:ring-2 focus-visible:ring-ink/20 focus-visible:outline-none",
                  active ? "border-ink shadow-[0_0_0_1px_#141311]" : "border-line hover:border-ink/25",
                )}
              >
                <span className="block font-medium leading-snug">{anchoringCatalog[id].title}</span>
                <span className="mt-0.5 block text-[11px] leading-snug text-muted">
                  {anchoringCatalog[id].description}
                </span>
              </button>
            );
          })}
        </div>
        {showErrors && structureType && !anchoring ? (
          <p className="mt-1 text-xs text-danger">Vyberte kotvení.</p>
        ) : null}
      </div>
    </div>
  );
}

function ChoiceMark({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        "absolute top-1 right-1 z-10 grid size-4 place-items-center rounded-full border shadow-sm",
        active ? "border-forest bg-forest text-white" : "border-white/80 bg-white/90",
      )}
      aria-hidden="true"
    >
      {active ? <Check className="size-2.5" strokeWidth={2.5} /> : null}
    </span>
  );
}
