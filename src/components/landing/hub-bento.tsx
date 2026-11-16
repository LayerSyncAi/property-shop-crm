import { BellRing } from "lucide-react";
import { hub } from "./content";
import { Accent, Container, Eyebrow } from "./bits";
import { Reveal } from "./motion";
import { HubBentoPhone, ModuleSwitches, AlertToasts } from "./hub-bento-client";

export function HubBento() {
  const t = hub.tiles;
  return (
    <section id="hub" aria-labelledby="hub-title" className="relative py-24 sm:py-32">
      <Container>
        <Reveal className="flex max-w-3xl flex-col gap-5">
          <Eyebrow dot>{hub.eyebrow}</Eyebrow>
          <h2 id="hub-title" className="l-h2">
            <Accent h={hub.headline} />
          </h2>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-4 lg:grid-cols-12 lg:grid-rows-[auto_auto_auto]">
          <Reveal className="l-card l-stage relative overflow-hidden lg:col-span-7 lg:row-span-2">
            <div className="relative z-10 p-7 sm:p-9">
              <h3 className="l-h3 max-w-[22ch]">{t.attention.title}</h3>
              <p className="l-body mt-3 max-w-[48ch]">{t.attention.body}</p>
            </div>
            <HubBentoPhone />
          </Reveal>

          <Reveal delay={0.08} className="l-card flex flex-col gap-6 p-7 sm:p-9 lg:col-span-5">
            <div>
              <h3 className="l-h3">{t.modules.title}</h3>
              <p className="l-body mt-3">{t.modules.body}</p>
            </div>
            <ModuleSwitches />
          </Reveal>

          <Reveal delay={0.16} className="l-card flex flex-col gap-6 p-7 sm:p-9 lg:col-span-5">
            <div>
              <h3 className="l-h3">{t.roles.title}</h3>
              <p className="l-body mt-3">{t.roles.body}</p>
            </div>
            <ul className="flex flex-wrap gap-2" aria-label="Roles">
              {t.roles.list.map((r) => (
                <li key={r} className="l-mono rounded-full border border-[var(--l-line-strong)] px-3 py-1.5 text-xs text-[var(--l-ink-2)]">
                  {r}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.08} className="l-card grid min-w-0 grid-cols-[minmax(0,1fr)] gap-6 p-7 sm:p-9 lg:col-span-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:items-center">
            <div className="flex gap-4">
              <span className="grid h-11 w-11 flex-none place-items-center rounded-[14px] bg-[var(--l-accent)] text-[var(--l-on-accent)]">
                <BellRing size={20} strokeWidth={1.8} />
              </span>
              <div>
                <h3 className="l-h3">{t.alerts.title}</h3>
                <p className="l-body mt-2 max-w-[46ch]">{t.alerts.body}</p>
              </div>
            </div>
            <AlertToasts />
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
