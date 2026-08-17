"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  SectionLoader,
  EmptyState,
  BarsCard,
  SectionToolbar,
  KpiCard,
  COLOR,
} from "./report-ui";
import type { ExportPayload } from "@/lib/report-export";
import { ACTIVITY_TYPE_OPTIONS, activityTypeLabel } from "@/lib/activity-types";

function formatDateTime(ts: number): string {
  if (!ts) return "—";
  return new Date(ts).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function TaskSummarySection({
  start,
  end,
  ownerUserId,
  periodLabel,
}: {
  start: number;
  end: number;
  ownerUserId?: Id<"users">;
  periodLabel: string;
}) {
  const data = useQuery(api.reports.taskSummary, { start, end, ownerUserId });
  const log = useQuery(api.reports.taskActivityLog, { start, end, ownerUserId });

  if (data === undefined) return <SectionLoader />;

  const { totals, byAgent } = data;
  const hasActivity =
    totals.created || totals.completed || totals.pending || totals.overdue;

  if (!hasActivity) {
    return <EmptyState message="No task activity in this period." />;
  }

  const chartData = byAgent
    .slice(0, 8)
    .map((r) => ({ name: r.name, created: r.created, completed: r.completed }));

  // Keep the canonical type order rather than whatever the data happens to
  // contain, and drop types with no activity so the chart stays readable.
  const typeRows = ACTIVITY_TYPE_OPTIONS.map((t) => ({
    type: t.value,
    name: t.label,
    created: totals.byType[t.value]?.created ?? 0,
    completed: totals.byType[t.value]?.completed ?? 0,
  })).filter((r) => r.created || r.completed);

  const logItems = log?.items ?? [];

  const linkedContext = (item: (typeof logItems)[number]): string => {
    const parts: string[] = [];
    if (item.leadName) parts.push(`Lead: ${item.leadName}`);
    if (item.propertyTitle) parts.push(`Property: ${item.propertyTitle}`);
    if (item.contactName && item.contactName !== item.leadName) {
      parts.push(
        `${item.contactOwnerType ? "Owner" : "Contact"}: ${item.contactName}`
      );
    }
    return parts.length ? parts.join(" · ") : "—";
  };

  const punctuality = (onTime: boolean | null): string =>
    onTime === null ? "No due date" : onTime ? "On time" : "Late";

  const buildExport = (): ExportPayload => ({
    filename: `tasks-${periodLabel}`.replace(/\s+/g, "-"),
    title: "Task Summary",
    subtitle: periodLabel,
    summary: [
      { label: "Tasks created", value: String(totals.created) },
      { label: "Tasks completed", value: String(totals.completed) },
      { label: "Tasks pending", value: String(totals.pending) },
      { label: "Tasks overdue", value: String(totals.overdue) },
      { label: "Completion rate", value: `${totals.completionRate}%` },
      { label: "Completed on time", value: String(totals.completedOnTime) },
      { label: "Completed late", value: String(totals.completedLate) },
      { label: "On-time rate", value: `${totals.onTimeRate}%` },
    ],
    tables: [
      {
        name: "Tasks by type",
        columns: [
          { key: "name", label: "Type" },
          { key: "created", label: "Created" },
          { key: "completed", label: "Completed" },
        ],
        rows: typeRows,
      },
      {
        name: "Tasks by agent",
        columns: [
          { key: "name", label: "Agent" },
          { key: "created", label: "Created" },
          { key: "completed", label: "Completed" },
          { key: "pending", label: "Pending" },
          { key: "overdue", label: "Overdue" },
          { key: "completionRateText", label: "Completion %" },
          { key: "onTimeRateText", label: "On-time %" },
        ],
        rows: byAgent.map((r) => ({
          ...r,
          completionRateText: `${r.completionRate}%`,
          onTimeRateText: `${r.onTimeRate}%`,
        })),
      },
      {
        name: "Completed task log",
        columns: [
          { key: "completedAtText", label: "Completed" },
          { key: "typeLabel", label: "Type" },
          { key: "title", label: "Task" },
          { key: "context", label: "Related to" },
          { key: "agentName", label: "Agent" },
          { key: "punctuality", label: "Timing" },
          { key: "completionNotes", label: "Outcome" },
        ],
        rows: logItems.map((i) => ({
          completedAtText: formatDateTime(i.completedAt),
          typeLabel: activityTypeLabel(i.type),
          title: i.title,
          context: linkedContext(i),
          agentName: i.agentName,
          punctuality: punctuality(i.onTime),
          completionNotes: i.completionNotes,
        })),
      },
    ],
  });

  return (
    <div className="space-y-6">
      <SectionToolbar title="Task summary" build={buildExport} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <KpiCard label="Created" value={totals.created} />
        <KpiCard label="Completed" value={totals.completed} />
        <KpiCard label="Pending" value={totals.pending} />
        <KpiCard label="Overdue" value={totals.overdue} />
        <KpiCard label="Completion rate" value={`${totals.completionRate}%`} />
        <KpiCard label="On-time rate" value={`${totals.onTimeRate}%`} />
      </div>

      <BarsCard
        title="Tasks by type"
        data={typeRows}
        nameKey="name"
        bars={[
          { key: "created", name: "Created", color: COLOR.info },
          { key: "completed", name: "Completed", color: COLOR.success },
        ]}
      />

      <BarsCard
        title="Tasks created vs completed"
        data={chartData}
        nameKey="name"
        bars={[
          { key: "created", name: "Created", color: COLOR.info },
          { key: "completed", name: "Completed", color: COLOR.success },
        ]}
      />

      <Card>
        <CardHeader>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-text-muted">
            Tasks by agent
          </h3>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agent</TableHead>
                <TableHead className="text-right">Created</TableHead>
                <TableHead className="text-right">Completed</TableHead>
                <TableHead className="text-right">Pending</TableHead>
                <TableHead className="text-right">Overdue</TableHead>
                <TableHead className="text-right">Completion</TableHead>
                <TableHead className="text-right">On time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {byAgent.map((r) => (
                <TableRow key={r.userId}>
                  <TableCell className="font-medium">{r.name}</TableCell>
                  <TableCell className="text-right">{r.created}</TableCell>
                  <TableCell className="text-right">{r.completed}</TableCell>
                  <TableCell className="text-right">{r.pending}</TableCell>
                  <TableCell className="text-right">{r.overdue}</TableCell>
                  <TableCell className="text-right">{r.completionRate}%</TableCell>
                  <TableCell className="text-right">{r.onTimeRate}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-text-muted">
            Completed task log
          </h3>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {log === undefined ? (
            <SectionLoader />
          ) : logItems.length === 0 ? (
            <EmptyState message="No tasks were completed in this period." />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Completed</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Task</TableHead>
                    <TableHead>Related to</TableHead>
                    <TableHead>Agent</TableHead>
                    <TableHead>Timing</TableHead>
                    <TableHead>Outcome</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logItems.map((i) => (
                    <TableRow key={i._id}>
                      <TableCell className="whitespace-nowrap text-sm text-text-muted">
                        {formatDateTime(i.completedAt)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm">
                        {activityTypeLabel(i.type)}
                      </TableCell>
                      <TableCell className="font-medium">{i.title}</TableCell>
                      <TableCell className="text-sm text-text-muted">
                        {linkedContext(i)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm text-text-muted">
                        {i.agentName}
                      </TableCell>
                      <TableCell>
                        {i.onTime === null ? (
                          <span className="text-sm text-text-dim">No due date</span>
                        ) : (
                          <Badge variant={i.onTime ? "success" : "danger"}>
                            {i.onTime ? "On time" : "Late"}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="max-w-xs text-sm text-text-muted">
                        {i.completionNotes || "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {log.truncated && (
                <p className="mt-3 text-xs text-text-dim">
                  Showing the {log.limit} most recent of {log.totalCount}{" "}
                  completed tasks. Narrow the period or filter by agent to see
                  the rest.
                </p>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-text-dim">
        Created, completed and the by-type breakdown count tasks within the
        selected period. Pending and overdue are a current snapshot of open
        tasks (overdue = due before now). Completion rate = completed ÷
        (completed + pending + overdue). On-time rate = completed on or before
        the due date ÷ completed tasks that had a due date — tasks without a due
        date are excluded rather than counted either way.
      </p>
    </div>
  );
}
