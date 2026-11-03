#!/usr/bin/env python3
"""Prepare the landing page's phone photos for live-screen compositing.

Each source photo shows a phone with a flat chroma-green screen. For each one
this script:

1. finds the screen: strict green threshold, then a flood fill from the
   middle of the green area so green light spilled on the hands is left out;
2. fits a straight line to each of the screen's four edges and intersects
   them, which gives the true corners even though the screen corners are
   rounded;
3. writes a mask PNG (white, alpha = screen, slightly grown and feathered)
   that the page uses to clip the live screen, so rounded corners and
   anything in front of the glass stay on top;
4. paints the green screen near-black and calms the green spill right at
   its edge, so the photo never flashes green while the page loads;
5. prints the corners, normalised 0-1, for src/components/landing/phone/quads.ts.

Usage:
    python3 -I scripts/landing/screen-quad.py <src.png> <out-name> [max-width]

Outputs public/landing/<out-name>.jpg and public/landing/<out-name>-mask.png.
Requires Pillow and numpy.
"""

import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

OUT_DIR = Path(__file__).resolve().parents[2] / "public" / "landing"
SCREEN_FILL = (11, 15, 18)


def find_screen(rgb: np.ndarray) -> np.ndarray:
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    strict = (g > 200) & (r < 90) & (b < 110)
    ys, xs = np.nonzero(strict)
    if len(xs) == 0:
        raise SystemExit("no green screen found")
    seed = (int(np.median(xs)), int(np.median(ys)))
    if not strict[seed[1], seed[0]]:
        raise SystemExit(f"seed {seed} is not on the screen")
    mask_img = Image.fromarray(strict.astype("uint8") * 255).copy()
    ImageDraw.floodfill(mask_img, seed, 128)
    screen = np.array(mask_img) == 128
    # Close pinholes (glare specks) inside the screen.
    closed = Image.fromarray(screen.astype("uint8") * 255).filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.MinFilter(5))
    return np.array(closed) > 127


def fit_edge(points: np.ndarray, vertical: bool) -> tuple[float, float]:
    """Least-squares line. Horizontal edges: y = a*x + b. Vertical: x = a*y + b."""
    if vertical:
        a, b = np.polyfit(points[:, 1], points[:, 0], 1)
    else:
        a, b = np.polyfit(points[:, 0], points[:, 1], 1)
    return float(a), float(b)


def corners(screen: np.ndarray) -> dict:
    ys, xs = np.nonzero(screen)
    x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
    w, h = x1 - x0, y1 - y0
    top, bottom, left, right = [], [], [], []
    # Sample the middle 60% of each edge, away from the rounded corners.
    for x in range(int(x0 + 0.2 * w), int(x1 - 0.2 * w)):
        col = np.nonzero(screen[:, x])[0]
        if len(col):
            top.append((x, col.min()))
            bottom.append((x, col.max()))
    for y in range(int(y0 + 0.2 * h), int(y1 - 0.2 * h)):
        row = np.nonzero(screen[y, :])[0]
        if len(row):
            left.append((row.min(), y))
            right.append((row.max(), y))
    t = fit_edge(np.array(top), False)
    btm = fit_edge(np.array(bottom), False)
    lft = fit_edge(np.array(left), True)
    rgt = fit_edge(np.array(right), True)

    def meet(hline, vline):
        # y = ha*x + hb ; x = va*y + vb
        ha, hb = hline
        va, vb = vline
        y = (ha * vb + hb) / (1 - ha * va)
        x = va * y + vb
        return x, y

    return {"tl": meet(t, lft), "tr": meet(t, rgt), "br": meet(btm, rgt), "bl": meet(btm, lft)}


def main() -> None:
    src, name = sys.argv[1], sys.argv[2]
    max_w = int(sys.argv[3]) if len(sys.argv) > 3 else 2400
    img = Image.open(src).convert("RGB")
    rgb = np.asarray(img).astype(int)
    screen = find_screen(rgb)
    quad = corners(screen)
    H, W = screen.shape

    # Grow the mask a little so it covers the anti-aliased green fringe.
    grown = np.array(Image.fromarray(screen.astype("uint8") * 255).filter(ImageFilter.MaxFilter(5))) > 127

    # Paint the screen dark and calm the spill in a thin ring around it.
    out = rgb.copy()
    out[grown] = SCREEN_FILL
    ring = np.array(Image.fromarray(grown.astype("uint8") * 255).filter(ImageFilter.MaxFilter(13))) > 127
    ring &= ~grown
    r, g, b = out[..., 0], out[..., 1], out[..., 2]
    limit = np.maximum(r, b) + 18
    g_new = np.where(ring & (g > limit), limit, g)
    out[..., 1] = g_new

    photo = Image.fromarray(out.clip(0, 255).astype("uint8"))
    scale = min(1.0, max_w / W)
    size = (round(W * scale), round(H * scale))
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    photo.resize(size, Image.LANCZOS).save(OUT_DIR / f"{name}.jpg", quality=88, optimize=True, progressive=True)

    alpha = Image.fromarray(grown.astype("uint8") * 255).filter(ImageFilter.GaussianBlur(1.2))
    mask_size = (round(W * scale * 0.5), round(H * scale * 0.5))
    alpha = alpha.resize(mask_size, Image.LANCZOS)
    mask = Image.new("LA", mask_size, 255)
    mask.putalpha(alpha)
    mask.save(OUT_DIR / f"{name}-mask.png", optimize=True)

    norm = {k: [round(x / W, 5), round(y / H, 5)] for k, (x, y) in quad.items()}
    fill = screen.sum() / ((screen.any(0).sum()) * (screen.any(1).sum()))
    print(json.dumps({"name": name, "width": size[0], "height": size[1], "quad": norm, "fill": round(float(fill), 4)}))


if __name__ == "__main__":
    main()
