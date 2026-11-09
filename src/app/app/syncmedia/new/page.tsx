"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { useAuth } from "@/hooks/useAuth";
import { BrochureStudio } from "@/components/syncmedia/BrochureStudio";
import { seedFromProperty } from "@/lib/syncmedia/fromProperty";
import type { BrochureDoc } from "@/lib/syncmedia/types";

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
      {children}
    </div>
  );
}

function StudioPage() {
  const searchParams = useSearchParams();
  const propertyIdParam = searchParams.get("propertyId") ?? undefined;
  const propertyId = propertyIdParam as Id<"properties"> | undefined;
  const { user, isLoading } = useAuth();

  const property = useQuery(
    api.properties.getById,
    propertyId ? { propertyId } : "skip"
  );
  // The agent's own saved draft for this property, if they have one.
  const saved = useQuery(api.syncmedia.getMineForProperty, { propertyId });
  // Everything they've made before, newest first — used to carry their habits
  // forward into a brochure they haven't started yet.
  const previous = useQuery(api.syncmedia.listMine, {});
  const branding = useQuery(api.branding.get, {});

  /**
   * Carry the agent's last brochure forward as the starting point for a new
   * one: the layout, format and colour they picked, and the contact details
   * they typed. An agent making twenty brochures a month picks the same
   * combination every time, and re-choosing it each visit is pure friction.
   *
   * Only defaults — everything is still editable, and a saved draft for this
   * property beats it.
   */
  const carriedOver = useMemo<Partial<BrochureDoc>>(() => {
    const last = previous?.[0];
    if (!last) return {};
    return {
      formatKey: last.formatKey as BrochureDoc["formatKey"],
      templateId: last.templateId as BrochureDoc["templateId"],
      themeId: last.themeId as BrochureDoc["themeId"],
      showLogo: last.showLogo,
      whatsappContact: last.whatsappContact,
      agentName: last.agentName,
      agentPhone: last.agentPhone,
      agentEmail: last.agentEmail,
    };
  }, [previous]);

  const propertyDoc = useMemo<Partial<BrochureDoc>>(() => {
    const contact = {
      // What they used last time wins: it's their own number, and they just
      // confirmed it by using it. The users table carries no phone column, so
      // the agency's own line is the only fallback for that field.
      agentName: carriedOver.agentName || user?.fullName || user?.name || "",
      agentPhone: carriedOver.agentPhone || branding?.contactPhone || "",
      agentEmail: carriedOver.agentEmail || user?.email || "",
    };
    // Starting blank still prefills who to contact; the property comes from
    // the picker inside the studio.
    const base = { ...carriedOver, ...contact };
    if (!property) return base;
    return { ...base, ...seedFromProperty(property) };
  }, [property, user, branding, carriedOver]);

  /**
   * A saved draft wins over the property defaults — it is the agent's own
   * edited copy, and re-deriving from the property would silently throw away
   * whatever they wrote last time.
   */
  const initialDoc = useMemo<Partial<BrochureDoc>>(() => {
    if (!saved) return propertyDoc;
    return {
      formatKey: saved.formatKey as BrochureDoc["formatKey"],
      templateId: saved.templateId as BrochureDoc["templateId"],
      themeId: saved.themeId as BrochureDoc["themeId"],
      photos: saved.photos,
      eyebrow: saved.eyebrow,
      title: saved.title,
      location: saved.location,
      price: saved.price,
      priceLabel: saved.priceLabel,
      features: saved.features,
      reference: saved.reference,
      agentName: saved.agentName,
      agentPhone: saved.agentPhone,
      agentEmail: saved.agentEmail,
      showLogo: saved.showLogo,
      whatsappContact: saved.whatsappContact,
      // Cast rather than validated: `slot` and `format` are open strings in the
      // database on purpose, and an entry naming a block or format this build
      // no longer has is simply never looked up.
      nudges: (saved.nudges ?? []) as BrochureDoc["nudges"],
    };
  }, [saved, propertyDoc]);

  // Both the property and any saved draft have to land before the studio
  // mounts: seeding it early and patching afterwards would overwrite whatever
  // the agent had already typed.
  const waiting =
    isLoading ||
    (propertyId && property === undefined) ||
    saved === undefined ||
    previous === undefined;

  if (waiting) {
    return (
      <Centered>
        <p className="text-text-muted">Loading…</p>
      </Centered>
    );
  }

  return (
    <BrochureStudio
      // Remounts on a property change so the studio picks up fresh defaults
      // instead of holding the previous property's copy.
      key={propertyId ?? "blank"}
      initialDoc={initialDoc}
      savedBrochureId={saved?._id}
      propertyId={propertyId}
      backHref="/app/syncmedia"
    />
  );
}

export default function SyncMediaStudioPage() {
  return (
    <Suspense
      fallback={
        <Centered>
          <p className="text-text-muted">Loading…</p>
        </Centered>
      }
    >
      <StudioPage />
    </Suspense>
  );
}
