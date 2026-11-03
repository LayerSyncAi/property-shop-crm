"use client";

/**
 * "The Stage": the module showcase (spec §5.4). On desktop a sticky phone
 * swaps to each module's screens as its chapter scrolls past; a rail of
 * module icons jumps between chapters. Below 1024px each chapter stacks
 * with its own phone, under a sticky chip bar.
 */
import { ArrowUpRight, Check, FileSignature } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { moduleWhatsAppMessage, whatsAppLink } from "@/config/marketing";
import { showcase, type Chapter, type ModuleKey } from "./content";
import { Accent, Container, Eyebrow } from "./bits";
import { Reveal } from "./motion";
import { PhoneStage } from "./phone/phone-stage";
import { CHAPTER_SCREENS } from "./phone/screens";
import { SyncDevIcon, SyncFinanceIcon, SyncMediaIcon, SyncStayIcon, SyncWorthIcon, SynCrmIcon } from "@/components/brand/product-icons";

const ICONS: Record<ModuleKey, LucideIcon> = {
  crm: SynCrmIcon,
  viewings: FileSignature,
  stay: SyncStayIcon,
  worth: SyncWorthIcon,
  finance: SyncFinanceIcon,
  dev: SyncDevIcon,
  media: SyncMediaIcon,
};

const chapters = showcase.chapters as Chapter[];

/** All chapters' screens in one list, so one stage can show any of them. */
const ALL_SCREENS = chapters.flatMap((ch) => CHAPTER_SCREENS[ch.key]);
const OFFSETS = chapters.reduce<number[]>((acc, ch, i) => {
  acc.push(i === 0 ? 0 : acc[i - 1] + CHAPTER_SCREENS[chapters[i - 1].key].length);
  return acc;
}, []);

function ChapterCopy({ ch, index }: { ch: Chapter; index: number }) {
  const Icon = ICONS[ch.key];
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-[14px] border border-[var(--l-line-strong)] bg-[var(--l-surface)] text-[var(--l-accent-ink)]">
          <Icon size={22} strokeWidth={1.5} />
        </span>
        <span className="l-mono text-sm font-medium text-[var(--l-ink)]">
          <span className="text-[var(--l-ink-3)]">0{index + 1} · </span>
          {ch.name}
        </span>
      </div>
      <Eyebrow>{ch.eyebrow}</Eyebrow>
      <h3 className="text-[clamp(28px,3.1vw,46px)] font-medium leading-[1.05] tracking-[-0.035em] [text-wrap:balance]">
        <Accent h={ch.headline} />
      </h3>
      <p className="l-body-lg max-w-[46ch]">{ch.body}</p>
      <ul className="flex flex-col gap-3">
        {ch.proof.map((p) => (
          <li key={p} className="flex gap-3 text-[15px] leading-snug text-[var(--l-ink)]">
            <span className="mt-0.5 grid h-5 w-5 flex-none place-items-center rounded-full bg-[var(--l-accent)] text-[var(--l-on-accent)]">
              <Check size={12} strokeWidth={3} />
            </span>
            {p}
          </li>
        ))}
      </ul>
      <a
        href={whatsAppLink(moduleWhatsAppMessage(ch.askAbout))}
        target="_blank"
        rel="noopener noreferrer"
        data-cta={`module-${ch.key}`}
        className="group inline-flex w-fit items-center gap-1.5 text-[15px] font-medium text-[var(--l-accent-ink)]"
      >
        Ask about {ch.name} on WhatsApp
        <ArrowUpRight size={16} strokeWidth={2} className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </a>
    </div>
  );
}

