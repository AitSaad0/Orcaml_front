"use client";

import { X } from "lucide-react";

interface InfoField {
  label: string;
  value: string | number | null;
}

interface Props {
  open: boolean;
  title: string;
  fields: InfoField[];
  onClose: () => void;
}

export default function InfoModal({ open, title, fields, onClose }: Props) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-[var(--background)] border border-[var(--border)] rounded-[var(--radius-component)]
          p-5 w-[360px] flex flex-col gap-4 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-[var(--foreground)]">{title}</p>
          <button onClick={onClose} className="text-[var(--text-3)] hover:text-[var(--foreground)] transition-colors">
            <X size={14} />
          </button>
        </div>

        <div className="flex flex-col gap-0 divide-y divide-[var(--border)]">
          {fields.map((f) => (
            <div key={f.label} className="flex items-start justify-between py-2 gap-4">
              <span className="text-xs text-[var(--text-3)] shrink-0">{f.label}</span>
              <span className="text-xs text-[var(--foreground)] text-right break-all font-mono">
                {f.value ?? "—"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}