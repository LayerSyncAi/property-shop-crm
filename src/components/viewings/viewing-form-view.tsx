"use client";

import * as React from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { brand } from "@/config/brand";

interface ViewingFormViewProps {
  open: boolean;
  onClose: () => void;
  formId: Id<"viewingForms"> | null;
  onEdit?: () => void;
}

const fmtDate = (iso: string) => {
  const d = new Date(iso + "T00:00:00");
  return isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
};

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-border/60 py-1.5 sm:flex-row sm:gap-3">
      <span className="w-52 shrink-0 text-xs font-medium uppercase tracking-wide text-text-muted">
        {label}
      </span>
      <span className="text-sm text-text">{value || "—"}</span>
    </div>
  );
}

function SignatureBlock({
  role,
  name,
  url,
}: {
  role: string;
  name?: string | null;
  url?: string | null;
}) {
  return (
    <div className="flex-1">
      <div className="flex h-20 items-end justify-center rounded-lg border border-border bg-white p-2">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt={`${role} signature`} className="max-h-16 w-auto object-contain" />
        ) : (
          <span className="text-xs text-text-muted">No signature</span>
        )}
      </div>
      <p className="mt-1 text-center text-xs font-medium text-text">{name || "—"}</p>
      <p className="text-center text-[11px] uppercase tracking-wide text-text-muted">{role}</p>
    </div>
  );
}

/** Build a self-contained printable HTML document and open it in a new window. */
function printForm(form: NonNullable<ReturnType<typeof useForm>>) {
  const esc = (s?: string | null) =>
    (s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] as string));
  const sig = (url?: string | null, name?: string | null, role?: string) => `
    <div style="flex:1;text-align:center;">
      <div style="height:70px;border:1px solid #ccc;display:flex;align-items:flex-end;justify-content:center;padding:4px;">
        ${url ? `<img src="${esc(url)}" style="max-height:56px;max-width:100%;" />` : `<span style="color:#999;font-size:11px;">No signature</span>`}
      </div>
      <div style="font-size:12px;font-weight:600;margin-top:4px;">${esc(name) || "—"}</div>
      <div style="font-size:10px;text-transform:uppercase;color:#666;">${esc(role)}</div>
    </div>`;
  const line = (label: string, value?: string | null) => `
    <tr><td style="padding:4px 8px;font-size:11px;text-transform:uppercase;color:#666;width:40%;border-bottom:1px solid #eee;">${esc(label)}</td>
    <td style="padding:4px 8px;font-size:13px;border-bottom:1px solid #eee;">${esc(value) || "—"}</td></tr>`;

  const html = `<!doctype html><html><head><meta charset="utf-8"/><title>Viewing Form — ${esc(form.clientName)}</title>
  <style>@media print{@page{margin:16mm;}} body{font-family:Arial,Helvetica,sans-serif;color:#111;margin:24px;}</style></head>
  <body>
    <div style="text-align:center;border-bottom:2px solid #111;padding-bottom:8px;margin-bottom:16px;">
      <div style="font-size:20px;font-weight:700;">${esc(brand.name)}</div>
      ${brand.contact.address ? `<div style="font-size:12px;color:#555;">${esc(brand.contact.address)}</div>` : ""}
      ${brand.contact.phone || brand.contact.email ? `<div style="font-size:12px;color:#555;">${esc([brand.contact.phone, brand.contact.email].filter(Boolean).join("  ·  "))}</div>` : ""}
      <div style="font-size:16px;font-weight:700;letter-spacing:2px;margin-top:10px;">VIEWING FORM</div>
    </div>
    <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
      ${line("Date", fmtDate(form.viewingDate))}
      ${line("Time", form.viewingTime)}
      ${line("Property Address", form.propertyAddress)}
      ${line("Client's Name", form.clientName)}
      ${line("Client's Company Name", form.clientCompany)}
      ${line("Client's I.D No.", form.clientIdNumber)}
      ${line("Client's Spouse's Name", form.clientSpouseName)}
      ${line("Client's Telephone No.", form.clientPhone)}
      ${line("Client's Email Address", form.clientEmail)}
      ${line("Property Negotiator", form.negotiatorName || form.agentName)}
    </table>
    <div style="display:flex;gap:16px;margin-top:32px;">
      ${sig(form.clientSignatureUrl, form.clientName, "Client Signature")}
      ${sig(form.negotiatorSignatureUrl, form.negotiatorName || form.agentName, "Property Negotiator")}
      ${sig(form.sellerSignatureUrl, form.sellerName, "Seller / Caretaker")}
    </div>
    <p style="margin-top:28px;font-size:11px;color:#777;">This form confirms that the above-named client was introduced to the property by the property negotiator on the date shown. Retained for audit and commission purposes.</p>
    <script>window.onload=function(){window.print();}</script>
  </body></html>`;

  const w = window.open("", "_blank", "width=800,height=900");
  if (w) {
    w.document.write(html);
    w.document.close();
  }
}

