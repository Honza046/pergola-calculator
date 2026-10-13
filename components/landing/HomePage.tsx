import { Calculator } from "@/components/calculator/Calculator";
import { brandThemeStyle, resolveCompanyConfig } from "@/lib/company-config";
import type { CompanyConfig } from "@/types/company-config";

export function HomePage({ config }: { config?: CompanyConfig | null }) {
  const brandConfig = resolveCompanyConfig(config);

  return (
    <div className="min-h-dvh" style={brandThemeStyle(brandConfig)}>
      <main className="mx-auto w-full max-w-3xl px-3 py-5 sm:px-4 sm:py-8">
        <h1 className="sr-only">Kalkulačka poptávky</h1>
        <Calculator config={brandConfig} />
      </main>
    </div>
  );
}
