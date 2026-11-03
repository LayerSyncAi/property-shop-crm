/**
 * Screen corners for each phone photo, normalised 0–1, from
 * scripts/landing/screen-quad.py. Re-run the script and paste its output
 * here whenever a photo changes.
 *
 * Every photo has a light-theme twin under the same key plus "Light",
 * relit on the light page colour with the same hands and phone position.
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
    src: "/landing/hero-v3.jpg",
    mask: "/landing/hero-v3-mask.png",
    width: 2400,
    height: 1355,
    quad: { tl: [0.42318, 0.12088], tr: [0.58457, 0.11956], br: [0.58507, 0.7509], bl: [0.42208, 0.75227] },
  },
  heroLight: {
    src: "/landing/hero-light-v3.jpg",
    mask: "/landing/hero-light-v3-mask.png",
    width: 2400,
    height: 1355,
    quad: { tl: [0.42318, 0.12008], tr: [0.58485, 0.11927], br: [0.58499, 0.75024], bl: [0.42217, 0.75183] },
  },
  stage: {
    src: "/landing/stage-v3.jpg",
    mask: "/landing/stage-v3-mask.png",
    width: 1600,
    height: 2138,
    quad: { tl: [0.3732, 0.10983], tr: [0.75915, 0.15272], br: [0.61259, 0.78585], bl: [0.23377, 0.73843] },
  },
  stageLight: {
    src: "/landing/stage-light-v3.jpg",
    mask: "/landing/stage-light-v3-mask.png",
    width: 1600,
    height: 2138,
    quad: { tl: [0.37302, 0.10896], tr: [0.76002, 0.1521], br: [0.61298, 0.78683], bl: [0.2335, 0.7393] },
  },
  stageAlt: {
    src: "/landing/stage-alt-v3.jpg",
    mask: "/landing/stage-alt-v3-mask.png",
    width: 1600,
    height: 2138,
    quad: { tl: [0.4388, 0.15945], tr: [0.75164, 0.18134], br: [0.63298, 0.75869], bl: [0.32436, 0.71281] },
  },
  stageAltLight: {
    src: "/landing/stage-alt-light-v3.jpg",
    mask: "/landing/stage-alt-light-v3-mask.png",
    width: 1600,
    height: 2138,
    quad: { tl: [0.4388, 0.15806], tr: [0.75271, 0.18], br: [0.63344, 0.75972], bl: [0.32397, 0.71372] },
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
