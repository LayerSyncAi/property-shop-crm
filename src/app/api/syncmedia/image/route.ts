import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";

/**
 * Same-origin passthrough for property photos, used only by the SyncMedia
 * brochure exporter.
 *
 * Brochures are rasterised in the browser with html2canvas. That needs pixel
 * access to every photo, and imported listings carry images from hosts that
 * serve no `Access-Control-Allow-Origin` header, so a direct fetch fails and
 * the photo exports blank. Re-serving the bytes from our own origin makes them
 * same-origin and readable.
 *
 * This is a proxy, so it is deliberately narrow: signed-in callers only, https
 * only, hosts on an allowlist, image content types only, and a size cap. That
 * closes the obvious SSRF and open-relay uses.
 */

/**
 * Hosts whose images a brochure may embed. Extend this when property photos
 * start coming from somewhere new — an unlisted host fails closed, and the
 * exporter falls back to the original URL (which simply rasterises blank and
 * is reported to the agent rather than silently shipping).
 *
 * Convex storage is matched by suffix because the subdomain is per-deployment.
 */
const ALLOWED_HOSTS = ["propertybook.co.zw", "images.unsplash.com"];
const ALLOWED_HOST_SUFFIXES = [".convex.cloud", ".propertybook.co.zw"];

const MAX_BYTES = 12 * 1024 * 1024;
const FETCH_TIMEOUT_MS = 15_000;

function isAllowed(host: string) {
  const lower = host.toLowerCase();
  return (
    ALLOWED_HOSTS.includes(lower) ||
    ALLOWED_HOST_SUFFIXES.some((suffix) => lower.endsWith(suffix))
  );
}

export async function GET(request: Request) {
  const token = await convexAuthNextjsToken();
  if (!token) {
    return new Response("Unauthorized", { status: 401 });
  }

  const target = new URL(request.url).searchParams.get("url");
  if (!target) {
    return new Response("Missing url", { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(target);
  } catch {
    return new Response("Invalid url", { status: 400 });
  }

  if (parsed.protocol !== "https:" || !isAllowed(parsed.hostname)) {
    return new Response("Host not allowed", { status: 403 });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const upstream = await fetch(parsed.toString(), {
      signal: controller.signal,
      // Never forward the caller's cookies or auth to a third party.
      credentials: "omit",
      redirect: "follow",
    });

    if (!upstream.ok || !upstream.body) {
      return new Response("Upstream error", { status: 502 });
    }

    const contentType = upstream.headers.get("content-type") ?? "";
    if (!contentType.startsWith("image/")) {
      return new Response("Not an image", { status: 415 });
    }

    const declaredLength = Number(upstream.headers.get("content-length") ?? 0);
    if (declaredLength > MAX_BYTES) {
      return new Response("Image too large", { status: 413 });
    }

    // Buffered rather than streamed so the size cap is actually enforced on
    // responses that don't declare a content-length.
    const bytes = await upstream.arrayBuffer();
    if (bytes.byteLength > MAX_BYTES) {
      return new Response("Image too large", { status: 413 });
    }

    return new Response(bytes, {
      headers: {
        "content-type": contentType,
        "content-length": String(bytes.byteLength),
        "cache-control": "private, max-age=3600",
      },
    });
  } catch {
    return new Response("Upstream fetch failed", { status: 502 });
  } finally {
    clearTimeout(timer);
  }
}
