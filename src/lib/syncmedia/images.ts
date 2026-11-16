/**
 * html2canvas rasterises through a cloned document, and any remote image that
 * isn't CORS-clean silently taints the canvas — the export comes out with
 * blank holes where the photos were. Converting every remote URL to a data URL
 * up front sidesteps it entirely: by the time we rasterise, nothing is remote.
 *
 * Uploaded photos are already object URLs and pass straight through.
 */

import type { Photo } from "./types";

const cache = new Map<string, string>();

const FETCH_TIMEOUT_MS = 20_000;

function isInline(url: string) {
  return url.startsWith("data:") || url.startsWith("blob:");
}

async function readAsDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

async function fetchBlob(url: string): Promise<Blob> {
  // fetch has no default timeout, so a CDN that accepts the connection and
  // then stalls would leave the export spinning forever.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      mode: "cors",
      credentials: "omit",
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Image fetch failed: ${response.status}`);
    return await response.blob();
  } finally {
    clearTimeout(timer);
  }
}

async function toDataUrl(url: string): Promise<string> {
  const cached = cache.get(url);
  if (cached) return cached;

  let blob: Blob;
  try {
    // Direct first: Convex storage and any other CORS-friendly host needs no
    // proxy hop.
    blob = await fetchBlob(url);
  } catch {
    // Imported listings carry images from hosts that send no CORS headers, so
    // the direct read fails and the photo would rasterise blank. Re-fetch it
    // through our own origin, which is same-origin and therefore readable.
    blob = await fetchBlob(`/api/syncmedia/image?url=${encodeURIComponent(url)}`);
  }

  const dataUrl = await readAsDataUrl(blob);
  cache.set(url, dataUrl);
  return dataUrl;
}

/** Best-effort inline of a single asset; returns null when it can't be read. */
async function inlineOne(url: string | undefined): Promise<string | null> {
  if (!url) return null;
  if (isInline(url)) return url;
  try {
    return await toDataUrl(url);
  } catch {
    return null;
  }
}

/**
 * Everything on the canvas that comes down the wire: the photos and both logo
 * variants. A logo taints the raster exactly as a photo does, so it cannot be
 * left out.
 *
 * Best-effort: an asset we can't inline is returned untouched so the export
 * still produces a brochure rather than failing outright — but it will
 * rasterise blank, so the count of failures comes back for the caller to warn
 * about instead of silently shipping a brochure with a hole in it.
 */
export async function inlineAssets(
  photos: Photo[],
  logoUrl?: string,
  logoOnDarkUrl?: string
): Promise<{
  photos: Photo[];
  logoUrl?: string;
  logoOnDarkUrl?: string;
  failed: number;
}> {
  let failed = 0;

  const inlinedPhotos = await Promise.all(
    photos.map(async (photo) => {
      const url = await inlineOne(photo.url);
      if (url === null) {
        failed += 1;
        return photo;
      }
      // Only `url` is swapped for the data URL. `ref` is what persists, and
      // rewriting it here would save a base64 blob onto the draft.
      return { ...photo, url };
    })
  );

  const [inlinedLogo, inlinedLogoOnDark] = await Promise.all([
    inlineOne(logoUrl),
    inlineOne(logoOnDarkUrl),
  ]);
  if (logoUrl && inlinedLogo === null) failed += 1;
  if (logoOnDarkUrl && inlinedLogoOnDark === null) failed += 1;

  return {
    photos: inlinedPhotos,
    logoUrl: inlinedLogo ?? logoUrl,
    logoOnDarkUrl: inlinedLogoOnDark ?? logoOnDarkUrl,
    failed,
  };
}

/** Resolves once every `<img>` inside `node` has decoded, or after `timeoutMs`. */
export async function waitForImages(node: HTMLElement, timeoutMs = 8000): Promise<void> {
  const images = Array.from(node.querySelectorAll("img"));
  const pending = images.map((img) =>
    img.complete && img.naturalWidth > 0
      ? Promise.resolve()
      : new Promise<void>((resolve) => {
          img.addEventListener("load", () => resolve(), { once: true });
          img.addEventListener("error", () => resolve(), { once: true });
        })
  );

  await Promise.race([
    Promise.all(pending),
    new Promise<void>((resolve) => setTimeout(resolve, timeoutMs)),
  ]);
}

/**
 * Shrinks a picked image before it is uploaded. A 12 MP phone photo is far
 * larger than any brochure slot needs, and uploading it whole is slow on the
 * connections agents actually work on.
 */
export async function downscaleImage(
  file: File,
  maxDim = 1600,
  quality = 0.82
): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return file;
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", quality)
  );
  // Falling back to the original is better than failing the upload outright.
  return blob ?? file;
}
