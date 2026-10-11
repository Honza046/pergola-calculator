import type { Metadata } from "next";
import { connection } from "next/server";
import { notFound } from "next/navigation";

import { HomePage } from "@/components/landing/HomePage";
import { getCompanyConfig } from "@/lib/companies";
import { brand } from "@/lib/brand";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  await connection();
  const { slug } = await params;
  const config = await getCompanyConfig(slug);
  return {
    title: config ? `${brand.headline} | ${config.companyName}` : "Kalkulačka",
    robots: { index: false, follow: false },
  };
}

export default async function CompanyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await connection();
  const { slug } = await params;
  const config = await getCompanyConfig(slug);
  if (!config) notFound();

  return <HomePage config={config} />;
}
