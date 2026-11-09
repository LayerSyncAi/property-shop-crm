import { BadgePercent, MessageSquareText, Send, Sparkles, UsersRound } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { integrations } from "./content";
import { Accent, Container, Eyebrow, WhatsAppGlyph } from "./bits";
import { Reveal } from "./motion";

const ICONS: Record<string, LucideIcon | "whatsapp"> = {
  whatsapp: "whatsapp",
  copilot: Sparkles,
  portals: UsersRound,
  notify: Send,
  commissions: BadgePercent,
};

export function Integrations() {
  return (
    <section id="integrations" aria-labelledby="integrations-title" className="relative py-24 sm:py-32">
      <Container>
        <Reveal className="flex max-w-3xl flex-col gap-5">
          <Eyebrow dot>{integrations.eyebrow}</Eyebrow>
          <h2 id="integrations-title" className="l-h2">
            <Accent h={integrations.headline} />
          </h2>
        </Reveal>
        <ul className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
          {integrations.cards.map((card, i) => {
            const icon = ICONS[card.key];
            const Icon = icon === "whatsapp" ? null : icon;
            return (
              <Reveal
                as="li"
                key={card.key}
                delay={(i % 3) * 0.08}
                className={`l-card group flex flex-col gap-5 p-7 transition-[transform,border-color] duration-300 hover:-translate-y-0.5 hover:border-[var(--l-accent)] ${
                  i < 3 ? "lg:col-span-2" : "lg:col-span-3"
                }`}
              >
                <span className="grid h-11 w-11 place-items-center rounded-[14px] border border-[var(--l-line-strong)] text-[var(--l-accent-ink)]">
                  {Icon ? <Icon size={20} strokeWidth={1.7} /> : <WhatsAppGlyph size={20} />}
                </span>
                <h3 className="l-h3">
                  <Accent h={card.title} />
                </h3>
                <p className="l-body">{card.body}</p>
              </Reveal>
            );
          })}
        </ul>
        <p className="l-mono mt-6 flex items-center gap-2 text-xs text-[var(--l-ink-3)]">
          <MessageSquareText size={14} strokeWidth={1.7} />
          The WhatsApp extension works with WhatsApp Web. The Copilot works inside SynCRM.
        </p>
      </Container>
    </section>
  );
}
