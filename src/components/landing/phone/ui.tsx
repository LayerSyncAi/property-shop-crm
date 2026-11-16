/**
 * A web copy of the phone app's UI kit (mobile/components/ui.tsx and
 * mobile/lib/theme.ts), used to draw real-looking app screens inside the
 * landing page's phone photos. Sizes are the app's own, on a 390px-wide
 * screen. The app uses Ionicons; these use the nearest Lucide icon.
 */
import type { CSSProperties, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Bell, ChevronLeft, ChevronRight, LayoutGrid, Signal, Wifi } from "lucide-react";
import { PRODUCT_ICON_PATHS, type ProductIconKey } from "@/lib/product-icon-paths";

export const c = {
  primary: "#9bd83d",
  onPrimary: "#0f1419",
  brand: "#3b6812",
  brandLight: "#edf7dc",
  ink: "#0f1419",
  background: "#f2f4f3",
  card: "#ffffff",
  surface: "#f6f7f7",
  text: "#0f1419",
  muted: "#58626a",
  faint: "#77818a",
  border: "#e3e7e8",
  borderStrong: "#d2d8da",
  success: "#3b6812",
  successBg: "#edf7dc",
  warning: "#8a5300",
  warningBg: "#fff2d9",
  danger: "#d92d20",
  dangerBg: "#fde8e8",
  info: "#1f5fad",
  infoBg: "#e3f1ff",
  hot: "#b2361a",
  hotBg: "#ffe9e2",
} as const;

export type Tone = "info" | "warning" | "danger" | "success" | "neutral" | "hot";

const toneColours: Record<Tone, [string, string]> = {
  info: [c.info, c.infoBg],
  warning: [c.warning, c.warningBg],
  danger: [c.danger, c.dangerBg],
  success: [c.success, c.successBg],
  neutral: [c.muted, c.surface],
  hot: [c.hot, c.hotBg],
};

/* ---------- Device chrome ------------------------------------------- */

export function StatusBar({ dark = false }: { dark?: boolean }) {
  const col = dark ? "#ffffff" : c.ink;
  return (
    <div
      style={{
        height: 47,
        flex: "none",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        padding: "0 30px 8px 36px",
        color: col,
        background: dark ? "transparent" : c.card,
        fontSize: 15,
        fontWeight: 600,
      }}
    >
      <span>08:42</span>
      <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <Signal size={16} strokeWidth={2.4} />
        <Wifi size={16} strokeWidth={2.4} />
        <span
          style={{
            width: 25,
            height: 12,
            borderRadius: 4,
            border: `1.5px solid ${col}`,
            padding: 1.5,
            display: "inline-flex",
          }}
        >
          <span style={{ flex: "0 0 72%", background: col, borderRadius: 1.5 }} />
        </span>
      </span>
    </div>
  );
}

