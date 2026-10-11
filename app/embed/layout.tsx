import type { ReactNode } from "react";

export default function EmbedLayout({ children }: { children: ReactNode }) {
  return <div className="embed-root mx-auto w-full max-w-5xl px-2 py-2 sm:px-3 sm:py-3">{children}</div>;
}
