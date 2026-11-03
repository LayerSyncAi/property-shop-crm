/**
 * Screen corners for each phone photo, normalised 0–1, from
 * scripts/landing/screen-quad.py. Re-run the script and paste its output
 * here whenever a photo changes.
 */
export type Quad = { tl: [number, number]; tr: [number, number]; br: [number, number]; bl: [number, number] };

export type PhonePhoto = {
  src: string;
  mask: string;
  width: number;
  height: number;
  quad: Quad;
};

export const PHOTOS = {
  hero: {
    src: "/landing/hero.jpg",
    mask: "/landing/hero-mask.png",
    width: 2400,
    height: 1357,
    quad: { tl: [0.42403, 0.14583], tr: [0.57835, 0.14654], br: [0.57601, 0.73355], bl: [0.4231, 0.73355] },
  },
  stage: {
    src: "/landing/stage.jpg",
    mask: "/landing/stage-mask.png",
    width: 1600,
    height: 2000,
    quad: { tl: [0.36182, 0.15362], tr: [0.6325, 0.15844], br: [0.61122, 0.66815], bl: [0.33541, 0.65831] },
  },
  stageAlt: {
    src: "/landing/stage-alt.jpg",
    mask: "/landing/stage-alt-mask.png",
    width: 1600,
    height: 2000,
    quad: { tl: [0.38056, 0.15769], tr: [0.66546, 0.1486], br: [0.6609, 0.7], bl: [0.37829, 0.7] },
  },
} satisfies Record<string, PhonePhoto>;

/**
 * CSS matrix3d that maps a w×h element (origin top-left) onto the four
 * points of a quad, in pixels. Square-to-quad projective mapping (Heckbert),
 * composed with a scale from w×h down to the unit square.
 */
export function quadMatrix(w: number, h: number, p: { tl: [number, number]; tr: [number, number]; br: [number, number]; bl: [number, number] }): string {
  const [x0, y0] = p.tl;
  const [x1, y1] = p.tr;
  const [x2, y2] = p.br;
  const [x3, y3] = p.bl;
  const dx1 = x1 - x2;
  const dx2 = x3 - x2;
  const dx3 = x0 - x1 + x2 - x3;
  const dy1 = y1 - y2;
  const dy2 = y3 - y2;
  const dy3 = y0 - y1 + y2 - y3;
  let a: number, b: number, d: number, e: number, g: number, hh: number;
  if (Math.abs(dx3) < 1e-9 && Math.abs(dy3) < 1e-9) {
    a = x1 - x0;
    b = x2 - x1;
    d = y1 - y0;
    e = y2 - y1;
    g = 0;
    hh = 0;
  } else {
    const den = dx1 * dy2 - dx2 * dy1;
    g = (dx3 * dy2 - dx2 * dy3) / den;
    hh = (dx1 * dy3 - dx3 * dy1) / den;
    a = x1 - x0 + g * x1;
    b = x3 - x0 + hh * x3;
    d = y1 - y0 + g * y1;
    e = y3 - y0 + hh * y3;
  }
  const cx = x0;
  const fy = y0;
  // Scale input from w×h to the unit square.
  const m = [a / w, d / w, 0, g / w, b / h, e / h, 0, hh / h, 0, 0, 1, 0, cx, fy, 0, 1];
  return `matrix3d(${m.map((v) => +v.toFixed(10)).join(",")})`;
}
