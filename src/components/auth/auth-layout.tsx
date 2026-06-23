"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { propertyShop } from "@/config/marketing-brand";
import { ArrowUpRight, Building2, Home, Store } from "lucide-react";

/* ── Required field label helper ── */

export function RequiredLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-sm font-semibold text-text">
      {children}
      <span className="text-red-500 ml-0.5">*</span>
    </label>
  );
}

/* ── Listings-by-type semicircle gauge (SVG) ──
 *  Coordinates are pre-computed for a top half-circle (cx 90, cy 82, r 70),
 *  split into three arc segments so it renders deterministically. */

const GAUGE_SEGMENTS = [
  { d: "M20 82 A70 70 0 0 1 79.05 12.86", color: "var(--brand-primary, #eca400)" },
  { d: "M79.05 12.86 A70 70 0 0 1 139.5 32.5", color: "#f6c95a" },
  { d: "M139.5 32.5 A70 70 0 0 1 160 82", color: "#94a3b8" },
];

const GAUGE_LEGEND = [
  { label: "Apartments", value: "124", color: "var(--brand-primary, #eca400)", Icon: Building2 },
  { label: "Villas", value: "86", color: "#f6c95a", Icon: Home },
  { label: "Commercial", value: "38", color: "#94a3b8", Icon: Store },
];

