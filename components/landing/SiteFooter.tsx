import { LogoMark } from "@/components/brand/Logo";
import { resolveCompanyConfig } from "@/lib/company-config";
import type { CompanyConfig } from "@/types/company-config";

export function SiteFooter({ config }: { config?: CompanyConfig | null }) {
  const brandConfig = resolveCompanyConfig(config);

  return (
    <footer className="mt-4 border-t border-line pt-3 pb-1 text-xs text-muted">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {brandConfig.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={brandConfig.logoUrl}
              alt=""
              className="size-6 rounded object-contain"
            />
          ) : (
            <LogoMark className="size-6" />
          )}
          <div>
            <p className="font-medium text-ink">{brandConfig.companyName}</p>
            <p>
              {[brandConfig.city, brandConfig.email].filter(Boolean).join(" · ") || "—"}
            </p>
          </div>
        </div>
        <p className="text-[11px]">Kalkulačka na míru · {brandConfig.city || "ČR"}</p>
      </div>
    </footer>
  );
}
