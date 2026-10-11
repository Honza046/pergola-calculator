import "server-only";

import { Resend } from "resend";

import { renderLeadEmail } from "@/lib/email";
import { sheetRow, type ReadyLead } from "@/lib/lead";

export interface DeliveryResult {
  email: "sent" | "partial" | "skipped" | "failed";
  sheet: "sent" | "skipped" | "failed";
}

export async function deliverLead(lead: ReadyLead): Promise<DeliveryResult> {
  const config = readConfig();
  const result: DeliveryResult = { email: "skipped", sheet: "skipped" };

  if (config.apiKey && config.from && config.to.length > 0) {
    result.email = await sendEmails(config, lead);
  }

  if (config.sheetUrl) {
    result.sheet = await sendSheet(config, lead);
  }

  return result;
}

function readConfig() {
  return {
    apiKey: process.env.RESEND_API_KEY?.trim() ?? "",
    from: process.env.RESEND_FROM?.trim() ?? "",
    to: (process.env.LEAD_TO_EMAIL ?? "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    sheetUrl: process.env.GOOGLE_SHEETS_WEBHOOK_URL?.trim() ?? "",
    sheetSecret: process.env.GOOGLE_SHEETS_WEBHOOK_SECRET?.trim() ?? "",
  };
}

async function sendEmails(
  config: ReturnType<typeof readConfig>,
  lead: ReadyLead,
): Promise<DeliveryResult["email"]> {
  const resend = new Resend(config.apiKey);
  const owner = renderLeadEmail(lead, "owner");
  const client = renderLeadEmail(lead, "client");
  const attachments = lead.photos.map((photo, index) => {
    const type = contentTypeOf(photo.dataUrl);
    const extension = type === "image/png" ? "png" : type === "image/webp" ? "webp" : "jpg";
    return {
      filename: `misto-${index + 1}.${extension}`,
      content: photo.dataUrl.split(",")[1] ?? "",
      contentType: type,
    };
  });

  try {
    const ownerResult = await resend.emails.send({
      from: config.from,
      to: config.to,
      replyTo: lead.email,
      subject: owner.subject,
      html: owner.html,
      text: owner.text,
      ...(attachments.length ? { attachments } : {}),
    });
    if (ownerResult.error) throw new Error(ownerResult.error.message);
  } catch (error) {
    console.error("[lead] owner email", lead.leadId, error instanceof Error ? error.message : error);
    return "failed";
  }

  try {
    const clientResult = await resend.emails.send({
      from: config.from,
      to: lead.email,
      replyTo: config.to[0],
      subject: client.subject,
      html: client.html,
      text: client.text,
    });
    if (clientResult.error) throw new Error(clientResult.error.message);
  } catch (error) {
    console.error("[lead] client email", lead.leadId, error instanceof Error ? error.message : error);
    return "partial";
  }

  return "sent";
}

async function sendSheet(
  config: ReturnType<typeof readConfig>,
  lead: ReadyLead,
): Promise<DeliveryResult["sheet"]> {
  try {
    const response = await fetch(config.sheetUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret: config.sheetSecret, row: sheetRow(lead) }),
      signal: AbortSignal.timeout(12_000),
    });
    if (!response.ok) {
      console.error("[lead] sheet", lead.leadId, response.status);
      return "failed";
    }
    return "sent";
  } catch (error) {
    console.error("[lead] sheet", lead.leadId, error instanceof Error ? error.message : error);
    return "failed";
  }
}

function contentTypeOf(dataUrl: string) {
  if (dataUrl.startsWith("data:image/png")) return "image/png";
  if (dataUrl.startsWith("data:image/webp")) return "image/webp";
  return "image/jpeg";
}