/** The stack header. `module` adds the Hub and bell buttons of a module tab. */
export function Header({
  title,
  back = false,
  module = false,
  left,
  right,
  unread,
}: {
  title: string;
  back?: boolean;
  module?: boolean;
  left?: ReactNode;
  right?: ReactNode;
  unread?: number;
}) {
  return (
    <div
      style={{
        height: 48,
        flex: "none",
        display: "grid",
        gridTemplateColumns: "64px 1fr 64px",
        alignItems: "center",
        background: c.card,
        borderBottom: `1px solid ${c.border}`,
        color: c.brand,
      }}
    >
      <div style={{ paddingLeft: 12, display: "flex" }}>
        {left ?? (back ? <ChevronLeft size={28} strokeWidth={2} /> : module ? <LayoutGrid size={22} strokeWidth={1.8} /> : null)}
      </div>
      <div style={{ textAlign: "center", fontSize: 17, fontWeight: 700, color: c.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        {title}
      </div>
      <div style={{ paddingRight: 14, display: "flex", justifyContent: "flex-end" }}>
        {right ?? (module ? <BellButton unread={unread} /> : null)}
      </div>
    </div>
  );
}

export function BellButton({ unread }: { unread?: number }) {
  return (
    <span style={{ position: "relative", display: "inline-flex" }}>
      <Bell size={22} strokeWidth={1.8} />
      {unread ? (
        <span
          style={{
            position: "absolute",
            top: -4,
            right: -4,
            minWidth: 16,
            height: 16,
            borderRadius: 8,
            background: c.danger,
            color: "#fff",
            fontSize: 10,
            fontWeight: 700,
            display: "grid",
            placeItems: "center",
            padding: "0 4px",
          }}
        >
          {unread}
        </span>
      ) : null}
    </span>
  );
}

export function TabBar({ tabs, active }: { tabs: { label: string; icon: LucideIcon }[]; active: number }) {
  return (
    <div
      style={{
        flex: "none",
        display: "grid",
        gridTemplateColumns: `repeat(${tabs.length}, 1fr)`,
        background: c.card,
        borderTop: `1px solid ${c.border}`,
        padding: "7px 0 26px",
      }}
    >
      {tabs.map((t, i) => {
        const Icon = t.icon;
        const col = i === active ? c.brand : c.faint;
        return (
          <div key={t.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, color: col }}>
            <Icon size={23} strokeWidth={1.7} />
            <span style={{ fontSize: 10, fontWeight: 500 }}>{t.label}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ---------- Layout -------------------------------------------------- */

export function Body({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: 16, paddingBottom: 28, ...style }}>{children}</div>
  );
}

export function Card({ children, style, pad = 16, gap = 8 }: { children: ReactNode; style?: CSSProperties; pad?: number; gap?: number }) {
  return (
    <div
      style={{
        background: c.card,
        borderRadius: 20,
        border: `1px solid ${c.border}`,
        padding: pad,
        display: "flex",
        flexDirection: "column",
        gap,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function Section({ title, link, children }: { title: string; link?: string; children: ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: c.muted, textTransform: "uppercase", letterSpacing: 1.2 }}>{title}</span>
        {link ? <span style={{ fontSize: 13, fontWeight: 600, color: c.brand }}>{link}</span> : null}
      </div>
      {children}
    </div>
  );
}

export function Title({ children }: { children: ReactNode }) {
  return <div style={{ fontSize: 28, fontWeight: 600, letterSpacing: -0.6, color: c.text, lineHeight: 1.15 }}>{children}</div>;
}

export function Text({ children, muted, small, style }: { children: ReactNode; muted?: boolean; small?: boolean; style?: CSSProperties }) {
  return (
    <div style={{ fontSize: small ? 13 : 15, lineHeight: small ? "18px" : "21px", color: muted ? c.muted : c.text, ...style }}>
      {children}
    </div>
  );
}

/* ---------- Data ---------------------------------------------------- */

export function Stat({ label, value, hint, tone }: { label: string; value: string; hint?: string; tone?: "good" | "warning" | "danger" }) {
  const col = tone === "good" ? c.success : tone === "warning" ? c.warning : tone === "danger" ? c.danger : c.text;
  return (
    <Card pad={12} gap={2} style={{ flexBasis: "47%", flexGrow: 1 }}>
      <span style={{ fontSize: 11, fontWeight: 500, color: c.muted, textTransform: "uppercase", letterSpacing: 0.8 }}>{label}</span>
      <span style={{ fontSize: 24, fontWeight: 300, letterSpacing: -0.5, marginTop: 4, color: col, lineHeight: 1.15 }}>{value}</span>
      {hint ? <span style={{ fontSize: 11, color: c.faint }}>{hint}</span> : null}
    </Card>
  );
}

export function StatGrid({ children }: { children: ReactNode }) {
  return <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{children}</div>;
}

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: Tone }) {
  const [fg, bg] = toneColours[tone];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        borderRadius: 999,
        padding: "3px 8px",
        fontSize: 11,
        fontWeight: 700,
        color: fg,
        background: bg,
        whiteSpace: "nowrap",
        lineHeight: "14px",
      }}
    >
      {children}
    </span>
  );
}

export function ListItem({
  icon: Icon,
  title,
  subtitle,
  meta,
  right,
  chevron = true,
}: {
  icon?: LucideIcon;
  title: ReactNode;
  subtitle?: ReactNode;
  meta?: ReactNode;
  right?: ReactNode;
  chevron?: boolean;
}) {
  return (
    <Card pad={12} style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
      {Icon ? (
        <span style={{ width: 36, height: 36, borderRadius: 18, background: c.brandLight, color: c.brand, display: "grid", placeItems: "center", flex: "none" }}>
          <Icon size={18} strokeWidth={1.8} />
        </span>
      ) : null}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: c.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</div>
        {subtitle ? <div style={{ fontSize: 13, color: c.muted, marginTop: 2 }}>{subtitle}</div> : null}
        {meta ? <div style={{ fontSize: 11, color: c.faint, marginTop: 2 }}>{meta}</div> : null}
      </div>
      {right ? <div style={{ flex: "none", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, fontSize: 13, fontWeight: 600 }}>{right}</div> : null}
      {chevron ? <ChevronRight size={16} color={c.faint} style={{ flex: "none" }} /> : null}
    </Card>
  );
}

export function List({ children }: { children: ReactNode }) {
  return <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{children}</div>;
}

export function Button({
  children,
  icon: Icon,
  variant = "primary",
  small,
  style,
}: {
  children: ReactNode;
  icon?: LucideIcon;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  small?: boolean;
  style?: CSSProperties;
}) {
  const v = {
    primary: { background: c.primary, color: c.onPrimary, border: `1px solid ${c.primary}` },
    secondary: { background: c.card, color: c.text, border: `1px solid ${c.borderStrong}` },
    ghost: { background: "transparent", color: c.brand, border: "1px solid transparent" },
    danger: { background: c.card, color: c.danger, border: "1px solid #fecaca" },
  }[variant];
  return (
    <span
      style={{
        ...v,
        minHeight: small ? 36 : 48,
        padding: small ? "0 14px" : "0 20px",
        borderRadius: 999,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        fontSize: small ? 13 : 15,
        fontWeight: 600,
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {Icon ? <Icon size={small ? 15 : 18} strokeWidth={1.9} /> : null}
      {children}
    </span>
  );
}

export function Chips({ items, active = 0 }: { items: string[]; active?: number }) {
  return (
    <div style={{ display: "flex", gap: 8, overflow: "hidden" }}>
      {items.map((label, i) => (
        <span
          key={label}
          style={{
            flex: "none",
            borderRadius: 999,
            padding: "7px 12px",
            fontSize: 13,
            fontWeight: 500,
            border: `1px solid ${i === active ? c.brand : c.borderStrong}`,
            background: i === active ? c.brand : c.card,
            color: i === active ? "#fff" : c.text,
          }}
        >
          {label}
        </span>
      ))}
    </div>
  );
}

export function BarRow({ label, value, pct, colour = c.primary, hint }: { label: string; value: string; pct: number; colour?: string; hint?: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
        <span style={{ color: c.text }}>
          {label} {hint ? <span style={{ color: c.faint, fontSize: 11 }}>{hint}</span> : null}
        </span>
        <span style={{ color: c.muted, fontWeight: 600 }}>{value}</span>
      </div>
      <div style={{ height: 8, borderRadius: 4, background: c.border, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", borderRadius: 4, background: colour }} />
      </div>
    </div>
  );
}

export function Facts({ rows }: { rows: [string, string][] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {rows.map(([k, v]) => (
        <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 13 }}>
          <span style={{ color: c.muted }}>{k}</span>
          <span style={{ color: c.text, fontWeight: 500, textAlign: "right" }}>{v}</span>
        </div>
      ))}
    </div>
  );
}

export function Field({ label, value, placeholder }: { label: string; value?: string; placeholder?: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={{ fontSize: 13, fontWeight: 600, color: c.text }}>{label}</span>
      <span
        style={{
          background: c.card,
          border: `1px solid ${c.borderStrong}`,
          borderRadius: 12,
          padding: "12px",
          fontSize: 15,
          color: value ? c.text : c.faint,
        }}
      >
        {value ?? placeholder}
      </span>
    </div>
  );
}

/** A SyncEstate product icon drawn straight from its path data. */
export function ProductGlyph({ product, size = 22, strokeWidth = 1.5, className }: { product: ProductIconKey; size?: number; strokeWidth?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      {PRODUCT_ICON_PATHS[product].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}

export function IconTile({ product, size = 44 }: { product: ProductIconKey; size?: number }) {
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: 14,
        background: c.surface,
        border: `1px solid ${c.border}`,
        display: "grid",
        placeItems: "center",
        color: c.ink,
        flex: "none",
      }}
    >
      <ProductGlyph product={product} />
    </span>
  );
}

export function Fab({ label, icon: Icon }: { label: string; icon: LucideIcon }) {
  return (
    <span
      style={{
        position: "absolute",
        right: 16,
        bottom: 84,
        height: 56,
        padding: "0 22px",
        borderRadius: 999,
        background: c.primary,
        color: c.onPrimary,
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        fontSize: 15,
        fontWeight: 600,
        boxShadow: "0 8px 24px rgba(15,20,25,0.18)",
      }}
    >
      <Icon size={22} strokeWidth={2} />
      {label}
    </span>
  );
}

export function Photo({ src, size = 84, style }: { src: string; size?: number; style?: CSSProperties }) {
  return (
    // Decorative thumbnails inside a mock screen; next/image adds nothing here.
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" width={size} height={size} style={{ width: size, height: size, objectFit: "cover", borderRadius: 12, flex: "none", ...style }} />
  );
}
