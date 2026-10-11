import { LogoMark } from "@/components/brand/Logo";
import { brand } from "@/lib/brand";

export function SiteFooter() {
  return (
    <footer className="mt-4 border-t border-line pt-3 pb-1 text-xs text-muted">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <LogoMark className="size-6" />
          <div>
            <p className="font-medium text-ink">{brand.legalName}</p>
            <p>
              {brand.city} · {brand.email}
            </p>
          </div>
        </div>
        <p className="text-[11px]">Ukázkový projekt · fiktivní firma</p>
      </div>
    </footer>
  );
}
