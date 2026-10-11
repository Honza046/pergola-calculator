"use client";

import { useMemo, useState, type FormEvent } from "react";

import { DeploySnippets } from "@/components/admin/DeploySnippets";
import { Button } from "@/components/ui/button";
import type { CompanyConfig } from "@/types/company-config";

type SuccessPayload = {
  config: CompanyConfig;
  slug: string;
  urls: { page: string; embed: string };
};

export function GeneratorForm() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SuccessPayload | null>(null);

  const origin = useMemo(() => {
    if (typeof window === "undefined") return "https://vase-domena.cz";
    return window.location.origin;
  }, [result]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await fetch("/api/generate-from-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
        cache: "no-store",
      });
      const body = (await response.json()) as {
        ok?: boolean;
        message?: string;
        config?: CompanyConfig;
        slug?: string;
        urls?: { page: string; embed: string };
      };
      if (!response.ok || !body.ok || !body.config || !body.slug || !body.urls) {
        throw new Error(body.message || "Generování selhalo.");
      }
      setResult({ config: body.config, slug: body.slug, urls: body.urls });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generování selhalo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <form onSubmit={onSubmit} className="rounded-xl border border-line bg-card p-4 sm:p-5">
        <label htmlFor="client-url" className="block text-sm font-medium">
          URL webu klienta
        </label>
        <p className="mt-1 text-xs text-muted">
          AI načte stránku, vytáhne kontakty a navrhne typy konstrukcí a doplňky.
        </p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input
            id="client-url"
            type="url"
            required
            placeholder="https://www.priklad.cz"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            className="h-11 flex-1 rounded-md border border-line bg-white px-3 text-sm outline-none focus:border-ink/40"
          />
          <Button type="submit" disabled={loading} className="h-11 px-5">
            {loading ? "Generuji…" : "Vygenerovat kalkulačku"}
          </Button>
        </div>
        {error ? (
          <p role="alert" className="mt-3 text-sm text-danger">
            {error}
          </p>
        ) : null}
      </form>

      {result ? (
        <div className="flex flex-col gap-4 rounded-xl border border-line bg-card p-4 sm:p-5">
          <div>
            <p className="text-[11px] font-medium tracking-[0.14em] text-brass uppercase">
              Hotovo
            </p>
            <h2 className="mt-1 font-display text-xl font-semibold tracking-tight">
              {result.config.companyName}
            </h2>
            <p className="mt-1 text-sm text-muted">
              Slug <code className="rounded bg-moss px-1.5 py-0.5 text-ink">{result.slug}</code>
              {" · "}
              <a href={result.urls.page} className="underline underline-offset-2 hover:text-ink">
                otevřít stránku
              </a>
              {" · "}
              <a href={result.urls.embed} className="underline underline-offset-2 hover:text-ink">
                embed
              </a>
            </p>
            <ul className="mt-3 grid gap-1 text-xs text-muted sm:grid-cols-2">
              <li>Město: {result.config.city || "—"}</li>
              <li>Telefon: {result.config.phone || "—"}</li>
              <li>E-mail: {result.config.email || "—"}</li>
              <li>Barva: {result.config.primaryColor}</li>
              <li>Kategorie: {result.config.enabledCategories.join(", ")}</li>
              <li>Typy: {result.config.enabledTypes.length}</li>
              <li>Doplňky: {result.config.enabledAddons.join(", ")}</li>
            </ul>
          </div>

          <DeploySnippets
            pageUrl={result.urls.page}
            embedUrl={result.urls.embed}
            origin={origin}
          />
        </div>
      ) : null}
    </div>
  );
}
