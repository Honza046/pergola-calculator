import { Calculator } from "@/components/calculator/Calculator";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { SiteHeader } from "@/components/landing/SiteHeader";
import { SiteIntro } from "@/components/landing/SiteIntro";

export function HomePage() {
  return (
    <div className="min-h-dvh bg-paper">
      <SiteHeader />

      <main className="mx-auto w-full max-w-3xl px-3 py-3 sm:px-4 sm:py-4">
        <div className="flex flex-col gap-3">
          <SiteIntro />
          <div id="kalkulacka" className="scroll-mt-16">
            <Calculator />
          </div>
          <SiteFooter />
        </div>
      </main>
    </div>
  );
}
