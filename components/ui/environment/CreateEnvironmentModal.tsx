"use client";

import { useState } from "react";
import { X, Loader2, Box } from "lucide-react";
import { useAuth } from "@/context/auth/AuthContext";
import { emitEnvCreated } from "@/lib/events";


const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const TASK_TYPES = ["classification", "regression", "clustering", "detection"];

interface Props {
  open: boolean;
  projectId: string;
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateEnvironmentModal({ open, projectId, onClose, onCreated }: Props) {
  const { token } = useAuth();
  const [name, setName] = useState("");
  const [targetColumn, setTargetColumn] = useState("");
  const [taskType, setTaskType] = useState("classification");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  async function handleSubmit() {
    if (!name.trim()) { setError("Environment name is required."); return; }
    if (!targetColumn.trim()) { setError("Target column is required."); return; }
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE}/environments/${projectId}/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          target_column: targetColumn.trim(),
          task_type: taskType,
          status: "pending",  
        }),
      });
      if (!res.ok) {
       const err = await res.json();
        const detail = err.detail;
        const message =
        typeof detail === "string"
            ? detail
            : Array.isArray(detail)
            ? detail.map((d: any) => d.msg).join(", ")
            : "Failed to  create environment";
        throw new Error(message);
      }
      setName(""); setTargetColumn(""); setTaskType("classification");
      emitEnvCreated(projectId);
      onCreated();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md mx-4 rounded-[var(--radius-card)] bg-[var(--card)] border border-[var(--border)] shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[var(--radius-component)] bg-[var(--teal)] flex items-center justify-center">
              <Box size={15} className="text-white" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[var(--foreground)]">New Environment</h2>
              <p className="text-xs text-[var(--text-3)]">Add an environment to this project</p>
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

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[var(--text-2)]">
              Environment Name <span className="text-[var(--destructive)]">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Production, Staging"
              className="w-full px-3 py-2 rounded-[var(--radius-component)] text-sm
                bg-[var(--input-background)] border border-[var(--border)]
                text-[var(--foreground)] placeholder:text-[var(--text-3)]
                focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[var(--text-2)]">
              Target Column <span className="text-[var(--destructive)]">*</span>
            </label>
            <input
              type="text"
              value={targetColumn}
              onChange={(e) => setTargetColumn(e.target.value)}
              placeholder="e.g. churn_flag, is_fraud"
              className="w-full px-3 py-2 rounded-[var(--radius-component)] text-sm
                bg-[var(--input-background)] border border-[var(--border)]
                text-[var(--foreground)] placeholder:text-[var(--text-3)]
                focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[var(--text-2)]">Task Type</label>
            <select
              value={taskType}
              onChange={(e) => setTaskType(e.target.value)}
              className="w-full px-3 py-2 rounded-[var(--radius-component)] text-sm
                bg-[var(--input-background)] border border-[var(--border)]
                text-[var(--foreground)]
                focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
            >
              {TASK_TYPES.map((t) => (
                <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </select>
          </div>

          {error && (
            <p className="text-xs text-[var(--destructive)] bg-[var(--bg-2)] px-3 py-2
              rounded-[var(--radius-component)] border border-[var(--destructive)]/30">
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
            disabled={loading || !name.trim() || !targetColumn.trim()}
            className="flex items-center gap-2 px-4 py-2 rounded-[var(--radius-component)] text-sm font-medium
              bg-[var(--teal)] text-white hover:opacity-90 transition-opacity
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Box size={14} />}
            {loading ? "Creating..." : "Create Environment"}
          </button>
        </div>

      </div>
    </div>
  );
}