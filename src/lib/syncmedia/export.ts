import type { FormatPreset } from "./formats";
import { waitForImages } from "./images";

/**
 * The node passed here is already laid out at the preset's exact pixel size,
 * so we rasterise at `scale: 1`. Dividing a target width by `node.offsetWidth`
 * would produce `Infinity` whenever the node sits inside a hidden wrapper,
 * which is exactly where the export node lives.
 *
 * html2canvas and jsPDF are both loaded on demand: together they are a large
 * chunk, and an agent who never opens SyncMedia should never pay for them.
 */
async function rasterise(
  node: HTMLElement,
  preset: FormatPreset
): Promise<HTMLCanvasElement> {
  const html2canvas = (await import("html2canvas")).default;

  // Webfonts that haven't loaded rasterise as fallback metrics, which shifts
  // every line of the brochure.
  if (typeof document !== "undefined" && document.fonts) {
    await document.fonts.ready;
  }
  await waitForImages(node);

  return html2canvas(node, {
    scale: 1,
    useCORS: true,
    allowTaint: false,
    backgroundColor: null,
    width: preset.width,
    height: preset.height,
    windowWidth: preset.width,
    windowHeight: preset.height,
    logging: false,
    // The source node is parked off-screen at `opacity: 0` so it never flashes
    // over the editor. html2canvas clones computed styles, so that zero would
    // be honoured in the raster too unless we undo it on the clone.
    onclone: (cloned) => {
      cloned.querySelectorAll<HTMLElement>("[data-brochure-export]").forEach((el) => {
        el.style.opacity = "1";
        el.style.left = "0px";
        el.style.top = "0px";
      });
    },
  });
}

function triggerDownload(href: string, filename: string) {
  const link = document.createElement("a");
  link.href = href;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function exportPng(
  node: HTMLElement,
  preset: FormatPreset,
  filename: string
): Promise<void> {
  const canvas = await rasterise(node, preset);
  triggerDownload(canvas.toDataURL("image/png"), filename);
}

export async function exportPdf(
  node: HTMLElement,
  preset: FormatPreset,
  filename: string
): Promise<void> {
  const canvas = await rasterise(node, preset);
  const { jsPDF } = await import("jspdf");

  // Fall back to converting px at 150 DPI when a preset carries no physical
  // size, rather than assuming 100 DPI everywhere.
  const mm = preset.pdfMm ?? {
    width: (preset.width / 150) * 25.4,
    height: (preset.height / 150) * 25.4,
  };

  const pdf = new jsPDF({
    orientation: mm.width > mm.height ? "landscape" : "portrait",
    unit: "mm",
    format: [mm.width, mm.height],
    compress: true,
  });
  pdf.addImage(canvas.toDataURL("image/jpeg", 0.92), "JPEG", 0, 0, mm.width, mm.height);
  pdf.save(filename);
}

/**
 * Copies the rendered brochure to the clipboard as a PNG.
 *
 * The clipboard write is raced against a timeout because `clipboard.write()`
 * does not always settle — if the window loses focus at the wrong moment it
 * can hang forever, which would otherwise leave the button stuck mid-copy with
 * no way back.
 */
export async function copyPngToClipboard(
  node: HTMLElement,
  preset: FormatPreset
): Promise<void> {
  const canvas = await rasterise(node, preset);
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/png")
  );
  if (!blob) throw new Error("Could not read the rendered brochure.");

  await Promise.race([
    navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Clipboard write timed out.")), 5000)
    ),
  ]);
}

export function isClipboardImageSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof ClipboardItem !== "undefined" &&
    !!navigator.clipboard?.write
  );
}

/** `4 Bed Cluster, Borrowdale` → `4-bed-cluster-borrowdale-story`. */
export function buildFilename(title: string, formatKey: string): string {
  const slug =
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "brochure";
  return `${slug}-${formatKey}`;
}
