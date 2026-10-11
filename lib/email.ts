import { priceDisclaimer } from "@/lib/catalog";
import { brand } from "@/lib/brand";
import { leadRecap, type ReadyLead } from "@/lib/lead";

export function renderLeadEmail(lead: ReadyLead, audience: "owner" | "client") {
  const rows = leadRecap(lead).filter(([label]) => audience === "owner" || !["Zdroj", "Stránka"].includes(label));
  const subject =
    audience === "owner"
      ? `Poptávka ${lead.leadId} · ${lead.city}`
      : `Potvrzení poptávky ${lead.leadId}`;
  const intro =
    audience === "owner"
      ? "Na webu přišla nová poptávka z kalkulačky."
      : `Děkujeme, poptávku jsme přijali. ${brand.responseTime} se ozveme a domluvíme ${brand.measurement.toLowerCase()}.`;

  const text = [
    intro,
    "",
    lead.quote.formattedRange,
    priceDisclaimer,
    "",
    ...rows.map(([label, value]) => `${label}: ${value}`),
  ].join("\n");

  const htmlRows = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:8px 12px 8px 0;color:#6d655c;vertical-align:top">${escapeHtml(label)}</td><td style="padding:8px 0;color:#1c1915">${escapeHtml(value)}</td></tr>`,
    )
    .join("");

  const html = `<div style="font-family:Arial,sans-serif;color:#1c1915;line-height:1.5">
  <p style="margin:0 0 12px">${escapeHtml(intro)}</p>
  <p style="margin:0 0 4px;font-size:22px"><strong>${escapeHtml(lead.quote.formattedRange)}</strong></p>
  <p style="margin:0 0 20px;color:#6d655c">${escapeHtml(priceDisclaimer)}</p>
  <table style="border-collapse:collapse">${htmlRows}</table>
  <p style="margin:24px 0 0;color:#6d655c">${escapeHtml(brand.name)}</p>
</div>`;

  return { subject, html, text };
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