// Small helper so printForm can share the query's return type.
function useForm(formId: Id<"viewingForms"> | null) {
  return useQuery(api.viewingForms.getById, formId ? { formId } : "skip");
}

export function ViewingFormView({ open, onClose, formId, onEdit }: ViewingFormViewProps) {
  const form = useForm(formId);

  return (
    <Modal
      open={open}
      title="Viewing Form"
      description={form ? `${form.clientName} · ${fmtDate(form.viewingDate)}` : "Loading…"}
      onClose={onClose}
      footer={
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          {form && onEdit && form.canEdit && form.status !== "completed" && (
            <Button variant="ghost" onClick={onEdit}>
              Edit
            </Button>
          )}
          {form && (
            <Button onClick={() => printForm(form)}>Print / Download PDF</Button>
          )}
        </div>
      }
    >
      {!form ? (
        <div className="py-10 text-center text-sm text-text-muted">Loading…</div>
      ) : (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold tracking-wide text-text">VIEWING FORM</div>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                form.status === "completed"
                  ? "bg-emerald-500/10 text-emerald-600"
                  : "bg-amber-500/10 text-amber-600"
              }`}
            >
              {form.status === "completed" ? "Completed" : "Draft"}
            </span>
          </div>

          <div>
            <Row label="Date" value={fmtDate(form.viewingDate)} />
            <Row label="Time" value={form.viewingTime} />
            <Row label="Property Address" value={form.propertyAddress} />
            <Row label="Client's Name" value={form.clientName} />
            <Row label="Client's Company Name" value={form.clientCompany} />
            <Row label="Client's I.D No." value={form.clientIdNumber} />
            <Row label="Client's Spouse's Name" value={form.clientSpouseName} />
            <Row label="Client's Telephone No." value={form.clientPhone} />
            <Row label="Client's Email Address" value={form.clientEmail} />
            <Row label="Property Negotiator" value={form.negotiatorName || form.agentName} />
            {(form.propertyTitle || form.contactName || form.leadName) && (
              <Row
                label="Linked records"
                value={[
                  form.propertyTitle && `Property: ${form.propertyTitle}`,
                  form.contactName && `Contact: ${form.contactName}`,
                  form.leadName && `Lead: ${form.leadName}`,
                ]
                  .filter(Boolean)
                  .join("  ·  ")}
              />
            )}
          </div>

          <div className="flex flex-col gap-4 sm:flex-row">
            <SignatureBlock role="Client Signature" name={form.clientName} url={form.clientSignatureUrl} />
            <SignatureBlock role="Property Negotiator" name={form.negotiatorName || form.agentName} url={form.negotiatorSignatureUrl} />
            <SignatureBlock role="Seller / Caretaker" name={form.sellerName} url={form.sellerSignatureUrl} />
          </div>
        </div>
      )}
    </Modal>
  );
}
