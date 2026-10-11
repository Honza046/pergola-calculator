import { brand } from "@/lib/brand";
import { phoneToHref, resolveCompanyConfig } from "@/lib/company-config";
import type { CompanyConfig } from "@/types/company-config";

export function SiteIntro({ config }: { config?: CompanyConfig | null }) {
  const brandConfig = resolveCompanyConfig(config);
  const phoneHref = phoneToHref(brandConfig.phone);
  const eyebrow = [brandConfig.companyName, brandConfig.city].filter(Boolean).join(" · ");

  return (
    <section id="uvod" className="relative overflow-hidden rounded-xl border border-line bg-card">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 80% at 0% 0%, rgba(154,115,64,0.14), transparent 55%), radial-gradient(90% 70% at 100% 10%, rgba(20,19,17,0.06), transparent 50%), linear-gradient(180deg, #fffcf8 0%, #f4f2ee 100%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(20,19,17,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(20,19,17,0.04) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage: "linear-gradient(180deg, black, transparent 85%)",
        }}
      />

      <div className="relative px-4 py-5 sm:px-5 sm:py-6">
        <p className="text-[11px] font-medium tracking-[0.16em] text-brass uppercase">{eyebrow}</p>
        <h1 className="mt-2 max-w-xl font-display text-[1.65rem] font-semibold tracking-[-0.03em] text-balance sm:text-[2rem]">
          {brand.headline}
        </h1>
        <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted text-pretty">{brand.intro}</p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <a
            href="#kalkulacka"
            className="inline-flex h-10 items-center rounded-md bg-forest px-4 text-sm font-medium text-white hover:bg-forest-deep"
          >
            Spustit kalkulačku
          </a>
          {brandConfig.phone ? (
            <a
              href={phoneHref}
              className="inline-flex h-10 items-center rounded-md border border-line bg-card/80 px-3.5 text-sm font-medium text-ink hover:border-ink/25"
            >
              {brandConfig.phone}
            </a>
          ) : null}
        </div>

        <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted">
          <li>{brand.measurement}</li>
          <li>{brand.responseTime}</li>
          <li>{brand.areaServed}</li>
        </ul>
      </div>
    </section>
  );
}
