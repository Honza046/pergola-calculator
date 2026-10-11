import type { Metadata } from "next";
import { connection } from "next/server";
import { notFound } from "next/navigation";

import { Calculator } from "@/components/calculator/Calculator";
import { getCompanyConfig } from "@/lib/companies";

// Company configs are loaded at request time (AI onboarding can add slugs).
export const instant = false;

export const metadata: Metadata = {
  title: "Kalkulačka poptávky",
  robots: { index: false, follow: false },
};

export default async function CompanyEmbedPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await connection();
  const { slug } = await params;
  const config = await getCompanyConfig(slug);
  if (!config) notFound();

  return <Calculator variant="embed" config={config} />;
}
