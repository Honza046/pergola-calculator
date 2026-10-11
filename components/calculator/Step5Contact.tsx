"use client";

import Image from "next/image";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Field } from "@/components/calculator/fields";
import { PrivacyModal } from "@/components/calculator/PrivacyModal";
import { fieldClass } from "@/components/calculator/styles";
import { priceDisclaimer, structureCatalog } from "@/lib/catalog";
import { formatCzkSpan } from "@/lib/format";
import { contactSchema, type ContactFormValues } from "@/lib/schemas";
import type { ContactDetails, PriceQuote, StructureType } from "@/types/calculator";

export function Step5Contact({
  contact,
  quote,
  structureType,
  onContactChange,
  onSubmit,
}: {
  contact: ContactDetails;
  quote: PriceQuote;
  structureType: StructureType | null;
  onContactChange: (contact: ContactDetails) => void;
  onSubmit: (contact: ContactDetails, hpField: string) => Promise<void>;
}) {
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const structure = structureType ? structureCatalog[structureType] : null;
  const {
    register,
    handleSubmit,
    control,
    getValues,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: contact,
    mode: "onSubmit",
  });

  function syncContact() {
    const values = getValues();
    onContactChange({
      fullName: values.fullName ?? "",
      phone: values.phone ?? "",
      email: values.email ?? "",
      note: values.note ?? "",
      consent: Boolean(values.consent),
    });
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div>
        <h2 className="text-base font-semibold tracking-tight">Orientační cena a kontakt</h2>
        <p className="text-[11px] text-muted">{priceDisclaimer}</p>
      </div>

      <div className="grid gap-1.5 sm:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        {structure ? (
          <div className="overflow-hidden rounded-lg border border-line bg-white">
            <div className="relative aspect-[2.6/1] w-full bg-[#efe8dc]">
              <Image
                src={structure.image}
                alt={structure.title}
                fill
                sizes="(max-width: 1024px) 100vw, 520px"
                className="object-cover"
                priority
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent px-2.5 py-2 pt-8 text-white">
                <p className="text-sm font-semibold leading-snug">{structure.title}</p>
              </div>
            </div>
          </div>
        ) : null}

        <div className="rounded-lg border border-line bg-paper px-3 py-2.5">
          <p className="text-[10px] font-medium tracking-wide text-muted uppercase">Orientační pásmo bez DPH</p>
          <p className="mt-0.5 text-xl font-semibold tabular-nums leading-tight sm:text-2xl">
            {formatCzkSpan(quote.minPrice, quote.maxPrice)}
          </p>
        </div>
      </div>

      <form
        id="lead-form"
        noValidate
        className="grid min-h-0 content-start gap-1.5 sm:grid-cols-2"
        onBlur={syncContact}
        onSubmit={handleSubmit(async (values) => {
          const honeypot = document.getElementById("hp-field");
          const hpField = honeypot instanceof HTMLInputElement ? honeypot.value : "";
          await onSubmit(values, hpField);
        })}
      >
        <div className="sm:col-span-2">
          <Field id="full-name" label="Jméno a příjmení" error={errors.fullName?.message}>
            <input
              id="full-name"
              autoComplete="name"
              maxLength={80}
              placeholder="Jana Nováková"
              aria-invalid={Boolean(errors.fullName)}
              aria-describedby={errors.fullName ? "full-name-error" : undefined}
              className={fieldClass(Boolean(errors.fullName))}
              {...register("fullName")}
            />
          </Field>
        </div>
        <Field id="phone" label="Telefon" error={errors.phone?.message}>
          <input
            id="phone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            placeholder="777 123 456"
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? "phone-error" : undefined}
            className={fieldClass(Boolean(errors.phone))}
            {...register("phone")}
          />
        </Field>
        <Field id="email" label="E-mail" error={errors.email?.message}>
          <input
            id="email"
            type="email"
            autoComplete="email"
            autoCorrect="off"
            maxLength={120}
            placeholder="jana@email.cz"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-error" : undefined}
            className={fieldClass(Boolean(errors.email))}
            {...register("email")}
          />
        </Field>
        <div className="sm:col-span-2">
          <Field id="note" label="Poznámka" error={errors.note?.message}>
            <textarea
              id="note"
              maxLength={1000}
              placeholder="Barva, elektřina, další práce…"
              aria-invalid={Boolean(errors.note)}
              aria-describedby={errors.note ? "note-error" : undefined}
              className={fieldClass(Boolean(errors.note), true)}
              {...register("note")}
            />
          </Field>
        </div>

        <div className="sm:col-span-2">
          <Controller
            name="consent"
            control={control}
            render={({ field }) => (
              <div>
                <label className="flex items-start gap-2 text-xs leading-snug">
                  <input
                    type="checkbox"
                    className="mt-0.5 size-4 accent-forest"
                    checked={field.value}
                    onBlur={field.onBlur}
                    ref={field.ref}
                    onChange={(event) => field.onChange(event.target.checked)}
                  />
                  <span>
                    Souhlasím se zpracováním{" "}
                    <button
                      type="button"
                      className="font-medium text-ink underline underline-offset-2 hover:text-forest"
                      onMouseDown={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                      }}
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        setPrivacyOpen(true);
                      }}
                    >
                      osobních údajů
                    </button>{" "}
                    za účelem vyřízení poptávky a zaměření.
                  </span>
                </label>
                {errors.consent ? <p className="mt-1 text-xs text-danger">{errors.consent.message}</p> : null}
              </div>
            )}
          />
        </div>

        <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
          <label>
            Nevyplňujte
            <input id="hp-field" name="hpField" type="text" tabIndex={-1} autoComplete="off" />
          </label>
        </div>
      </form>

      <PrivacyModal open={privacyOpen} onClose={() => setPrivacyOpen(false)} />
    </div>
  );
}
