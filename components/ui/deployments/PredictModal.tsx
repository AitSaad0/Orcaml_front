"use client";

import { useState } from "react";
import { X, Activity, Loader2, Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/context/auth/AuthContext";
import { predict, PredictResult } from "@/lib/api/deployment/api";

interface Props {
  open: boolean;
  environmentId: string;
  deploymentId: string;
  algorithm: string;
  onClose: () => void;
}

interface FeatureRow {
  key: string;
  value: string;
}

export default function PredictModal({ open, environmentId, deploymentId, algorithm, onClose }: Props) {
  const { token } = useAuth();
  const [features, setFeatures] = useState<FeatureRow[]>([{ key: "", value: "" }]);
  const [result, setResult] = useState<PredictResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  function addRow() {
    setFeatures((prev) => [...prev, { key: "", value: "" }]);
  }

  function removeRow(index: number) {
    setFeatures((prev) => prev.filter((_, i) => i !== index));
  }

  function updateRow(index: number, field: "key" | "value", val: string) {
    setFeatures((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: val } : row))
    );
  }

  function buildFeatures(): Record<string, any> {
    return Object.fromEntries(
      features
        .filter((f) => f.key.trim() !== "")
        .map((f) => {
          const num = Number(f.value);
          return [f.key.trim(), isNaN(num) ? f.value : num];
        })
    );
  }

  async function handlePredict() {
    if (!token) return;
    const featureMap = buildFeatures();
    if (Object.keys(featureMap).length === 0) {
      setError("Add at least one feature.");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      setResult(null);
      const res = await predict(token, environmentId, deploymentId, featureMap);
      setResult(res);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setFeatures([{ key: "", value: "" }]);
    setResult(null);
    setError(null);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className="w-full max-w-lg mx-4 rounded-[var(--radius-card)] bg-[var(--card)] border border-[var(--border)] shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[var(--radius-component)] bg-green-500/20 flex items-center justify-center">
              <Activity size={15} className="text-green-500" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[var(--foreground)]">Predict</h2>
              <p className="text-xs text-[var(--text-3)]">{algorithm}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-7 h-7 flex items-center justify-center rounded-[var(--radius-component)]
              text-[var(--text-3)] hover:text-[var(--foreground)] hover:bg-[var(--bg-3)] transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-4 max-h-[60vh] overflow-y-auto">

          {/* Feature rows */}
          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-[1fr_1fr_auto] gap-2 text-xs font-medium text-[var(--text-3)] px-1">
              <span>Feature name</span>
              <span>Value</span>
              <span />
            </div>

            {features.map((row, i) => (
              <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
                <input
                  type="text"
                  placeholder="e.g. age"
                  value={row.key}
                  onChange={(e) => updateRow(i, "key", e.target.value)}
                  className="px-3 py-2 rounded-[var(--radius-component)] text-sm
                    bg-[var(--input-background)] border border-[var(--border)]
                    text-[var(--foreground)] placeholder:text-[var(--text-3)]
                    focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
                />
                <input
                  type="text"
                  placeholder="e.g. 29"
                  value={row.value}
                  onChange={(e) => updateRow(i, "value", e.target.value)}
                  className="px-3 py-2 rounded-[var(--radius-component)] text-sm
                    bg-[var(--input-background)] border border-[var(--border)]
                    text-[var(--foreground)] placeholder:text-[var(--text-3)]
                    focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
                />
                <button
                  onClick={() => removeRow(i)}
                  disabled={features.length === 1}
                  className="w-8 h-8 flex items-center justify-center rounded-[var(--radius-component)]
                    text-[var(--text-3)] hover:text-red-400 hover:bg-red-500/10
                    transition-colors disabled:opacity-30"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}

            <button
              onClick={addRow}
              className="flex items-center gap-2 px-3 py-2 text-xs text-[var(--text-3)]
                hover:text-[var(--primary)] transition-colors w-fit"
            >
              <Plus size={13} />
              Add feature
            </button>
          </div>

          {/* Result */}
          {result && (
            <div className="flex flex-col gap-2 p-4 rounded-[var(--radius-component)]
              bg-green-500/5 border border-green-500/20">
              <p className="text-xs font-medium text-green-500">Prediction Result</p>
              <div className="flex flex-col gap-1">
                {result.prediction_label && (
                  <p className="text-lg font-bold text-[var(--foreground)]">
                    {result.prediction_label}
                  </p>
                )}
                <p className="text-xs text-[var(--text-3)]">
                  Raw: {JSON.stringify(result.prediction)}
                </p>
                <p className="text-xs text-[var(--text-3)]">
                  Algorithm: {result.algorithm}
                </p>
              </div>
            </div>
          )}

          {/* Error */}
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
            onClick={handleClose}
            className="px-4 py-2 rounded-[var(--radius-component)] text-sm font-medium
              text-[var(--text-2)] hover:text-[var(--foreground)] hover:bg-[var(--bg-3)] transition-colors"
          >
            Close
          </button>
          <button
            onClick={handlePredict}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-[var(--radius-component)] text-sm font-medium
              bg-green-600 text-white hover:opacity-90 transition-opacity
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Activity size={14} />}
            {loading ? "Predicting..." : "Run Predict"}
          </button>
        </div>

      </div>
    </div>
  );
}