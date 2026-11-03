"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { navLinks } from "./content";
import { Logo, Roll, WhatsAppButton } from "./bits";
import { ThemeToggle } from "./theme";

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-3 z-50 px-3 sm:top-4 sm:px-4">
      <nav
        aria-label="Main"
        className={`mx-auto flex h-14 max-w-[1200px] items-center justify-between gap-3 rounded-full border border-[var(--l-line)] bg-[var(--l-nav)] pl-6 pr-2 backdrop-blur-xl sm:pl-7 transition-shadow duration-300 ${
          scrolled ? "shadow-[0_12px_40px_-12px_rgba(0,0,0,0.45)]" : ""
        }`}
      >
        <Link href="#top" aria-label="SyncEstate, back to top" className="flex flex-none items-center">
          <Logo />
        </Link>

        <ul className="hidden items-center gap-1 lg:flex">
          {navLinks.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="rounded-full px-3 py-2 text-sm text-[var(--l-ink-2)] transition-colors hover:text-[var(--l-ink)]">
                <Roll>{l.label}</Roll>
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href="/login" className="l-btn l-btn-ghost l-btn-sm hidden sm:inline-flex">
            <Roll>Log in</Roll>
          </Link>
          <WhatsAppButton size="sm" cta="nav" className="hidden sm:inline-flex">
            Chat on WhatsApp
          </WhatsAppButton>
          <button
            type="button"
            className="l-orb l-orb-solid grid h-10 w-10 place-items-center sm:hidden"
            aria-expanded={open}
            aria-controls="landing-mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((o) => !o)}
          >
            <span className="relative block h-3 w-4">
              <span className={`absolute left-0 h-0.5 w-4 rounded bg-current transition-all duration-300 ${open ? "top-[5px] rotate-45" : "top-0"}`} />
              <span className={`absolute left-0 top-[5px] h-0.5 w-4 rounded bg-current transition-opacity duration-200 ${open ? "opacity-0" : ""}`} />
              <span className={`absolute left-0 h-0.5 w-4 rounded bg-current transition-all duration-300 ${open ? "top-[5px] -rotate-45" : "top-[10px]"}`} />
            </span>
          </button>
        </div>
      </nav>

      <div
        id="landing-mobile-menu"
        hidden={!open}
        className="mx-auto mt-2 max-w-[1200px] rounded-[28px] border border-[var(--l-line)] bg-[var(--l-bg-raised)] p-3 shadow-2xl sm:hidden"
      >
        <ul className="flex flex-col">
          {navLinks.map((l) => (
            <li key={l.href}>
              <a href={l.href} onClick={() => setOpen(false)} className="block rounded-2xl px-4 py-3 text-2xl font-medium tracking-tight text-[var(--l-ink)] hover:bg-[var(--l-line)]">
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex flex-col gap-2">
          <WhatsAppButton cta="nav-mobile" className="w-full" />
          <Link href="/login" className="l-btn l-btn-ghost w-full">
            Log in
          </Link>
        </div>
      </div>
    </header>
  );
}
