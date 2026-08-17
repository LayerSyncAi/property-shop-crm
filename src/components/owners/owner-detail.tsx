"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { ArrowLeft, Building2, Home, Mail, Phone, User } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { EmptyState } from "@/components/ui/empty-state";
import { ListSkeleton } from "@/components/ui/list-skeleton";
import { formatMoney } from "@/lib/currency";
import { ownerTypeLabel } from "@/lib/owner-types";

interface OwnerDetailProps {
  ownerId: Id<"contacts">;
}

const STATUS_LABELS: Record<string, string> = {
  available: "Available",
  under_offer: "Under offer",
  let: "Let",
  sold: "Sold",
  off_market: "Off market",
};

export function OwnerDetail({ ownerId }: OwnerDetailProps) {
  const router = useRouter();
  const owner = useQuery(api.owners.getById, { ownerId });

  if (owner === undefined) return <ListSkeleton />;

  if (owner === null) {
    return (
      <EmptyState
        icon={User}
        title="Owner not found"
        description="This owner may have been removed, or you may not have access to it."
        action={
          <Button onClick={() => router.push("/app/owners")}>Back to Owners</Button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Breadcrumb
          items={[{ label: "Owners", href: "/app/owners" }, { label: owner.name }]}
        />
        <Button variant="ghost" onClick={() => router.push("/app/owners")}>
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
      </div>

      <Card className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-h1">{owner.name}</h1>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="info">{ownerTypeLabel(owner.ownerType)}</Badge>
              {owner.alsoBuyerTenant && (
                <Link href={`/app/contacts/${owner._id}`}>
                  <Badge variant="secondary">
                    Also a buyer/tenant — view contact
                  </Badge>
                </Link>
              )}
            </div>
          </div>
          <div className="space-y-1 text-sm text-text-muted">
            {owner.phone && (
              <p className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5" />
                <a href={`tel:${owner.phone}`} className="hover:text-text">
                  {owner.phone}
                </a>
              </p>
            )}
            {owner.email && (
              <p className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5" />
                <a href={`mailto:${owner.email}`} className="hover:text-text">
                  {owner.email}
                </a>
              </p>
            )}
            {owner.company && (
              <p className="flex items-center gap-2">
                <Building2 className="h-3.5 w-3.5" />
                {owner.company}
              </p>
            )}
            <p className="flex items-center gap-2">
              <User className="h-3.5 w-3.5" />
              {owner.agents.map((a) => a.name).join(", ") || "Unassigned"}
            </p>
          </div>
        </div>

        {owner.notes && (
          <div className="mt-6 border-t border-border pt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
              Notes
            </p>
            <p className="mt-1 whitespace-pre-wrap text-sm">{owner.notes}</p>
          </div>
        )}
      </Card>

      <Card className="p-6">
        <h2 className="text-h3">Properties</h2>
        {owner.properties.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              icon={Home}
              title="No properties linked"
              description="Link this owner from a property's Owner tab to see their portfolio here."
            />
          </div>
        ) : (
          <ul className="mt-4 space-y-3">
            {owner.properties.map((property) => (
              <li key={property._id}>
                <Link
                  href={`/app/properties?property=${property._id}`}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-[10px] border border-border-strong p-4 transition-colors hover:bg-surface-2/40"
                >
                  <div>
                    <p className="font-medium">{property.title}</p>
                    <p className="text-sm text-text-muted">{property.location}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">
                      {property.role === "landlord" ? "Landlord" : "Seller"}
                    </Badge>
                    <Badge variant="neutral">
                      {STATUS_LABELS[property.status] ?? property.status}
                    </Badge>
                    <span className="text-sm font-medium">
                      {formatMoney(property.price, property.currency)}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
