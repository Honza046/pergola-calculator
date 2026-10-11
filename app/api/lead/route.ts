import { prepareLead } from "@/lib/lead";
import { parseLeadRequest } from "@/lib/schemas";
import { clientAddress, rateLimit } from "@/lib/rate-limit";
import { deliverLead } from "@/lib/deliver";

export const maxDuration = 30;

export async function POST(request: Request) {
  const limit = rateLimit(clientAddress(request));
  if (!limit.ok) {
    return jsonError("Z této sítě už přišlo několik poptávek. Zkuste to prosím později.", 429);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Poptávku se nepodařilo přečíst.", 400);
  }

  const parsed = parseLeadRequest(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Zkontrolujte údaje ve formuláři.", 400);
  }

  const lead = prepareLead(parsed.data);
  if (parsed.data.hpField.trim()) {
    return Response.json({
      ok: true,
      leadId: lead.leadId,
      quote: lead.quote,
      delivery: { email: "sent", sheet: "sent" },
    });
  }

  const delivery = await deliverLead(lead);
  const captured =
    delivery.email === "sent" || delivery.email === "partial" || delivery.sheet === "sent";
  const unconfigured = delivery.email === "skipped" && delivery.sheet === "skipped";

  if (unconfigured && process.env.NODE_ENV !== "production") {
    console.info(
      "[lead:demo]",
      lead.leadId,
      lead.structureType,
      lead.city,
      lead.quote.formattedRange,
      lead.fullName,
      lead.email,
      lead.phone,
    );
    return Response.json({ ok: true, leadId: lead.leadId, quote: lead.quote, delivery });
  }

  if (!captured) {
    return jsonError("Poptávku teď nedokážeme přijmout. Zkuste to prosím za chvíli znovu.", 503);
  }

  console.info("[lead]", lead.leadId, delivery);
  return Response.json({ ok: true, leadId: lead.leadId, quote: lead.quote, delivery });
}

function jsonError(message: string, status: number) {
  return Response.json({ ok: false, message }, { status });
}
