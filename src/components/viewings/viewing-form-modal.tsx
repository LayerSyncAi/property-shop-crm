"use client";

import * as React from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { FormField } from "@/components/ui/form-field";
import { SignatureField, type SignatureValue } from "./signature-pad";
import { validateViewingForm } from "../../../convex/viewingFormLib";
import { viewingToasts } from "@/lib/toast";

export interface ViewingFormPrefill {
  propertyId?: Id<"properties">;
  contactId?: Id<"contacts">;
  leadId?: Id<"leads">;
  propertyAddress?: string;
  clientName?: string;
  clientPhone?: string;
  clientEmail?: string;
  agentUserId?: Id<"users">;
}

interface ViewingFormModalProps {
  open: boolean;
  onClose: () => void;
  /** When set, the modal loads and edits an existing form. */
  formId?: Id<"viewingForms"> | null;
  prefill?: ViewingFormPrefill;
  onSaved?: (formId: Id<"viewingForms">) => void;
}

const todayISO = () => new Date().toISOString().slice(0, 10);

export function ViewingFormModal({
  open,
  onClose,
  formId,
  prefill,
  onSaved,
}: ViewingFormModalProps) {
  const agents = useQuery(api.users.listForAssignment);
  const me = useQuery(api.users.getMe);
  const existing = useQuery(
    api.viewingForms.getById,
    formId ? { formId } : "skip"
  );

  const createForm = useMutation(api.viewingForms.create);
  const updateForm = useMutation(api.viewingForms.update);

  const [isSaving, setIsSaving] = React.useState(false);

  // Form field state
  const [viewingDate, setViewingDate] = React.useState(todayISO());
  const [viewingTime, setViewingTime] = React.useState("");
  const [propertyAddress, setPropertyAddress] = React.useState("");
  const [clientName, setClientName] = React.useState("");
  const [clientCompany, setClientCompany] = React.useState("");
  const [clientIdNumber, setClientIdNumber] = React.useState("");
  const [clientSpouseName, setClientSpouseName] = React.useState("");
  const [clientPhone, setClientPhone] = React.useState("");
  const [clientEmail, setClientEmail] = React.useState("");
  const [agentUserId, setAgentUserId] = React.useState<string>("");
  const [negotiatorName, setNegotiatorName] = React.useState("");
  const [sellerName, setSellerName] = React.useState("");
  const [clientSig, setClientSig] = React.useState<SignatureValue | null>(null);
  const [negotiatorSig, setNegotiatorSig] = React.useState<SignatureValue | null>(null);
  const [sellerSig, setSellerSig] = React.useState<SignatureValue | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const locked = existing?.status === "completed";

  // Initialise from prefill (new form) or the loaded record (edit).
  const initedFor = React.useRef<string | null>(null);
  React.useEffect(() => {
    if (!open) {
      initedFor.current = null;
      return;
    }
    const key = formId ? `edit:${formId}` : "new";
    if (initedFor.current === key) return;

    if (formId) {
      if (!existing) return; // wait for load
      setViewingDate(existing.viewingDate);
      setViewingTime(existing.viewingTime ?? "");
      setPropertyAddress(existing.propertyAddress);
      setClientName(existing.clientName);
      setClientCompany(existing.clientCompany ?? "");
      setClientIdNumber(existing.clientIdNumber ?? "");
      setClientSpouseName(existing.clientSpouseName ?? "");
      setClientPhone(existing.clientPhone ?? "");
      setClientEmail(existing.clientEmail ?? "");
      setAgentUserId(existing.agentUserId);
      setNegotiatorName(existing.negotiatorName ?? "");
      setSellerName(existing.sellerName ?? "");
      setClientSig(existing.clientSignatureUrl && existing.clientSignatureId ? { storageId: existing.clientSignatureId, url: existing.clientSignatureUrl } : null);
      setNegotiatorSig(existing.negotiatorSignatureUrl && existing.negotiatorSignatureId ? { storageId: existing.negotiatorSignatureId, url: existing.negotiatorSignatureUrl } : null);
      setSellerSig(existing.sellerSignatureUrl && existing.sellerSignatureId ? { storageId: existing.sellerSignatureId, url: existing.sellerSignatureUrl } : null);
      initedFor.current = key;
    } else {
      setViewingDate(todayISO());
      setViewingTime("");
      setPropertyAddress(prefill?.propertyAddress ?? "");
      setClientName(prefill?.clientName ?? "");
      setClientCompany("");
      setClientIdNumber("");
      setClientSpouseName("");
      setClientPhone(prefill?.clientPhone ?? "");
      setClientEmail(prefill?.clientEmail ?? "");
      const defaultAgent = prefill?.agentUserId ?? me?._id ?? "";
      setAgentUserId(defaultAgent);
      setNegotiatorName(me?.fullName || me?.name || "");
      setSellerName("");
      setClientSig(null);
      setNegotiatorSig(null);
      setSellerSig(null);
      initedFor.current = key;
    }
  }, [open, formId, existing, prefill, me]);

  const buildArgs = () => ({
    viewingDate,
    viewingTime: viewingTime || undefined,
    propertyAddress: propertyAddress.trim(),
    clientName: clientName.trim(),
    clientCompany: clientCompany.trim() || undefined,
    clientIdNumber: clientIdNumber.trim() || undefined,
    clientSpouseName: clientSpouseName.trim() || undefined,
    clientPhone: clientPhone.trim() || undefined,
    clientEmail: clientEmail.trim() || undefined,
    agentUserId: (agentUserId || me?._id) as Id<"users"> | undefined,
    negotiatorName: negotiatorName.trim(),
    clientSignatureId: clientSig?.storageId as Id<"_storage"> | undefined,
    negotiatorSignatureId: negotiatorSig?.storageId as Id<"_storage"> | undefined,
    sellerName: sellerName.trim() || undefined,
    sellerSignatureId: sellerSig?.storageId as Id<"_storage"> | undefined,
  });

  const save = async (complete: boolean) => {
    const validationError = validateViewingForm(
      { clientName, propertyAddress, hasClientSignature: !!clientSig },
      { requireSignature: complete }
    );
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setIsSaving(true);
    try {
      const args = buildArgs();
      let savedId: Id<"viewingForms">;
      if (formId) {
        await updateForm({
          formId,
          ...args,
          status: complete ? "completed" : undefined,
        });
        savedId = formId;
      } else {
        savedId = await createForm({
          ...args,
          propertyId: prefill?.propertyId,
          contactId: prefill?.contactId,
          leadId: prefill?.leadId,
          status: complete ? "completed" : "draft",
        });
      }
      if (complete) viewingToasts.completed(clientName.trim());
      else if (formId) viewingToasts.updated();
      else viewingToasts.created();
      onSaved?.(savedId);
      onClose();
    } catch (err) {
      viewingToasts.saveFailed(err instanceof Error ? err.message : undefined);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      title={formId ? "Viewing Form" : "New Viewing Form"}
      description="Record the client's viewing and capture signatures as proof of introduction."
      onClose={onClose}
      footer={
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={isSaving}>
            {locked ? "Close" : "Cancel"}
          </Button>
          {!locked && (
            <>
              <Button variant="ghost" onClick={() => save(false)} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save draft"}
              </Button>
              <Button onClick={() => save(true)} disabled={isSaving}>
                {isSaving ? "Saving..." : "Complete & Lock"}
              </Button>
            </>
          )}
        </div>
      }
    >
      <div className="space-y-5">
        {locked && (
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700">
            This form is completed and locked for audit. It can no longer be edited.
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Viewing date" required>
            <Input type="date" value={viewingDate} onChange={(e) => setViewingDate(e.target.value)} disabled={locked} />
          </FormField>
          <FormField label="Viewing time">
            <Input type="time" value={viewingTime} onChange={(e) => setViewingTime(e.target.value)} disabled={locked} />
          </FormField>
        </div>

        <FormField label="Property address" required>
          <Input value={propertyAddress} onChange={(e) => setPropertyAddress(e.target.value)} placeholder="e.g. 12 Enterprise Rd, Highlands, Harare" disabled={locked} />
        </FormField>

        <div className="rounded-lg border border-border bg-surface-2/30 p-4">
          <h4 className="mb-3 text-sm font-semibold text-text">Client details</h4>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Client's name" required>
              <Input value={clientName} onChange={(e) => setClientName(e.target.value)} disabled={locked} />
            </FormField>
            <FormField label="Client's company name">
              <Input value={clientCompany} onChange={(e) => setClientCompany(e.target.value)} disabled={locked} />
            </FormField>
            <FormField label="Client's I.D no.">
              <Input value={clientIdNumber} onChange={(e) => setClientIdNumber(e.target.value)} disabled={locked} />
            </FormField>
            <FormField label="Client's spouse's name">
              <Input value={clientSpouseName} onChange={(e) => setClientSpouseName(e.target.value)} disabled={locked} />
            </FormField>
            <FormField label="Client's telephone no.">
              <Input value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} disabled={locked} />
            </FormField>
            <FormField label="Client's email address">
              <Input type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} disabled={locked} />
            </FormField>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Property negotiator (agent)">
            <Select value={agentUserId} onChange={(e) => setAgentUserId(e.target.value)} disabled={locked}>
              <option value="">Select agent…</option>
              {agents?.map((a) => (
                <option key={a._id} value={a._id}>
                  {a.name}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Negotiator name (as signed)">
            <Input value={negotiatorName} onChange={(e) => setNegotiatorName(e.target.value)} disabled={locked} />
          </FormField>
        </div>

        {/* Signatures */}
        <div className="space-y-4 rounded-lg border border-border bg-surface-2/30 p-4">
          <h4 className="text-sm font-semibold text-text">Signatures</h4>
          <SignatureField label="Client signature" value={clientSig} onChange={setClientSig} disabled={locked} required />
          <SignatureField label="Property negotiator signature" value={negotiatorSig} onChange={setNegotiatorSig} disabled={locked} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Seller / caretaker name">
              <Input value={sellerName} onChange={(e) => setSellerName(e.target.value)} disabled={locked} />
            </FormField>
          </div>
          <SignatureField label="Seller / caretaker signature" value={sellerSig} onChange={setSellerSig} disabled={locked} />
        </div>

        {error && <p className="text-sm text-danger">{error}</p>}
      </div>
    </Modal>
  );
}
