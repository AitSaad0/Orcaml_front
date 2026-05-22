"use client";

import { useState, useEffect, useRef } from "react";
import { X, FileText, Loader2, RefreshCw } from "lucide-react";
import { useAuth } from "@/context/auth/AuthContext";
import { getLogs } from "@/lib/api/deployment/api";

interface Props {
  open: boolean;
  environmentId: string;
  deploymentId: string;
  algorithm: string;
  onClose: () => void;
}

export default function LogsModal({ open, environmentId, deploymentId, algorithm, onClose }: Props) {
  const { token } = useAuth();
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tail, setTail] = useState(100);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function fetchLogs(tailCount = tail) {
    if (!token) return;
    try {
      setLoading(true);
      setError(null);
      const res = await getLogs(token, environmentId, deploymentId, tailCount);
      setLogs(res.logs);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!open) return;
    fetchLogs();
  }, [open]);

  // auto scroll to bottom when logs load
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  if (!open) return null;

  function handleTailChange(val: number) {
    setTail(val);
    fetchLogs(val);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-3xl mx-4 rounded-[var(--radius-card)] bg-[var(--card)] border border-[var(--border)] shadow-2xl flex flex-col max-h-[80vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[var(--radius-component)] bg-yellow-500/20 flex items-center justify-center">
              <FileText size={15} className="text-yellow-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[var(--foreground)]">Deployment Logs</h2>
              <p className="text-xs text-[var(--text-3)]">{algorithm}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tail selector */}
            <div className="flex items-center gap-1 text-xs text-[var(--text-3)]">
              <span>Last</span>
              {[50, 100, 200, 500].map((n) => (
                <button
                  key={n}
                  onClick={() => handleTailChange(n)}
                  className={`px-2 py-1 rounded-[var(--radius-component)] transition-colors
                    ${tail === n
                      ? "bg-[var(--primary)] text-white"
                      : "hover:bg-[var(--bg-3)] text-[var(--text-3)]"
                    }`}
                >
                  {n}
                </button>
              ))}
              <span>lines</span>
            </div>

            <button
              onClick={() => fetchLogs()}
              disabled={loading}
              className="w-7 h-7 flex items-center justify-center rounded-[var(--radius-component)]
                text-[var(--text-3)] hover:text-[var(--foreground)] hover:bg-[var(--bg-3)] transition-colors
                disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            </button>

            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-[var(--radius-component)]
                text-[var(--text-3)] hover:text-[var(--foreground)] hover:bg-[var(--bg-3)] transition-colors"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Terminal */}
        <div className="flex-1 overflow-y-auto bg-black rounded-b-[var(--radius-card)] p-4 font-mono text-xs">
          {loading && logs.length === 0 ? (
            <div className="flex items-center gap-2 text-green-400">
              <Loader2 size={13} className="animate-spin" />
              <span>Loading logs...</span>
            </div>
          ) : error ? (
            <p className="text-red-400">{error}</p>
          ) : logs.length === 0 ? (
            <p className="text-green-600">No logs available.</p>
          ) : (
            logs.map((line, i) => (
              <div key={i} className="flex gap-3 hover:bg-white/5 px-1 rounded leading-5">
                <span className="text-green-900 select-none w-8 text-right shrink-0">{i + 1}</span>
                <span className={`
                  ${line.toLowerCase().includes("error") ? "text-red-400" : ""}
                  ${line.toLowerCase().includes("warn") ? "text-yellow-400" : ""}
                  ${line.toLowerCase().includes("info") ? "text-green-400" : ""}
                  ${!line.toLowerCase().includes("error") &&
                    !line.toLowerCase().includes("warn") &&
                    !line.toLowerCase().includes("info")
                      ? "text-green-300"
                      : ""}
                `}>
                  {line}
                </span>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

      </div>
    </div>
  );
}