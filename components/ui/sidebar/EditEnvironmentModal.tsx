"use client";

import { useState } from "react";
import { Environment } from "@/lib/api/environment/api";

interface Props {
  open: boolean;
  env: Environment;
  loading: boolean;
  onConfirm: (data: { name: string; target_column: string; task_type: string; status: string }) => void;
  onClose: () => void;
}

type TaskType = "classification" | "regression";
type EnvStatus = "pending" | "running" | "completed" | "failed" | "canceled";

const TASK_TYPES: TaskType[] = ["classification", "regression"];
const STATUSES: EnvStatus[] = ["pending", "running", "completed", "failed", "canceled"];

export default function EditEnvironmentModal({ open, env, loading, onConfirm, onClose }: Props) {
  const [name, setName] = useState(env.name);
  const [targetColumn, setTargetColumn] = useState(env.target_column);
  const [taskType, setTaskType] = useState<TaskType>(env.task_type as TaskType);
  const [status, setStatus] = useState<EnvStatus>(env.status as EnvStatus);

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
        <p className="text-sm font-medium text-[var(--foreground)]">Edit environment</p>

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
            <label className="text-xs text-[var(--text-3)]">Target column</label>
            <input
              value={targetColumn}
              onChange={(e) => setTargetColumn(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-[var(--radius-component)] border border-[var(--border)]
                bg-[var(--background)] text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
            />
          </div>
          <div className="flex gap-3">
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-xs text-[var(--text-3)]">Task type</label>
              <select
                value={taskType}
                onChange={(e) => setTaskType(e.target.value as TaskType)}
                className="w-full px-3 py-1.5 text-xs rounded-[var(--radius-component)] border border-[var(--border)]
                  bg-[var(--background)] text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
              >
                {TASK_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-xs text-[var(--text-3)]">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as EnvStatus)}
                className="w-full px-3 py-1.5 text-xs rounded-[var(--radius-component)] border border-[var(--border)]
                  bg-[var(--background)] text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
              >
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
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
            onClick={() => onConfirm({ name, target_column: targetColumn, task_type: taskType, status })}
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