"use client";

/**
 * Dark/light theme for the landing page only. The page starts dark; the
 * visitor's choice is saved in localStorage under "se-theme". The no-flash
 * script in landing.tsx applies the saved choice before first paint; this
 * file keeps every toggle on the page in sync with the root's data-theme.
 */
import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";

export const THEME_KEY = "se-theme";
export const ROOT_ID = "landing-root";

type Theme = "dark" | "light";

function root() {
  return document.getElementById(ROOT_ID);
}

function subscribe(onChange: () => void) {
  const el = root();
  if (!el) return () => {};
  const mo = new MutationObserver(onChange);
  mo.observe(el, { attributes: true, attributeFilter: ["data-theme"] });
  return () => mo.disconnect();
}

function getTheme(): Theme {
  return root()?.dataset.theme === "light" ? "light" : "dark";
}

export function useLandingTheme(): [Theme, () => void] {
  const theme = useSyncExternalStore(subscribe, getTheme, () => "dark" as Theme);
  const toggle = () => {
    const next: Theme = getTheme() === "dark" ? "light" : "dark";
    const el = root();
    if (el) el.dataset.theme = next;
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      // Private mode: the choice just isn't remembered.
    }
  };
  return [theme, toggle];
}

export function ThemeToggle({ className }: { className?: string }) {
  const [theme, toggle] = useLandingTheme();
  const toLight = theme === "dark";
  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={!toLight}
      aria-label={toLight ? "Switch to light theme" : "Switch to dark theme"}
      title={toLight ? "Light theme" : "Dark theme"}
      className={`l-orb grid h-9 w-9 flex-none place-items-center ${className ?? ""}`}
    >
      <Sun size={16} strokeWidth={1.8} className={`absolute transition-all duration-300 ${toLight ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-50 opacity-0"}`} />
      <Moon size={16} strokeWidth={1.8} className={`absolute transition-all duration-300 ${toLight ? "rotate-90 scale-50 opacity-0" : "rotate-0 scale-100 opacity-100"}`} />
    </button>
  );
}

/** Applies the saved theme before first paint. Rendered inside the root. */
export const noFlashScript = `(function(){try{var t=localStorage.getItem("${THEME_KEY}");if(t==="light"||t==="dark"){document.getElementById("${ROOT_ID}").dataset.theme=t}}catch(e){}})();`;
