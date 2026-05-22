"use client";

import { useState, useEffect } from "react";
import { X, Rocket, Loader2 } from "lucide-react";
import { useAuth } from "@/context/auth/AuthContext";
import { deployModel } from "@/lib/api/deployment/api";
import { getRuns, RunResponse } from "@/lib/api/runs/api";

interface Props {
  open: boolean;
  environmentId: string;
  onClose: () => void;
  onDeployed: () => void;
}

export default function DeployModelModal({ open, environmentId, onClose, onDeployed }: Props) {
  const { token } = useAuth();
  const [runs, setRuns] = useState<RunResponse[]>([]);
  const [selectedRunId, setSelectedRunId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [fetchingRuns, setFetchingRuns] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !token) return;
    setFetchingRuns(true);
    setSelectedRunId("");
    setError(null);
    getRuns(environmentId, token)
      .then((data) => setRuns(data.filter((r) => r.status === "COMPLETED")))
      .catch(() => setError("Failed to load runs."))
      .finally(() => setFetchingRuns(false));
  }, [open, token, environmentId]);

  if (!open) return null;

  async function handleDeploy() {
    if (!selectedRunId || !token) return;
    try {
      setLoading(true);
      setError(null);
      await deployModel(token, environmentId, selectedRunId);
      onDeployed();
      onClose();
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
            <div className="w-8 h-8 rounded-[var(--radius-component)] bg-[var(--primary)] flex items-center justify-center">
              <Rocket size={15} className="text-white" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[var(--foreground)]">Deploy Model</h2>
              <p className="text-xs text-[var(--text-3)]">Select a completed run to deploy</p>
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
              Run <span className="text-[var(--destructive)]">*</span>
            </label>

            {fetchingRuns ? (
              <div className="flex items-center gap-2 text-sm text-[var(--text-3)] py-2">
                <Loader2 size={14} className="animate-spin" />
                Loading runs...
              </div>
            ) : runs.length === 0 ? (
              <p className="text-xs text-[var(--text-3)] py-2">
                No completed runs available. Train a model first.
              </p>
            ) : (
              <select
                value={selectedRunId}
                onChange={(e) => setSelectedRunId(e.target.value)}
                className="w-full px-3 py-2 rounded-[var(--radius-component)] text-sm
                  bg-[var(--input-background)] border border-[var(--border)]
                  text-[var(--foreground)]
                  focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
              >
                <option value="">— Choose a run —</option>
                {runs.map((run) => (
                  <option key={run.id} value={run.id}>
                    {run.algorithm}
                    {run.accuracy != null ? ` — accuracy: ${(run.accuracy * 100).toFixed(1)}%` : ""}
                    {" — "}{new Date(run.created_at).toLocaleDateString()}
                  </option>
                ))}
              </select>
            )}
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
            onClick={handleDeploy}
            disabled={loading || !selectedRunId || runs.length === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-[var(--radius-component)] text-sm font-medium
              bg-[var(--primary)] text-white hover:opacity-90 transition-opacity
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Rocket size={14} />}
            {loading ? "Deploying..." : "Deploy"}
          </button>
        </div>

      </div>
    </div>
  );
}