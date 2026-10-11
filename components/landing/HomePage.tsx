import { Calculator } from "@/components/calculator/Calculator";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { SiteHeader } from "@/components/landing/SiteHeader";
import { SiteIntro } from "@/components/landing/SiteIntro";
import { brandThemeStyle, resolveCompanyConfig } from "@/lib/company-config";
import type { CompanyConfig } from "@/types/company-config";

export function HomePage({ config }: { config?: CompanyConfig | null }) {
  const brandConfig = resolveCompanyConfig(config);

  return (
    <div className="min-h-dvh bg-paper" style={brandThemeStyle(brandConfig)}>
      <SiteHeader config={brandConfig} />

      <main className="mx-auto w-full max-w-3xl px-3 py-3 sm:px-4 sm:py-4">
        <div className="flex flex-col gap-3">
          <SiteIntro config={brandConfig} />
          <div id="kalkulacka" className="scroll-mt-16">
            <Calculator config={brandConfig} />
          </div>
          <SiteFooter config={brandConfig} />
        </div>
      </main>
    </div>
  );
}
