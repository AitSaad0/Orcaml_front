"use client";

import { useState } from "react";

interface Props {
  open: boolean;
  project: { id: string; name: string; description: string | null };
  loading: boolean;
  onConfirm: (name: string, description: string) => void;
  onClose: () => void;
}

export default function RenameProjectModal({ open, project, loading, onConfirm, onClose }: Props) {
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description ?? "");

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
        <p className="text-sm font-medium text-[var(--foreground)]">Rename project</p>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-[var(--text-3)]">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-[var(--radius-component)] border border-[var(--border)]
                bg-[var(--background)] text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-[var(--text-3)]">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-3 py-1.5 text-xs rounded-[var(--radius-component)] border border-[var(--border)]
                bg-[var(--background)] text-[var(--foreground)] outline-none focus:border-[var(--primary)] resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs rounded-[var(--radius-component)] border border-[var(--border)]
              text-[var(--foreground)] hover:bg-[var(--sidebar-accent)] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(name, description)}
            disabled={loading || name.trim().length < 2}
            className="px-3 py-1.5 text-xs rounded-[var(--radius-component)] bg-[var(--primary)] text-white
              hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}