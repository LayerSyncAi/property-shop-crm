"use client";

import { motion, useReducedMotion } from "framer-motion";
import { hub } from "./content";
import { PhoneStage } from "./phone/phone-stage";
import { ProductGlyph } from "./phone/ui";

const EASE = [0.16, 1, 0.3, 1] as const;

export function HubBentoPhone() {
  return (
    <div className="relative -mt-4 sm:-mt-10">
      <PhoneStage
        photo="stageAlt"
        screens={["hub"]}
        crop={{ x: [0.12, 0.92], y: [0.1, 0.62] }}
        sizes="(min-width: 1024px) 700px, 100vw"
        label="The Hub's Needs attention list: open maintenance, arrears, inspections due, an overdue valuation and payouts awaiting approval."
      />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[var(--l-stage)] to-transparent" />
    </div>
  );
}

const MODULES = [
  { key: "crm", name: "SynCRM", on: true },
  { key: "stay", name: "SyncStay", on: true },
  { key: "worth", name: "SyncWorth", on: false },
  { key: "finance", name: "SyncFinance", on: true },
  { key: "dev", name: "SyncDev", on: false },
  { key: "media", name: "SyncMedia", on: true },
] as const;

export function ModuleSwitches() {
  const reduce = useReducedMotion();
  return (
    <ul className="grid grid-cols-2 gap-2" aria-label="Example: modules switched on for one agency">
      {MODULES.map((m, i) => {
        return (
          <li key={m.key} className="flex items-center justify-between gap-2 rounded-2xl border border-[var(--l-line)] px-3 py-2.5">
            <span className="flex items-center gap-2 text-sm text-[var(--l-ink)]">
              <ProductGlyph product={m.key} size={16} strokeWidth={1.6} className="text-[var(--l-ink-3)]" />
              {m.name}
            </span>
            <span
              aria-label={m.on ? "On" : "Off"}
              className={`relative h-5 w-9 flex-none rounded-full transition-colors ${m.on ? "bg-[var(--l-accent)]" : "bg-[var(--l-line-strong)]"}`}
            >
              <motion.span
                className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow"
                initial={{ left: 2 }}
                whileInView={{ left: m.on ? 18 : 2 }}
                viewport={{ once: true }}
                transition={{ duration: reduce ? 0 : 0.5, delay: reduce ? 0 : 0.3 + i * 0.12, ease: EASE }}
              />
            </span>
          </li>
        );
      })}
    </ul>
  );
}

export function AlertToasts() {
  const reduce = useReducedMotion();
  return (
    <ul className="flex min-w-0 flex-col gap-2" aria-label="Example alerts">
      {hub.tiles.alerts.toasts.map((t, i) => (
        <motion.li
          key={t.text}
          initial={reduce ? { opacity: 0 } : { opacity: 0, x: 40 }}
          whileInView={reduce ? { opacity: 1 } : { opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: reduce ? 0.2 : 0.7, delay: reduce ? 0 : 0.2 + i * 0.25, ease: EASE }}
          className="flex min-w-0 items-center gap-3 rounded-2xl border border-[var(--l-line)] bg-[var(--l-bg-raised)] px-4 py-3"
        >
          <span className="h-2 w-2 flex-none rounded-full bg-[var(--l-accent)] shadow-[0_0_10px_var(--l-accent)]" />
          <span className="l-mono flex-none text-[11px] uppercase tracking-[0.12em] text-[var(--l-ink-3)]">{t.module}</span>
          <span className="min-w-0 truncate text-sm text-[var(--l-ink)]">{t.text}</span>
        </motion.li>
      ))}
    </ul>
  );
}
