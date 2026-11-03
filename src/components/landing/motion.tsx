"use client";

/**
 * Motion primitives for the landing page (spec §9). Everything collapses to
 * a plain fade when the visitor prefers reduced motion.
 */
import { motion } from "framer-motion";
import { useRef, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";

const EASE = [0.16, 1, 0.3, 1] as const;

const REDUCE_QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Whether the visitor prefers reduced motion. Hydration-safe: the server and
 * the first client render both say false, then it updates, so the HTML always
 * matches (framer's own hook reads the media query during hydration).
 */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(REDUCE_QUERY);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia(REDUCE_QUERY).matches,
    () => false
  );
}

/** Fades content up as it scrolls into view. */
export function Reveal({
  children,
  delay = 0,
  y = 24,
  className,
  style,
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  style?: CSSProperties;
  as?: "div" | "li" | "section" | "span";
}) {
  const reduce = useReducedMotion();
  const Comp = motion[as];
  return (
    <Comp
      className={className}
      style={style}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={reduce ? { duration: 0.2, y: { duration: 0 } } : { duration: 0.7, delay, ease: EASE }}
    >
      {children}
    </Comp>
  );
}

/** Lines that slide up out of a mask, staggered. */
export function MaskedLines({
  lines,
  className,
  lineClassName,
  delay = 0,
  inView = false,
}: {
  lines: ReactNode[];
  className?: string;
  lineClassName?: string;
  delay?: number;
  /** Animate on scroll into view instead of on load. */
  inView?: boolean;
}) {
  const reduce = useReducedMotion();
  return (
    <span className={className}>
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden pb-[0.08em]">
          <motion.span
            className={`block ${lineClassName ?? ""}`}
            initial={{ y: "110%", rotate: 2 }}
            {...(inView
              ? { whileInView: { y: "0%", rotate: 0 }, viewport: { once: true, amount: 0.6 } }
              : { animate: { y: "0%", rotate: 0 } })}
            transition={reduce ? { duration: 0 } : { duration: 1.1, delay: delay + i * 0.08, ease: EASE }}
            style={{ transformOrigin: "0% 100%" }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

/** A button that leans toward the cursor and springs back. */
export function Magnetic({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion();
  return (
    <span
      ref={ref}
      className={`inline-block ${className ?? ""}`}
      onPointerMove={(e) => {
        if (reduce || e.pointerType !== "mouse" || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        const x = (e.clientX - (r.left + r.width / 2)) * 0.2;
        const y = (e.clientY - (r.top + r.height / 2)) * 0.3;
        ref.current.style.transform = `translate(${x}px, ${y}px)`;
      }}
      onPointerLeave={() => {
        if (ref.current) ref.current.style.transform = "";
      }}
      style={{ transition: "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)" }}
    >
      {children}
    </span>
  );
}
