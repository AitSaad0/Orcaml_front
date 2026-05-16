"use client";

import { useState } from "react";
import { X, Loader2, FolderPlus } from "lucide-react";
import { useAuth } from "@/context/auth/AuthContext";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface CreateProjectModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void; // refetch projects after creation
}

export default function CreateProjectModal({ open, onClose, onCreated }: CreateProjectModalProps) {
  const { token } = useAuth();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  async function handleSubmit() {
    if (!name.trim()) {
      setError("Project name is required.");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE}/projects/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: name.trim(), description: description.trim() }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to create project");
      }
      setName("");
      setDescription("");
      onCreated();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-md mx-4 rounded-[var(--radius-card)] bg-[var(--card)] border border-[var(--border)] shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[var(--radius-component)] bg-[var(--primary)] flex items-center justify-center">
              <FolderPlus size={15} className="text-white" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[var(--foreground)]">New Project</h2>
              <p className="text-xs text-[var(--text-3)]">Set up a new ML project</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-[var(--radius-component)]
              text-[var(--text-3)] hover:text-[var(--foreground)] hover:bg-[var(--bg-3)] transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-4">

          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[var(--text-2)]">
              Project Name <span className="text-[var(--destructive)]">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="e.g. Churn Prediction"
              className="w-full px-3 py-2 rounded-[var(--radius-component)] text-sm
                bg-[var(--input-background)] border border-[var(--border)]
                text-[var(--foreground)] placeholder:text-[var(--text-3)]
                focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent
                transition-all"
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[var(--text-2)]">
              Description <span className="text-[var(--text-3)] font-normal">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this project about?"
              rows={3}
              className="w-full px-3 py-2 rounded-[var(--radius-component)] text-sm resize-none
                bg-[var(--input-background)] border border-[var(--border)]
                text-[var(--foreground)] placeholder:text-[var(--text-3)]
                focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent
                transition-all"
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-xs text-[var(--destructive)] bg-[var(--bg-2)] px-3 py-2 rounded-[var(--radius-component)] border border-[var(--destructive)]/30">
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-[var(--border)]">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-[var(--radius-component)] text-sm font-medium
              text-[var(--text-2)] hover:text-[var(--foreground)] hover:bg-[var(--bg-3)]
              transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !name.trim()}
            className="flex items-center gap-2 px-4 py-2 rounded-[var(--radius-component)] text-sm font-medium
              bg-[var(--primary)] text-[var(--primary-foreground)]
              hover:bg-[var(--accent-3)] transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <FolderPlus size={14} />}
            {loading ? "Creating..." : "Create Project"}
          </button>
        </div>

      </div>
    </div>
  );
}