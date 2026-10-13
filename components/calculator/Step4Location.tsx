"use client";

import { Camera, X } from "lucide-react";
import { useRef, useState } from "react";

import { Field } from "@/components/calculator/fields";
import { fieldClass } from "@/components/calculator/styles";
import { timelineCatalog } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { formatPostalInput } from "@/lib/format";
import { readSitePhoto } from "@/lib/photos";
import type { DraftPhoto, LocationDetails, Timeline } from "@/types/calculator";
import { timelines } from "@/types/calculator";

export function Step4Location({
  location,
  errors,
  onChange,
}: {
  location: LocationDetails;
  errors: Record<string, string>;
  onChange: (location: LocationDetails) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [reading, setReading] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);

  async function addFiles(list: FileList | null) {
    if (!list || list.length === 0) return;
    const room = 2 - location.photos.length;
    if (room <= 0) {
      setPhotoError("Můžete nahrát nejvýše 2 fotografie.");
      return;
    }

    const selected = Array.from(list).slice(0, room);
    setReading(true);
    const next = [...location.photos];
    let message: string | null = list.length > room ? "Můžete nahrát nejvýše 2 fotografie." : null;
    try {
      for (const file of selected) {
        try {
          next.push(await readSitePhoto(file));
        } catch (error) {
          message = error instanceof Error ? error.message : "Fotografii se nepodařilo nahrát.";
          break;
        }
      }
      onChange({ ...location, photos: next });
      setPhotoError(message);
    } finally {
      setReading(false);
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <h2 className="font-display text-lg font-semibold tracking-tight">Místo a termín</h2>

      <div className="grid gap-1.5 sm:grid-cols-[minmax(0,1fr)_120px]">
        <Field id="location-city" label="Město" error={errors.city}>
          <input
            id="location-city"
            value={location.city}
            autoComplete="address-level2"
            maxLength={80}
            placeholder="Brno"
            aria-invalid={Boolean(errors.city)}
            aria-describedby={errors.city ? "location-city-error" : undefined}
            className={fieldClass(Boolean(errors.city))}
            onChange={(event) => onChange({ ...location, city: event.target.value })}
          />
        </Field>
        <Field id="postal-code" label="PSČ" error={errors.postalCode}>
          <input
            id="postal-code"
            value={location.postalCode}
            inputMode="numeric"
            autoComplete="postal-code"
            maxLength={6}
            placeholder="602 00"
            aria-invalid={Boolean(errors.postalCode)}
            aria-describedby={errors.postalCode ? "postal-code-error" : undefined}
            className={fieldClass(Boolean(errors.postalCode))}
            onChange={(event) =>
              onChange({ ...location, postalCode: formatPostalInput(event.target.value) })
            }
          />
        </Field>
      </div>

      <fieldset className="m-0 min-w-0 border-0 p-0">
        <legend className="mb-1.5 text-sm font-medium">Termín</legend>
        <div className="grid gap-1.5 sm:grid-cols-3" role="radiogroup" aria-label="Požadovaný termín">
          {timelines.map((id) => {
            const item = timelineCatalog[id];
            const active = location.timeline === id;
            return (
              <button
                key={id}
                id={`timeline-${id}`}
                type="button"
                aria-pressed={active}
                onClick={() =>
                  onChange({ ...location, timeline: active ? null : (id satisfies Timeline) })
                }
                className={cn(
                  "rounded-lg border px-2.5 py-1.5 text-left text-sm transition",
                  "focus-visible:ring-2 focus-visible:ring-ink/20 focus-visible:outline-none",
                  active
                    ? "border-forest shadow-[2px_2px_0_rgba(35,72,54,0.18)]"
                    : "border-line hover:border-forest/35",
                )}
              >
                <span className="block font-medium leading-snug">{item.title}</span>
              </button>
            );
          })}
        </div>
        {errors.timeline ? <p className="mt-1 text-xs text-danger">{errors.timeline}</p> : null}
      </fieldset>

      <div
        onDragEnter={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          void addFiles(event.dataTransfer.files);
        }}
        className={cn(
          "rounded-sm border border-dashed px-3 py-2.5",
          dragging ? "border-forest bg-moss" : "border-line",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="sr-only"
          onChange={(event) => {
            void addFiles(event.target.files);
            event.target.value = "";
          }}
        />
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium">Fotky místa (volitelné)</p>
            <p className="text-xs text-muted">1–2 snímky</p>
          </div>
          <button
            type="button"
            disabled={reading || location.photos.length >= 2}
            onClick={() => inputRef.current?.click()}
            className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md border border-line bg-white px-2.5 text-xs font-medium disabled:opacity-45"
          >
            <Camera className="size-3.5" />
            {reading ? "…" : "Nahrát"}
          </button>
        </div>
        {photoError ? <p className="mt-1.5 text-xs text-danger">{photoError}</p> : null}
        {location.photos.length > 0 ? (
          <ul className="mt-2 flex gap-2">
            {location.photos.map((photo, index) => (
              <li key={photo.id} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.dataUrl}
                  alt={`Fotografie místa montáže ${index + 1}`}
                  className="size-14 rounded-lg object-cover"
                />
                <button
                  type="button"
                  aria-label={`Odebrat fotografii ${photo.name}`}
                  onClick={() => removePhoto(location, photo, onChange)}
                  className="absolute -top-1.5 -right-1.5 grid size-5 place-items-center rounded-full bg-white text-ink shadow"
                >
                  <X className="size-3" />
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}

function removePhoto(
  location: LocationDetails,
  photo: DraftPhoto,
  onChange: (location: LocationDetails) => void,
) {
  onChange({ ...location, photos: location.photos.filter((item) => item.id !== photo.id) });
}
