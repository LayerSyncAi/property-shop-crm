"use client";

import { motion, useReducedMotion } from "framer-motion";
import { PhoneStage } from "./phone/phone-stage";

export function HeroPhoto() {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.04 }}
      animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1 }}
      transition={{ duration: reduce ? 0.2 : 1.4, delay: reduce ? 0 : 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="l-stage l-stage-panel relative overflow-hidden sm:rounded-[32px]"
    >
      <PhoneStage
        photo="hero"
        screens={["hub"]}
        crop={{ x: [0.08, 0.92], y: [0.0, 0.94] }}
        mobileCrop={{ x: [0.33, 0.67], y: [0.08, 0.83] }}
        priority
        sizes="(max-width: 767px) 230vw, 1320px"
        label="The SyncEstate Hub on a phone: a good-morning summary, five things that need attention across SyncStay, SyncWorth and SyncFinance, and a tile for each module."
      />
      {/* Fade the photo's edges into the page. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 shadow-[inset_0_0_120px_40px_var(--l-stage)]" />
    </motion.div>
  );
}
