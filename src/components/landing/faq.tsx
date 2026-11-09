"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useId, useState } from "react";
import { faq } from "./content";
import { Accent, Container, WhatsAppButton } from "./bits";
import { Reveal, useReducedMotion } from "./motion";

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  const reduce = useReducedMotion();
  const base = useId();
  return (
    <section id="faq" aria-labelledby="faq-title" className="py-24 sm:py-32">
      <Container className="grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <Reveal className="flex flex-col gap-6 lg:sticky lg:top-32 lg:self-start">
          <h2 id="faq-title" className="l-h2">
            <Accent h={faq.headline} />
          </h2>
          <p className="l-body-lg max-w-[36ch]">Anything else? Ask us directly. A real person at LayerSync answers.</p>
          <div>
            <WhatsAppButton cta="faq" />
          </div>
        </Reveal>
        <ul className="flex flex-col gap-3">
          {faq.items.map((item, i) => {
            const isOpen = open === i;
            const btnId = `${base}-q${i}`;
            const panelId = `${base}-a${i}`;
            return (
              <li key={item.q} className={`l-card overflow-hidden transition-colors ${isOpen ? "border-[var(--l-line-strong)]" : ""}`}>
                <h3>
                  <button
                    id={btnId}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-6 px-6 py-5 text-left text-[17px] font-medium text-[var(--l-ink)]"
                  >
                    {item.q}
                    <span
                      data-on={isOpen ? "" : undefined}
                      className={`l-orb grid h-8 w-8 flex-none place-items-center transition-[rotate] duration-300 ${isOpen ? "rotate-45" : ""}`}
                    >
                      <Plus size={16} strokeWidth={2} />
                    </span>
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {isOpen ? (
                    <motion.div
                      id={panelId}
                      role="region"
                      aria-labelledby={btnId}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: reduce ? 0 : 0.4, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <p className="l-body px-6 pb-6 pr-16">{item.a}</p>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
