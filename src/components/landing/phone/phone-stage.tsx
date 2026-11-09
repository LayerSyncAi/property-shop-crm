"use client";

/**
 * A phone photo with live app screens laid onto its screen.
 *
 * The screen corners (quads.ts) give a perspective transform for a 390×844
 * screen element, and the photo's mask clips it, so rounded corners and
 * fingers stay in front. Crops are pure CSS (see .l-phone-stage in
 * landing.css), so the layout never shifts when the script loads.
 *
 * Several screens can be given; they cross-fade, and each one scrolls
 * slowly on its own. With a fine pointer the visitor can scroll the screen
 * with the wheel; on touch it never captures the page's scroll.
 */
import Image from "next/image";
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { PHOTOS, quadMatrix, type PhonePhoto } from "./quads";
import { SCREENS, SCREEN_H, SCREEN_W } from "./screens";

type Crop = { x: [number, number]; y: [number, number] };

type StageProps = {
  photo: keyof typeof PHOTOS;
  screens: string[];
  /** Controlled screen index. Leave unset to cycle on a timer. */
  active?: number;
  cycleMs?: number;
  crop?: Crop;
  mobileCrop?: Crop;
  label: string;
  priority?: boolean;
  sizes?: string;
  showDots?: boolean;
  className?: string;
  style?: CSSProperties;
};

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

