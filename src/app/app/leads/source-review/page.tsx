"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { motion } from "framer-motion";
import { AlertTriangle, Check } from "lucide-react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { useRequireAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { StaggeredDropDown } from "@/components/ui/staggered-dropdown";
import { EmptyState } from "@/components/ui/empty-state";
import {
  LEAD_SOURCE_OPTIONS,
  leadSourceLabel,
  type LeadSource,
} from "@/lib/lead-sources";
import { leadToasts } from "@/lib/toast";

const sectionVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const sectionItemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
} as const;

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Reassignment screen for leads still tagged with the retired generic
 * "Property portal" source. The migration flags them rather than guessing a
 * platform, so the true source is never invented — an agent picks it here.
 */
export default function LeadSourceReviewPage() {
  const { isLoading: authLoading } = useRequireAuth();

  const data = useQuery(api.leads.listNeedsSourceReview, {});
  const bulkSetSource = useMutation(api.leads.bulkSetSource);

  const [selected, setSelected] = useState<Set<Id<"leads">>>(new Set());
  const [bulkSource, setBulkSource] = useState<LeadSource>("propertybook");
  const [saving, setSaving] = useState(false);

  const items = useMemo(() => data?.items ?? [], [data]);
  const allSelected = items.length > 0 && selected.size === items.length;

  const toggleOne = (leadId: Id<"leads">) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(leadId)) next.delete(leadId);
      else next.add(leadId);
      return next;
    });
  };

  const toggleAll = () => {
    setSelected(allSelected ? new Set() : new Set(items.map((l) => l._id)));
  };

  const applySource = async (leadIds: Id<"leads">[], source: LeadSource) => {
    if (leadIds.length === 0) return;
    setSaving(true);
    try {
      const result = await bulkSetSource({ leadIds, source });
      leadToasts.sourceReassigned(result.updatedCount, leadSourceLabel(source));
      setSelected((prev) => {
        const next = new Set(prev);
        for (const id of leadIds) next.delete(id);
        return next;
      });
    } catch (error) {
      leadToasts.sourceReassignFailed(
        error instanceof Error ? error.message : undefined
      );
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || data === undefined) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <motion.div
      variants={sectionVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <motion.div variants={sectionItemVariants}>
        <h1 className="text-h1 text-text">Lead Source Review</h1>
        <p className="mt-1 text-sm text-text-muted">
          These leads were recorded under the old generic &ldquo;Property
          portal&rdquo; source. Reassign each one to the platform it actually
          came from so source reporting is accurate.
        </p>
      </motion.div>

      {items.length === 0 ? (
        <motion.div variants={sectionItemVariants}>
          <EmptyState
            icon={Check}
            title="Nothing to review"
            description="Every lead has a specific source. New leads can only be created against a named platform."
          />
        </motion.div>
      ) : (
        <>
          <motion.div variants={sectionItemVariants}>
            <Card>
              <CardHeader className="flex flex-row items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-warning" />
                <h2 className="text-base font-semibold">
                  {items.length} lead{items.length === 1 ? "" : "s"} need a
                  source
                </h2>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                  <div className="sm:w-64">
                    <label className="mb-1 block text-sm font-medium text-text">
                      Reassign selected to
                    </label>
                    <StaggeredDropDown
                      value={bulkSource}
                      onChange={(val) => setBulkSource(val as LeadSource)}
                      options={LEAD_SOURCE_OPTIONS}
                    />
                  </div>
                  <Button
                    onClick={() => applySource([...selected], bulkSource)}
                    disabled={saving || selected.size === 0}
                  >
                    Apply to {selected.size} selected
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={sectionItemVariants}>
            <Card>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">
                        <input
                          type="checkbox"
                          aria-label="Select all leads"
                          checked={allSelected}
                          onChange={toggleAll}
                          className="h-4 w-4 rounded border-border-strong"
                        />
                      </TableHead>
                      <TableHead>Lead</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Interest</TableHead>
                      <TableHead>Agent</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="w-56">Set source</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((lead) => (
                      <TableRow key={lead._id}>
                        <TableCell>
                          <input
                            type="checkbox"
                            aria-label={`Select ${lead.fullName}`}
                            checked={selected.has(lead._id)}
                            onChange={() => toggleOne(lead._id)}
                            className="h-4 w-4 rounded border-border-strong"
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          {lead.fullName}
                        </TableCell>
                        <TableCell className="text-sm text-text-muted">
                          {lead.phone || lead.email || "—"}
                        </TableCell>
                        <TableCell className="text-sm text-text-muted">
                          {lead.interestType === "rent" ? "Renting" : "Buying"}
                        </TableCell>
                        <TableCell className="text-sm text-text-muted">
                          {lead.ownerName}
                        </TableCell>
                        <TableCell className="text-sm text-text-muted">
                          {formatDate(lead.createdAt)}
                        </TableCell>
                        <TableCell>
                          <StaggeredDropDown
                            value=""
                            onChange={(val) =>
                              applySource([lead._id], val as LeadSource)
                            }
                            options={[
                              { value: "", label: "Choose…" },
                              ...LEAD_SOURCE_OPTIONS,
                            ]}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </motion.div>
  );
}
