import type { Metadata } from "next";

import { Calculator } from "@/components/calculator/Calculator";

export const metadata: Metadata = {
  title: "Kalkulačka poptávky",
  robots: { index: false, follow: false },
};

export default function EmbedPage() {
  return <Calculator variant="embed" />;
}
