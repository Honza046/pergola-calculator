import type { Metadata } from "next";

import { GeneratorForm } from "@/components/admin/GeneratorForm";

export const metadata: Metadata = {
  title: "AI generátor kalkulačky",
  robots: { index: false, follow: false },
};

export default function AdminGeneratorPage() {
  return (
    <div className="min-h-dvh bg-paper">
      <main className="mx-auto w-full max-w-3xl px-3 py-6 sm:px-4 sm:py-8">
        <header className="mb-5">
          <p className="text-[11px] font-medium tracking-[0.16em] text-brass uppercase">
            Admin
          </p>
          <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            AI Onboarding & Embed
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted">
            Vložte URL webu klienta. Systém vytvoří branded kalkulačku, uloží konfiguraci a
            připraví odkazy pro nasazení.
          </p>
        </header>
        <GeneratorForm />
      </main>
    </div>
  );
}
