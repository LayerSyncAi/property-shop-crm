"use client";

import { use } from "react";
import { OwnerDetail } from "@/components/owners/owner-detail";
import { Id } from "../../../../../convex/_generated/dataModel";

export default function OwnerDetailPage({
  params,
}: {
  params: Promise<{ ownerId: string }>;
}) {
  const { ownerId } = use(params);
  return <OwnerDetail ownerId={ownerId as Id<"contacts">} />;
}
