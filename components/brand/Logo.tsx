import { brand } from "@/lib/brand";
import { cn } from "@/lib/cn";
import type { CompanyConfig } from "@/types/company-config";

/** Značka fiktivní firmy — stylizovaná pergola. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("size-8", className)}
      aria-hidden="true"
    >
      <rect width="40" height="40" rx="10" className="fill-forest" />
      <path d="M10 28V14.5h3V28h-3Zm17 0V14.5h3V28h-3Z" className="fill-white" />
      <path
        d="M8 15.5 20 9l12 6.5"
        className="stroke-brass"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.5 17.5h15M12.5 20.5h15"
        className="stroke-white/70"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Logo({
  className,
  markClassName,
  wordmark = true,
  config,
}: {
  className?: string;
  markClassName?: string;
  wordmark?: boolean;
  config?: CompanyConfig | null;
}) {
  const name = config?.companyName?.trim() || brand.name;
  const logoUrl = config?.logoUrl?.trim();

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      {logoUrl ? (
        // External client logos — plain img avoids next/image remote config.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logoUrl}
          alt=""
          className={cn("size-9 rounded-lg object-contain", markClassName)}
        />
      ) : (
        <LogoMark className={markClassName} />
      )}
      {wordmark ? (
        <span className="leading-none">
          <span className="block font-display text-[1.05rem] font-semibold tracking-[-0.02em]">
            {name}
          </span>
          <span className="mt-0.5 block text-[10px] tracking-[0.14em] text-muted uppercase">
            Pergoly a terasy
          </span>
        </span>
      ) : null}
    </span>
  );
}