function CategoryGauge() {
  return (
    <div>
      <div className="relative mx-auto h-[95px] w-[180px]">
        <svg viewBox="0 0 180 95" className="absolute inset-0 h-full w-full">
          {/* Track */}
          <path
            d="M20 82 A70 70 0 0 1 160 82"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={14}
            strokeLinecap="round"
          />
          {/* Coloured segments */}
          {GAUGE_SEGMENTS.map((seg, i) => (
            <motion.path
              key={seg.d}
              d={seg.d}
              fill="none"
              stroke={seg.color}
              strokeWidth={14}
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ delay: 0.9 + i * 0.18, duration: 0.7, ease: "easeOut" }}
            />
          ))}
        </svg>
        {/* Centre total */}
        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center">
          <span className="text-[10px] font-medium text-slate-400">Total listings</span>
          <span className="text-xl font-bold text-slate-800">248</span>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-3 space-y-1.5">
        {GAUGE_LEGEND.map(({ label, value, color, Icon }) => (
          <div key={label} className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: color }}
              />
              <Icon className="h-3 w-3 text-slate-400" />
              <span className="text-[11px] text-slate-500">{label}</span>
            </div>
            <span className="text-[11px] font-semibold text-slate-700">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Layered dashboard mockup (rendered with CSS, mirrors the reference) ── */

const OVERVIEW_BARS = [38, 64, 50, 82, 58, 94, 70];

const RECENT_DEALS = [
  { name: "Marina Heights · 2BR", price: "$420K", status: "Closed", tone: "bg-emerald-400/15 text-emerald-300" },
  { name: "Palm Grove Villa", price: "$1.1M", status: "Pending", tone: "bg-amber-400/15 text-amber-300" },
  { name: "Downtown Loft 14B", price: "$285K", status: "Viewing", tone: "bg-sky-400/15 text-sky-300" },
];

function cardEntrance(delay: number) {
  return {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { delay, duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  };
}

function DashboardMockup() {
  return (
    <div className="relative mt-8 w-full">
      {/* Top stat row */}
      <div className="grid grid-cols-2 gap-3">
        {/* Total sales — gold hero card */}
        <motion.div
          {...cardEntrance(0.55)}
          className="rounded-2xl bg-gradient-to-br from-primary to-primary-600 p-3.5 shadow-lg shadow-primary/20"
        >
          <p className="text-[11px] font-medium text-[#3a2d00]/70">Total Sales Volume</p>
          <p className="mt-1 text-2xl font-bold text-[#1f2a44]">$4.2M</p>
          <div className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-white/30 px-1.5 py-0.5">
            <ArrowUpRight className="h-3 w-3 text-[#1f2a44]" />
            <span className="text-[10px] font-semibold text-[#1f2a44]">7% this month</span>
          </div>
        </motion.div>

        {/* Commission — frosted card */}
        <motion.div
          {...cardEntrance(0.65)}
          className="rounded-2xl border border-white/10 bg-white/[0.07] p-3.5 backdrop-blur-sm"
        >
          <p className="text-[11px] font-medium text-slate-400">Commission Earned</p>
          <p className="mt-1 text-2xl font-bold text-white">$312K</p>
          <div className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-emerald-400/15 px-1.5 py-0.5">
            <ArrowUpRight className="h-3 w-3 text-emerald-400" />
            <span className="text-[10px] font-semibold text-emerald-400">5% this month</span>
          </div>
        </motion.div>
      </div>

      {/* Sales overview — frosted card with bar chart */}
      <motion.div
        {...cardEntrance(0.75)}
        className="mt-3 rounded-2xl border border-white/10 bg-white/[0.07] p-3.5 backdrop-blur-sm"
      >
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-white">Sales Overview</p>
            <p className="text-[10px] text-slate-400">Pipeline performance</p>
          </div>
          <span className="rounded-md border border-white/10 bg-white/[0.06] px-2 py-0.5 text-[10px] text-slate-300">
            Weekly
          </span>
        </div>
        <div className="flex h-20 items-end gap-2">
          {OVERVIEW_BARS.map((h, i) => (
            <motion.div
              key={i}
              className="flex-1 rounded-t-md bg-gradient-to-t from-primary-600 to-primary"
              initial={{ height: 0 }}
              animate={{ height: `${h}%` }}
              transition={{ delay: 1.0 + i * 0.07, duration: 0.6, ease: "easeOut" }}
            />
          ))}
        </div>
      </motion.div>

      {/* Recent deals — frosted table card */}
      <motion.div
        {...cardEntrance(0.85)}
        className="mt-3 rounded-2xl border border-white/10 bg-white/[0.07] p-3.5 backdrop-blur-sm"
      >
        <p className="mb-2 text-xs font-semibold text-white">Recent Deals</p>
        <div className="space-y-2">
          {RECENT_DEALS.map((d) => (
            <div key={d.name} className="flex items-center justify-between">
              <span className="text-[11px] text-slate-300">{d.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-white">{d.price}</span>
                <span className={`rounded-full px-2 py-0.5 text-[9px] font-semibold ${d.tone}`}>
                  {d.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Floating "Listings by Type" gauge card — overlaps for a layered look */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.95, duration: 0.8, ease: [0.22, 1, 0.36, 1] as const }}
        className="absolute -right-2 top-[96px] w-[56%] rounded-2xl bg-white p-3.5 shadow-2xl shadow-black/40 ring-1 ring-black/5"
      >
        <div className="mb-1 flex items-center justify-between">
          <p className="text-xs font-semibold text-slate-800">Listings by Type</p>
          <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[9px] text-slate-500">
            This month
          </span>
        </div>
        <CategoryGauge />
      </motion.div>
    </div>
  );
}

/* ── Supplemental panel (right side) ── */

function SupplementalContent() {
  return (
    <div className="relative h-full overflow-hidden rounded-3xl">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1f2a44] via-[#263554] to-[#1a2236]" />

      {/* Golden glow orbs */}
      <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full bg-primary/20 blur-[60px]" />
      <div className="absolute bottom-1/4 -left-8 w-56 h-56 rounded-full bg-primary/15 blur-[50px]" />
      <div className="absolute bottom-10 right-10 w-36 h-36 rounded-full bg-primary-600/10 blur-[40px]" />

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.15) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Property Shop logo watermark — personalises the panel as a faint backdrop */}
      <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center overflow-hidden select-none">
        <Image
          src="/brand/wordmark.png"
          alt=""
          aria-hidden="true"
          width={1000}
          height={1000}
          className="w-[135%] max-w-none object-contain opacity-[0.06]"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-center h-full p-8 lg:p-10">
        {/* Brand lockup */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7 }}
          className="mb-6"
        >
          <Image
            src="/brand/wordmark.png"
            alt={`${propertyShop.name} logo`}
            width={1000}
            height={1000}
            priority
            className="h-20 w-auto object-contain"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.7 }}
        >
          <h2 className="text-2xl font-bold leading-tight text-white lg:text-3xl">
            Effortlessly manage your
            <br />
            <span className="text-primary">listings and deals.</span>
          </h2>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-400">
            Sign in to your {propertyShop.name} dashboard to track leads, manage
            properties, and close more deals — all in one place.
          </p>
        </motion.div>

        {/* Layered dashboard mockup — narrower than the form side */}
        <DashboardMockup />
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 z-20 h-24 bg-gradient-to-b from-transparent to-[#1a2236]" />
    </div>
  );
}

/* ── Auth layout wrapper ── */

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="grid h-screen grid-cols-1 md:grid-cols-[1fr_340px] lg:grid-cols-[1fr_420px] xl:grid-cols-[1fr_500px] bg-content-bg">
      {/* Left — scrollable form side */}
      <div className="relative bg-content-bg overflow-y-auto flex flex-col">
        <Link
          href="/"
          className="sticky top-0 z-20 flex items-center px-8 pt-8 pb-2 bg-content-bg md:px-14 lg:px-20"
          aria-label={`${propertyShop.name} home`}
        >
          <Image
            src="/brand/wordmark.png"
            alt={`${propertyShop.name} logo`}
            width={1000}
            height={1000}
            priority
            className="h-14 w-auto object-contain"
          />
        </Link>
        <div className="flex flex-1 items-center justify-center px-8 pb-10 md:px-14 lg:px-20">
          <div className="w-full max-w-lg">
            {children}
          </div>
        </div>
      </div>

      {/* Right — supplemental panel */}
      <div className="hidden md:block p-3">
        <SupplementalContent />
      </div>
    </main>
  );
}