function cropVars(photo: PhonePhoto, crop: Crop, prefix: string): Record<string, string> {
  const cw = crop.x[1] - crop.x[0];
  const ch = crop.y[1] - crop.y[0];
  return {
    [`--${prefix}ar`]: String((cw * photo.width) / (ch * photo.height)),
    [`--${prefix}cw`]: String(cw),
    [`--${prefix}ch`]: String(ch),
    [`--${prefix}cx0`]: String(crop.x[0]),
    [`--${prefix}cy0`]: String(crop.y[0]),
  };
}

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function PhoneStage({
  photo: photoKey,
  screens,
  active: controlledActive,
  cycleMs = 7000,
  crop = { x: [0, 1], y: [0, 1] },
  mobileCrop,
  label,
  priority = false,
  sizes = "100vw",
  showDots = false,
  className,
  style,
}: StageProps) {
  const photo: PhonePhoto = PHOTOS[photoKey];
  const innerRef = useRef<HTMLDivElement>(null);
  const screenRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [box, setBox] = useState<{ w: number; h: number } | null>(null);
  const [own, setOwn] = useState(0);
  const [visible, setVisible] = useState(false);
  const hoverRef = useRef(false);
  const userScrollAt = useRef(0);
  const active = controlledActive ?? own;

  // Measure the full-photo box the quad is relative to.
  useIsoLayoutEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    const update = () => setBox({ w: el.clientWidth, h: el.clientHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Only animate while on screen.
  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.05 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Cycle screens when uncontrolled.
  useEffect(() => {
    if (controlledActive !== undefined || screens.length < 2 || !visible || prefersReducedMotion()) return;
    const t = window.setInterval(() => {
      if (!hoverRef.current) setOwn((i) => (i + 1) % screens.length);
    }, cycleMs);
    return () => window.clearInterval(t);
  }, [controlledActive, screens.length, cycleMs, visible]);

  // Reset the scroll of a screen as it comes in.
  useEffect(() => {
    const el = screenRefs.current[active]?.querySelector<HTMLElement>("[data-phone-scroll]");
    if (el) el.scrollTop = 0;
  }, [active, screens]);

  // Slow auto-scroll of the active screen: down, pause, back to the top.
  useEffect(() => {
    if (!visible || prefersReducedMotion()) return;
    const el = screenRefs.current[active]?.querySelector<HTMLElement>("[data-phone-scroll]");
    if (!el) return;
    let raf = 0;
    let last = performance.now();
    let pauseUntil = last + 1600;
    let pos = el.scrollTop;
    const speed = 26; // screen px per second
    const tick = (now: number) => {
      const dt = Math.min(64, now - last);
      last = now;
      const max = el.scrollHeight - el.clientHeight;
      const userRecently = now - userScrollAt.current < 5000;
      if (userRecently || hoverRef.current) {
        pos = el.scrollTop;
      } else if (now > pauseUntil && max > 0) {
        pos += (speed * dt) / 1000;
        if (pos >= max) {
          pos = max;
          el.scrollTop = pos;
          pauseUntil = now + 2200;
          // After the pause, return to the top smoothly.
          window.setTimeout(() => {
            el.scrollTo({ top: 0, behavior: "smooth" });
            pos = 0;
            pauseUntil = performance.now() + 2600;
          }, 2200);
        } else {
          el.scrollTop = pos;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const onWheel = () => {
      userScrollAt.current = performance.now();
    };
    el.addEventListener("wheel", onWheel, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("wheel", onWheel);
    };
  }, [active, visible, screens]);

  const vars = {
    ...cropVars(photo, crop, ""),
    ...(mobileCrop ? cropVars(photo, mobileCrop, "m-") : {}),
  } as CSSProperties;

  // A hidden stage (the other theme's photo) measures 0×0; skip it until shown.
  const px = box && box.w > 0 && box.h > 0
    ? {
        tl: [photo.quad.tl[0] * box.w, photo.quad.tl[1] * box.h] as [number, number],
        tr: [photo.quad.tr[0] * box.w, photo.quad.tr[1] * box.h] as [number, number],
        br: [photo.quad.br[0] * box.w, photo.quad.br[1] * box.h] as [number, number],
        bl: [photo.quad.bl[0] * box.w, photo.quad.bl[1] * box.h] as [number, number],
      }
    : null;
  const transform = px ? quadMatrix(SCREEN_W, SCREEN_H, px) : undefined;

  return (
    <div className={`l-phone-stage ${className ?? ""}`} data-mcrop={mobileCrop ? "" : undefined} style={{ ...vars, ...style }}>
      <div ref={innerRef} className="l-phone-stage-inner">
        <Image src={photo.src} alt="" fill priority={priority} sizes={sizes} style={{ objectFit: "cover" }} />
        <div
          className="l-phone-screen-mask"
          role="img"
          aria-label={label}
          style={{ maskImage: `url(${photo.mask})`, WebkitMaskImage: `url(${photo.mask})`, opacity: transform ? 1 : 0 }}
          onPointerEnter={(e) => {
            if (e.pointerType === "mouse") hoverRef.current = true;
          }}
          onPointerLeave={() => {
            hoverRef.current = false;
          }}
        >
          <div className="l-phone-screen" style={{ width: SCREEN_W, height: SCREEN_H, transform }} aria-hidden>
            {screens.map((id, i) => {
              const Screen = SCREENS[id];
              return (
                <div
                  key={id}
                  ref={(el) => {
                    screenRefs.current[i] = el;
                  }}
                  className="l-phone-screen-page"
                  data-active={i === active ? "" : undefined}
                >
                  {Screen ? <Screen /> : null}
                </div>
              );
            })}
          </div>
          <div className="l-phone-glass" />
        </div>
      </div>
      {showDots && screens.length > 1 ? (
        <div className="l-phone-dots" role="tablist" aria-label="Screens">
          {screens.map((id, i) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={`Show screen ${i + 1} of ${screens.length}`}
              onClick={() => setOwn(i)}
              data-active={i === active ? "" : undefined}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

/**
 * A phone stage with a photo for each theme. Both are rendered and CSS shows
 * the one for the current theme (.l-only-dark / .l-only-light), so the right
 * photo is there on first paint, with no flash. Light photos are the same shot
 * relit on the light page colour, so one crop fits both.
 */
export function ThemedPhoneStage({
  photo,
  priority,
  className,
  label,
  ...rest
}: Omit<StageProps, "photo"> & { photo: "hero" | "stage" | "stageAlt" }) {
  return (
    <>
      <PhoneStage {...rest} photo={photo} label={label} priority={priority} className={`l-only-dark ${className ?? ""}`} />
      <PhoneStage {...rest} photo={`${photo}Light`} label={label} className={`l-only-light ${className ?? ""}`} />
    </>
  );
}
