import type { ReactNode } from "react";

/** Minimal chrome for iframe embeds — white calculator card only, no landing shell. */
export default function EmbedLayout({ children }: { children: ReactNode }) {
  return (
    <div className="embed-root mx-auto w-full max-w-3xl bg-transparent px-1.5 py-1.5 sm:px-2 sm:py-2">
      {children}
    </div>
  );
}
