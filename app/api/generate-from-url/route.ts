import { allocateUniqueSlug, saveCompany } from "@/lib/companies";
import {
  fetchPageSignals,
  generateCompanyFromPage,
  normalizeHttpUrl,
} from "@/lib/generate-company";

// Node is the default Route Handler runtime; `export const runtime` is
// incompatible with nextConfig.cacheComponents.
export const maxDuration = 60;

type Body = { url?: string };

export async function POST(request: Request) {
  if (!process.env.AI_GATEWAY_API_KEY && !process.env.OPENAI_API_KEY) {
    return jsonError(
      "Chybí AI_GATEWAY_API_KEY nebo OPENAI_API_KEY v prostředí.",
      503,
    );
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return jsonError("Požadavek se nepodařilo přečíst.", 400);
  }

  let url: string;
  try {
    url = normalizeHttpUrl(body.url ?? "");
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Neplatná URL.", 400);
  }

  try {
    const signals = await fetchPageSignals(url);
    const generated = await generateCompanyFromPage(url, signals);
    const slug = await allocateUniqueSlug(generated.companyName, generated.suggestedSlug);
    const config = await saveCompany({
      ...generated,
      slug,
      logoUrl: generated.logoUrl || signals.logoUrl,
    });

    const origin = requestOrigin(request);
    return Response.json({
      ok: true,
      config,
      slug: config.slug,
      urls: {
        page: `${origin}/c/${config.slug}`,
        embed: `${origin}/c/${config.slug}/embed`,
      },
    });
  } catch (error) {
    console.error("[generate-from-url]", error);
    const message =
      error instanceof Error ? error.message : "Generování konfigurace selhalo.";
    return jsonError(message, 500);
  }
}

function requestOrigin(request: Request) {
  const proto = request.headers.get("x-forwarded-proto") ?? "http";
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (host) return `${proto}://${host}`;
  try {
    return new URL(request.url).origin;
  } catch {
    return "http://localhost:3000";
  }
}

function jsonError(message: string, status: number) {
  return Response.json({ ok: false, message }, { status });
}
