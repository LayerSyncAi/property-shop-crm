"use client";

import { ChevronDown, ChevronUp, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getFormat } from "@/lib/syncmedia/formats";
import { getTemplate } from "@/lib/syncmedia/templates";
import type { BrochureDoc } from "@/lib/syncmedia/types";
import { cn } from "@/lib/utils";
import { QuickPicks, Section, TextField, Toggle } from "./controls";

const EYEBROWS = ["For Sale", "To Let", "New Listing", "Price Reduced", "Open House", "Sold"];
const PRICE_LABELS = ["Asking price", "Rent per month", "Guide price", "Offers from"];

export function ContentPanel({
  doc,
  patch,
}: {
  doc: BrochureDoc;
  patch: (changes: Partial<BrochureDoc>) => void;
}) {
  const template = getTemplate(doc.templateId);
  const preset = getFormat(doc.formatKey);

  function setFeature(index: number, value: string) {
    patch({ features: doc.features.map((f, i) => (i === index ? value : f)) });
  }

  function moveFeature(from: number, to: number) {
    if (to < 0 || to >= doc.features.length) return;
    const next = [...doc.features];
    const [feature] = next.splice(from, 1);
    next.splice(to, 0, feature);
    patch({ features: next });
  }

  return (
    <div className="space-y-7">
      <Section title="Banner" hint="The small line above the title.">
        <QuickPicks
          options={EYEBROWS}
          value={doc.eyebrow}
          onPick={(value) => patch({ eyebrow: value })}
        />
        <TextField
          label="Or write your own"
          value={doc.eyebrow}
          onChange={(eyebrow) => patch({ eyebrow })}
          placeholder="FOR SALE"
          maxLength={28}
        />
      </Section>

      <Section title="Headline">
        <TextField
          label="Title"
          value={doc.title}
          onChange={(title) => patch({ title })}
          placeholder="Four bedroom cluster"
          maxLength={70}
        />
        <TextField
          label="Location"
          value={doc.location}
          onChange={(location) => patch({ location })}
          placeholder="Borrowdale, Harare"
          maxLength={60}
        />
        <TextField
          label="Reference"
          value={doc.reference}
          onChange={(reference) => patch({ reference })}
          placeholder="REF1564"
          maxLength={16}
        />
      </Section>

      <Section title="Price">
        <TextField
          label="Price"
          value={doc.price}
          onChange={(price) => patch({ price })}
          placeholder="$285,000"
          maxLength={28}
        />
        <QuickPicks
          options={PRICE_LABELS}
          value={doc.priceLabel}
          onPick={(value) => patch({ priceLabel: value })}
        />
      </Section>

      <Section
        title="Features"
        hint={`${template.name} at ${preset.label} shows the first ${template.featureSlots}.`}
      >
        <ul className="space-y-1.5">
          {doc.features.map((feature, i) => {
            const spare = i >= template.featureSlots;
            return (
              <li key={i} className="flex items-center gap-1">
                <input
                  type="text"
                  value={feature}
                  onChange={(e) => setFeature(i, e.target.value)}
                  placeholder={`Feature ${i + 1}`}
                  maxLength={34}
                  className={cn(
                    "h-10 min-w-0 flex-1 rounded-[10px] border px-3 text-sm outline-none transition focus:ring-4 focus:ring-[var(--primary-glow)]",
                    spare
                      ? "border-border bg-surface-2 text-text-muted"
                      : "border-border-strong bg-transparent text-text focus:border-primary-600"
                  )}
                />
                <button
                  type="button"
                  onClick={() => moveFeature(i, i - 1)}
                  disabled={i === 0}
                  aria-label="Move up"
                  className="cursor-pointer rounded p-1.5 text-text-muted hover:bg-row-hover disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <ChevronUp className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => moveFeature(i, i + 1)}
                  disabled={i === doc.features.length - 1}
                  aria-label="Move down"
                  className="cursor-pointer rounded p-1.5 text-text-muted hover:bg-row-hover disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => patch({ features: doc.features.filter((_, idx) => idx !== i) })}
                  aria-label="Remove feature"
                  className="cursor-pointer rounded p-1.5 text-danger hover:bg-danger/10"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </li>
            );
          })}
        </ul>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => patch({ features: [...doc.features, ""] })}
        >
          <Plus className="h-3.5 w-3.5" />
          Add feature
        </Button>
        {doc.features.length > template.featureSlots ? (
          <p className="text-xs text-text-muted">
            The greyed-out ones are past what this layout fits. Reorder to choose which show.
          </p>
        ) : null}
      </Section>

      <Section title="Your details" hint="These appear on the contact bar of every layout.">
        <TextField
          label="Name"
          value={doc.agentName}
          onChange={(agentName) => patch({ agentName })}
          placeholder="Your name"
          maxLength={40}
        />
        <TextField
          label="Phone"
          type="tel"
          value={doc.agentPhone}
          onChange={(agentPhone) => patch({ agentPhone })}
          placeholder="+263 775 920 436"
          maxLength={24}
        />
        <TextField
          label="Email (optional)"
          type="email"
          value={doc.agentEmail}
          onChange={(agentEmail) => patch({ agentEmail })}
          placeholder="you@agency.co.zw"
          maxLength={44}
        />
        <Toggle
          label="This number takes WhatsApp"
          hint="Shows the WhatsApp mark beside it, so buyers know they can message."
          checked={doc.whatsappContact}
          onChange={(whatsappContact) => patch({ whatsappContact })}
        />
      </Section>

      <Section title="Branding">
        <Toggle
          label="Show your logo"
          hint="Turn off for an unbranded brochure."
          checked={doc.showLogo}
          onChange={(showLogo) => patch({ showLogo })}
        />
      </Section>
    </div>
  );
}