export function ModuleShowcase() {
  const [active, setActive] = useState(0);
  const [subState, setSub] = useState({ chapter: 0, i: 0 });
  const sub = subState.chapter === active ? subState.i : 0;
  const refs = useRef<(HTMLElement | null)[]>([]);
  const chipRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  // The chapter in the middle of the viewport is the active one.
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            const i = Number((e.target as HTMLElement).dataset.index);
            if (!Number.isNaN(i)) setActive(i);
          }
        }
      },
      { rootMargin: "-45% 0px -45% 0px" }
    );
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  // Cycle through the active chapter's screens.
  useEffect(() => {
    const n = CHAPTER_SCREENS[chapters[active].key].length;
    if (n < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setInterval(
      () => setSub((s) => ({ chapter: active, i: ((s.chapter === active ? s.i : 0) + 1) % n })),
      6500
    );
    return () => window.clearInterval(t);
  }, [active]);

  // Keep the active chip in view on the mobile chip bar.
  useEffect(() => {
    chipRefs.current[active]?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [active]);

  const stageIndex = OFFSETS[active] + sub;
  const label = useMemo(() => `${chapters[active].name} on a phone: ${chapters[active].eyebrow.toLowerCase()}.`, [active]);

  const jump = (i: number) => refs.current[i]?.scrollIntoView({ behavior: "smooth", block: "center" });

  return (
    <section id="modules" aria-labelledby="modules-title" className="relative py-24 sm:py-32">
      <Container>
        <Reveal className="mx-auto flex max-w-3xl flex-col items-center gap-5 text-center">
          <Eyebrow dot>{showcase.eyebrow}</Eyebrow>
          <h2 id="modules-title" className="l-h2">
            <Accent h={showcase.headline} />
          </h2>
          <p className="l-body-lg">{showcase.sub}</p>
        </Reveal>
      </Container>

      {/* Mobile and tablet: sticky chip bar. */}
      <nav aria-label="Modules" className="sticky top-[76px] z-30 mt-12 lg:hidden">
        <div className="l-no-scrollbar mx-3 flex gap-2 overflow-x-auto rounded-full border border-[var(--l-line)] bg-[var(--l-nav)] p-1.5 backdrop-blur-xl">
          {chapters.map((ch, i) => (
            <a
              key={ch.key}
              ref={(el) => {
                chipRefs.current[i] = el;
              }}
              href={`#module-${ch.key}`}
              aria-current={i === active ? "true" : undefined}
              className={`flex-none rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
                i === active ? "bg-[var(--l-accent)] text-[var(--l-on-accent)]" : "text-[var(--l-ink-2)]"
              }`}
            >
              {ch.name}
            </a>
          ))}
        </div>
      </nav>

      <Container className="mt-10 lg:mt-20">
        <div className="lg:grid lg:grid-cols-[56px_minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-10">
          {/* Desktop rail. */}
          <div className="hidden lg:block">
            <div role="tablist" aria-label="Modules" aria-orientation="vertical" className="sticky top-[calc(50vh-200px)] flex flex-col gap-2">
              {chapters.map((ch, i) => {
                const Icon = ICONS[ch.key];
                const on = i === active;
                return (
                  <button
                    key={ch.key}
                    type="button"
                    role="tab"
                    aria-selected={on}
                    aria-controls={`module-${ch.key}`}
                    tabIndex={on ? 0 : -1}
                    title={ch.name}
                    onClick={() => jump(i)}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                        e.preventDefault();
                        const next = (i + (e.key === "ArrowDown" ? 1 : -1) + chapters.length) % chapters.length;
                        jump(next);
                        (e.currentTarget.parentElement?.children[next] as HTMLElement | undefined)?.focus();
                      }
                    }}
                    className={`relative grid h-12 w-12 place-items-center rounded-2xl border transition-all duration-300 ${
                      on
                        ? "border-[var(--l-accent)] bg-[var(--l-accent)] text-[var(--l-on-accent)] shadow-[0_8px_28px_-8px_var(--l-glow)]"
                        : "border-[var(--l-line)] bg-[var(--l-surface)] text-[var(--l-ink-3)] hover:text-[var(--l-ink)]"
                    }`}
                  >
                    <Icon size={20} strokeWidth={1.6} />
                    <span className="sr-only">{ch.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Chapters. */}
          <div className="flex flex-col gap-24 lg:gap-0">
            {chapters.map((ch, i) => (
              <article
                key={ch.key}
                id={`module-${ch.key}`}
                data-index={i}
                ref={(el) => {
                  refs.current[i] = el;
                }}
                aria-label={ch.name}
                className="scroll-mt-40 lg:flex lg:min-h-[88vh] lg:items-center"
              >
                <div className={`transition-opacity duration-500 lg:py-16 ${i === active ? "lg:opacity-100" : "lg:opacity-35"}`}>
                  <ChapterCopy ch={ch} index={i} />
                </div>
                {/* Mobile: the chapter's own phone. */}
                <div className="l-stage l-stage-panel mt-10 overflow-hidden rounded-[28px] lg:hidden">
                  <PhoneStage
                    photo="stage"
                    screens={CHAPTER_SCREENS[ch.key]}
                    crop={{ x: [0.12, 0.88], y: [0.08, 0.76] }}
                    sizes="(max-width: 1023px) 130vw, 1px"
                    showDots
                    label={`${ch.name} on a phone: ${ch.eyebrow.toLowerCase()}.`}
                  />
                </div>
              </article>
            ))}
          </div>

          {/* Desktop: one sticky phone. */}
          <div className="hidden lg:block">
            <div className="sticky top-[calc(50vh-min(41vh,400px))]">
              <div className="l-stage l-stage-panel relative mx-auto max-h-[82vh] overflow-hidden rounded-[32px]" style={{ aspectRatio: "0.84", maxWidth: "100%" }}>
                <PhoneStage
                  photo="stage"
                  screens={ALL_SCREENS}
                  active={stageIndex}
                  crop={{ x: [0.15, 0.85], y: [0.08, 0.75] }}
                  sizes="(min-width: 1024px) 640px, 1px"
                  label={label}
                />
                <div aria-hidden className="pointer-events-none absolute inset-0 shadow-[inset_0_0_80px_20px_var(--l-stage)]" />
                <div className="l-mono pointer-events-none absolute left-5 top-5 flex items-center gap-2 rounded-full border border-[var(--l-stage-line)] bg-black/40 px-3 py-1.5 text-[11px] uppercase tracking-[0.14em] text-[var(--l-stage-ink-2)] backdrop-blur">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#9bd83d]" />
                  {chapters[active].name}
                </div>
              </div>
              <p className="l-mono mt-4 text-center text-xs text-[var(--l-ink-3)]">Hover the phone and scroll to look around</p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
