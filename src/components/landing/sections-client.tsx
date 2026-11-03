"use client";

import { motion, useReducedMotion } from "framer-motion";
import { PhoneStage } from "./phone/phone-stage";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Four steps on a line that draws itself in as it scrolls into view. */
export function HowLine({ steps }: { steps: readonly { title: string; body: string }[] }) {
  const reduce = useReducedMotion();
  return (
    <div className="relative mt-16">
      <div aria-hidden className="absolute left-[11px] top-0 h-full w-px bg-[var(--l-line-strong)] md:left-0 md:top-[11px] md:h-px md:w-full" />
      <motion.div
        aria-hidden
        className="absolute left-[11px] top-0 h-full w-px origin-top bg-[var(--l-accent)] shadow-[0_0_12px_var(--l-accent)] md:left-0 md:top-[11px] md:h-px md:w-full md:origin-left"
        initial={{ scaleX: reduce ? 1 : 0, scaleY: reduce ? 1 : 0 }}
        whileInView={{ scaleX: 1, scaleY: 1 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: reduce ? 0 : 1.6, ease: EASE }}
      />
      <ol className="relative grid gap-10 md:grid-cols-4 md:gap-8">
        {steps.map((s, i) => (
          <motion.li
            key={s.title}
            className="flex gap-5 md:flex-col md:gap-6"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
            whileInView={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: reduce ? 0.2 : 0.7, delay: reduce ? 0 : 0.3 + i * 0.3, ease: EASE }}
          >
            <span className="relative z-10 grid h-6 w-6 flex-none place-items-center rounded-full border border-[var(--l-accent)] bg-[var(--l-bg)]">
              <span className="h-2 w-2 rounded-full bg-[var(--l-accent)]" />
            </span>
            <div>
              <p className="l-mono text-xs text-[var(--l-ink-3)]">STEP 0{i + 1}</p>
              <h3 className="l-h3 mt-2">{s.title}</h3>
              <p className="l-body mt-2">{s.body}</p>
            </div>
          </motion.li>
        ))}
      </ol>
    </div>
  );
}

export function AppPhone() {
  return (
    <div className="mx-auto w-full max-w-[560px]">
      <PhoneStage
        photo="stageAlt"
        screens={["signin"]}
        crop={{ x: [0.12, 0.9], y: [0.1, 0.8] }}
        sizes="(min-width: 1024px) 560px, 100vw"
        label="The SyncEstate sign-in screen on a phone: one sign-in for every product your agency uses."
      />
    </div>
  );
}
