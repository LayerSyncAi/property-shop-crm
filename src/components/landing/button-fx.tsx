"use client";

/**
 * The liquid press for every landing button (.l-btn, .l-orb): a ripple that
 * spreads from where the pointer went down, and a small jelly bounce. One
 * delegated listener on the landing root, so the buttons themselves stay
 * server-rendered. The styles live in landing.css.
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
  window.setTimeout(() => el.classList.remove("is-rippling"), 760);
}

export function ButtonFX() {
  useEffect(() => {
    const root = document.getElementById(ROOT_ID);
    if (!root) return;
    const onPointerDown = (e: PointerEvent) => {
      const el = (e.target as Element | null)?.closest<HTMLElement>(SELECTOR);
      if (!el || !root.contains(el)) return;
      const r = el.getBoundingClientRect();
      ripple(el, e.clientX - r.left, e.clientY - r.top);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      const el = (e.target as Element | null)?.closest<HTMLElement>(SELECTOR);
      if (!el || !root.contains(el)) return;
      ripple(el, el.offsetWidth / 2, el.offsetHeight / 2);
    };
    root.addEventListener("pointerdown", onPointerDown);
    root.addEventListener("keydown", onKeyDown);
    return () => {
      root.removeEventListener("pointerdown", onPointerDown);
      root.removeEventListener("keydown", onKeyDown);
    };
  }, []);
  return null;
}
