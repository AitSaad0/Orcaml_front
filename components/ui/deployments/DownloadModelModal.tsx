"use client";

import { useState, useEffect } from "react";
import { X, Download, Loader2 } from "lucide-react";
import { useAuth } from "@/context/auth/AuthContext";
import { listDownloadableRuns, downloadModel, RunForDownload } from "@/lib/api/deployment/api";

interface Props {
  open: boolean;
  environmentId: string;
  onClose: () => void;
}

export default function DownloadModelModal({ open, environmentId, onClose }: Props) {
  const { token } = useAuth();
  const [runs, setRuns] = useState<RunForDownload[]>([]);
  const [selectedRunId, setSelectedRunId] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !token) return;
    setFetching(true);
    setSelectedRunId("");
    setError(null);
    listDownloadableRuns(token, environmentId)
      .then(setRuns)
      .catch(() => setError("Failed to load runs."))
      .finally(() => setFetching(false));
  }, [open, token, environmentId]);

  if (!open) return null;

  async function handleDownload() {
    if (!selectedRunId || !token) return;
    try {
      setLoading(true);
      setError(null);
      await downloadModel(token, environmentId, selectedRunId);
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
              <Download size={15} className="text-white" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[var(--foreground)]">Download Model</h2>
              <p className="text-xs text-[var(--text-3)]">Download a trained model artifact</p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-[var(--radius-component)] text-[var(--text-3)] hover:text-[var(--foreground)] hover:bg-[var(--bg-3)] transition-colors">
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[var(--text-2)]">
              Run <span className="text-[var(--destructive)]">*</span>
            </label>
            {fetching ? (
              <div className="flex items-center gap-2 text-sm text-[var(--text-3)] py-2">
                <Loader2 size={14} className="animate-spin" /> Loading runs...
              </div>
            ) : runs.length === 0 ? (
              <p className="text-xs text-[var(--text-3)] py-2">No completed runs available.</p>
            ) : (
              <select
                value={selectedRunId}
                onChange={(e) => setSelectedRunId(e.target.value)}
                className="w-full px-3 py-2 rounded-[var(--radius-component)] text-sm bg-[var(--input-background)] border border-[var(--border)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
              >
                <option value="">— Choose a run —</option>
                {runs.map((run) => (
                  <option key={run.id} value={run.id}>
                    {run.algorithm} — {run.finished_at ? new Date(run.finished_at).toLocaleDateString() : "—"}
                  </option>
                ))}
              </select>
            )}
          </div>
          {error && (
            <p className="text-xs text-[var(--destructive)] bg-[var(--bg-2)] px-3 py-2 rounded-[var(--radius-component)] border border-[var(--destructive)]/30">
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-[var(--border)]">
          <button onClick={onClose} disabled={loading} className="px-4 py-2 rounded-[var(--radius-component)] text-sm font-medium text-[var(--text-2)] hover:text-[var(--foreground)] hover:bg-[var(--bg-3)] transition-colors disabled:opacity-50">
            Cancel
          </button>
          <button
            onClick={handleDownload}
            disabled={loading || !selectedRunId || runs.length === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-[var(--radius-component)] text-sm font-medium bg-[var(--primary)] text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            {loading ? "Downloading..." : "Download"}
          </button>
        </div>
      </div>
    </div>
  );
}