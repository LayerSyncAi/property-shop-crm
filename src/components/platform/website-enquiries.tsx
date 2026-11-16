"use client";

/**
 * Platform page card: "Get in touch" enquiries from the SyncEstate landing
 * page and layersyncai.com (convex/websiteEnquiries.ts). Each visitor also
 * opened a WhatsApp chat with us; this list is the record of who asked.
 */
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { Inbox, Loader2, MessageCircle, Phone } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { animatedToast } from "@/components/ui/animated-toaster";
import { getErrorMessage } from "@/lib/errors";
import { telHref, whatsAppHref } from "@/lib/phone";

type Status = "new" | "contacted" | "archived";
const FILTERS: Array<{ key: Status | "all"; label: string }> = [
  { key: "new", label: "New" },
  { key: "contacted", label: "Contacted" },
  { key: "archived", label: "Archived" },
  { key: "all", label: "All" },
];

const SITE_LABEL = { syncestate: "SyncEstate", layersync: "LayerSync" } as const;
const STATUS_BADGE = { new: "warning", contacted: "success", archived: "neutral" } as const;

const formatWhen = (ts: number) =>
  new Date(ts).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

export function WebsiteEnquiries() {
  const [filter, setFilter] = useState<Status | "all">("new");
  const rows = useQuery(api.websiteEnquiries.list, filter === "all" ? {} : { status: filter });
  const newCount = useQuery(api.websiteEnquiries.countNew, {});
  const setStatus = useMutation(api.websiteEnquiries.setStatus);
  const [busyId, setBusyId] = useState<string | null>(null);

  const update = async (id: Id<"websiteEnquiries">, status: Status) => {
    setBusyId(id);
    try {
      await setStatus({ id, status });
    } catch (error) {
      animatedToast.error("Could not update the enquiry", { description: getErrorMessage(error) });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-base font-semibold">
              <Inbox className="h-4 w-4 text-text-muted" />
              Website enquiries
              {newCount ? <Badge variant="warning">{newCount} new</Badge> : null}
            </h2>
            <p className="mt-1 text-sm text-text-muted">
              Everyone who pressed &ldquo;Get in touch&rdquo; on the SyncEstate or LayerSync website. They were
              sent on to WhatsApp, so most will already be in the chat.
            </p>
          </div>
          <div role="tablist" aria-label="Filter enquiries" className="flex gap-1 rounded-full border border-border p-1">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                role="tab"
                aria-selected={filter === f.key}
                onClick={() => setFilter(f.key)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  filter === f.key ? "bg-primary text-primary-foreground" : "text-text-muted hover:text-text"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {rows === undefined ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary-ink" />
          </div>
        ) : rows.length === 0 ? (
          <p className="py-8 text-center text-sm text-text-muted">
            {filter === "new" ? "No new enquiries. You're all caught up." : "No enquiries here yet."}
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>Interested in</TableHead>
                  <TableHead>Last enquiry</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => {
                  const wa = whatsAppHref(r.phone);
                  const tel = telHref(r.phone);
                  return (
                    <TableRow key={r._id}>
                      <TableCell>
                        <p className="font-medium text-text">{r.name}</p>
                        {r.submissions > 1 && <p className="text-xs text-text-muted">Asked {r.submissions} times</p>}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 whitespace-nowrap">
                          <span>{r.phone}</span>
                          {wa && (
                            <a href={wa} target="_blank" rel="noopener noreferrer" title="Open in WhatsApp" className="text-primary-ink hover:opacity-80">
                              <MessageCircle className="h-4 w-4" />
                            </a>
                          )}
                          {tel && (
                            <a href={tel} title="Call" className="text-text-muted hover:text-text">
                              <Phone className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <p>{SITE_LABEL[r.site]}</p>
                        {r.page && <p className="max-w-[180px] truncate text-xs text-text-muted" title={r.page}>{r.page}</p>}
                      </TableCell>
                      <TableCell>{r.interest ?? <span className="text-text-muted">—</span>}</TableCell>
                      <TableCell className="whitespace-nowrap">{formatWhen(r.lastSubmittedAt)}</TableCell>
                      <TableCell>
                        <Badge variant={STATUS_BADGE[r.status]}>
                          {r.status === "new" ? "New" : r.status === "contacted" ? "Contacted" : "Archived"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {r.status !== "contacted" && (
                            <Button size="sm" variant="secondary" disabled={busyId === r._id} onClick={() => update(r._id, "contacted")}>
                              Mark contacted
                            </Button>
                          )}
                          {r.status !== "archived" ? (
                            <Button size="sm" variant="ghost" disabled={busyId === r._id} onClick={() => update(r._id, "archived")}>
                              Archive
                            </Button>
                          ) : (
                            <Button size="sm" variant="ghost" disabled={busyId === r._id} onClick={() => update(r._id, "new")}>
                              Reopen
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
