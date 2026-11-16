"use client";

/**
 * The VSL: a two-minute video tour of SyncEstate (source and re-render
 * instructions in scripts/vsl/). It loads nothing but the poster until the
 * visitor presses play, so it costs the page almost nothing.
 */
import { useRef, useState } from "react";
import { Play } from "lucide-react";
import { vsl } from "./content";
import { Accent, Container, Eyebrow, WhatsAppButton } from "./bits";
import { Reveal } from "./motion";

export function Vsl() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);

  const play = () => {
    const v = videoRef.current;
    if (!v) return;
    setStarted(true);
    v.controls = true;
    void v.play().catch(() => undefined);
  };

  return (
    <section id="tour" aria-labelledby="tour-title" className="relative py-20 sm:py-28">
      <Container className="flex flex-col items-center text-center">
        <Reveal className="flex flex-col items-center gap-4">
          <Eyebrow dot>{vsl.eyebrow}</Eyebrow>
          <h2 id="tour-title" className="l-h2 max-w-[18ch]">
            <Accent h={vsl.headline} />
          </h2>
          <p className="l-body-lg max-w-[52ch]">{vsl.sub}</p>
        </Reveal>

        <Reveal delay={0.1} className="relative mt-10 w-full max-w-[1040px]">
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-10 rounded-[48px] opacity-80 blur-3xl"
            style={{ background: "radial-gradient(closest-side, rgba(155,216,61,0.18), transparent)" }}
          />
          <div className="relative overflow-hidden rounded-[20px] border border-[var(--l-line-strong)] bg-black shadow-[0_40px_120px_-40px_rgba(0,0,0,0.8)] sm:rounded-[28px]">
            <video
              ref={videoRef}
              className="block aspect-video w-full"
              poster={vsl.poster}
              preload="none"
              playsInline
              aria-label={vsl.label}
              onPlay={() => setStarted(true)}
            >
              <source src={vsl.src} type="video/mp4" />
            </video>
            {!started && (
              <button
                type="button"
                onClick={play}
                className="group absolute inset-0 grid place-items-center bg-black/20 transition-colors hover:bg-black/10"
                aria-label="Play the two-minute SyncEstate tour"
                data-cta="vsl-play"
              >
                <span className="grid h-20 w-20 place-items-center rounded-full bg-[var(--l-accent)] text-[var(--l-on-accent)] shadow-[0_0_60px_var(--l-glow)] transition-transform duration-300 group-hover:scale-105 sm:h-24 sm:w-24">
                  <Play size={34} fill="currentColor" strokeWidth={0} className="translate-x-0.5" />
                </span>
              </button>
            )}
          </div>
        </Reveal>

        <Reveal delay={0.15} className="mt-10 flex flex-col items-center gap-3">
          <WhatsAppButton size="lg" cta="vsl">
            {vsl.cta}
          </WhatsAppButton>
          <p className="text-sm text-[var(--l-ink-3)]">Leave your name and number. We&apos;ll reply on WhatsApp.</p>
        </Reveal>
      </Container>
    </section>
  );
}
