import { Logo } from "@/components/brand/Logo";
import { phoneToHref, resolveCompanyConfig } from "@/lib/company-config";
import type { CompanyConfig } from "@/types/company-config";

export function SiteHeader({ config }: { config?: CompanyConfig | null }) {
  const brandConfig = resolveCompanyConfig(config);
  const phoneHref = phoneToHref(brandConfig.phone);

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-card/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between gap-3 px-3 sm:px-4">
        <a href="#uvod" className="min-w-0">
          <Logo markClassName="size-9" config={brandConfig} />
        </a>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <a
            href="/admin/generator"
            className="hidden text-xs font-medium text-brass hover:text-ink sm:inline"
          >
            AI generátor
          </a>
          {brandConfig.phone ? (
            <a
              href={phoneHref}
              className="hidden text-xs font-medium text-muted tabular-nums hover:text-ink md:inline"
            >
              {brandConfig.phone}
            </a>
          ) : null}
          <a
            href="#kalkulacka"
            className="inline-flex h-9 items-center rounded-md bg-forest px-3.5 text-xs font-medium text-white hover:bg-forest-deep"
          >
            Spočítat cenu
          </a>
        </div>
      </div>
    </header>
  );
}
