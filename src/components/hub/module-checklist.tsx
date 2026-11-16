"use client";

import { MODULES, MODULE_ORDER, type ModuleKey } from "@/config/modules";

/** Tick the modules an agency uses. Shared by Agency settings and the Platform screen. */
export function ModuleChecklist({ value, onChange }: { value: ModuleKey[]; onChange: (next: ModuleKey[]) => void }) {
  return (
    <div className="space-y-2">
      {MODULE_ORDER.map((k) => (
        <label
          key={k}
          className="flex cursor-pointer items-center gap-3 rounded-lg border border-border px-3 py-2 text-sm"
        >
          <input
            type="checkbox"
            checked={value.includes(k)}
            onChange={() => onChange(value.includes(k) ? value.filter((m) => m !== k) : [...value, k])}
            className="h-4 w-4 rounded border-border"
          />
          <span className="font-medium">{MODULES[k].name}</span>
          <span className="text-xs text-text-muted">{MODULES[k].tagline}</span>
        </label>
      ))}
    </div>
  );
}
