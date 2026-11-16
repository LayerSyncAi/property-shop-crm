"use client";

/**
 * Light and touch for every landing button (.l-btn, .l-orb), on one
 * delegated listener so the buttons themselves stay server-rendered:
 *
 * - the specular highlight follows the pointer (--mx / --my, registered
 *   with @property in landing.css so it glides). It follows fully side to
 *   side but only partly up and down, so it stays near the top like real
 *   overhead light;
 * - a press sends a ripple out from the press point (--rx / --ry and the
 *   .is-rippling class). A keyboard press ripples from the centre.
 */
import { useEffect } from "react";
import { ROOT_ID } from "./theme";

const SELECTOR = ".l-btn, .l-orb";

function ripple(el: HTMLElement, x: number, y: number) {
  el.style.setProperty("--rx", `${x}px`);
  el.style.setProperty("--ry", `${y}px`);
  el.classList.remove("is-rippling");
  // Force a reflow so the animation restarts on quick repeat presses.
  void el.offsetWidth;
  el.classList.add("is-rippling");
  window.setTimeout(() => el.classList.remove("is-rippling"), 820);
}

export function ButtonFX() {
  useEffect(() => {
    const root = document.getElementById(ROOT_ID);
    if (!root) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let lit: HTMLElement | null = null;
    let raf = 0;

    const release = () => {
      lit?.style.removeProperty("--mx");
      lit?.style.removeProperty("--my");
      lit = null;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || reduce.matches) return;
      const el = (e.target as Element | null)?.closest<HTMLElement>(SELECTOR) ?? null;
      if (el !== lit) release();
      if (!el || !root.contains(el)) return;
      lit = el;
      const { clientX, clientY } = e;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const px = ((clientX - r.left) / r.width) * 100;
        const py = ((clientY - r.top) / r.height) * 100;
        el.style.setProperty("--mx", `${Math.max(0, Math.min(100, px)).toFixed(1)}%`);
        el.style.setProperty("--my", `${(-20 + Math.max(0, Math.min(100, py)) * 0.35).toFixed(1)}%`);
      });
    };

    const onPointerDown = (e: PointerEvent) => {
      const el = (e.target as Element | null)?.closest<HTMLElement>(SELECTOR);
      if (!el || !root.contains(el) || reduce.matches) return;
      const r = el.getBoundingClientRect();
      ripple(el, e.clientX - r.left, e.clientY - r.top);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.key !== "Enter" && e.key !== " ") || reduce.matches) return;
      const el = (e.target as Element | null)?.closest<HTMLElement>(SELECTOR);
      if (!el || !root.contains(el)) return;
      ripple(el, el.offsetWidth / 2, el.offsetHeight / 2);
    };

    root.addEventListener("pointermove", onPointerMove);
    root.addEventListener("pointerleave", release);
    root.addEventListener("pointerdown", onPointerDown);
    root.addEventListener("keydown", onKeyDown);
    return () => {
      cancelAnimationFrame(raf);
      root.removeEventListener("pointermove", onPointerMove);
      root.removeEventListener("pointerleave", release);
      root.removeEventListener("pointerdown", onPointerDown);
      root.removeEventListener("keydown", onKeyDown);
    };
  }, []);
  return null;
}
