"use client";

import { useEffect, useState } from "react";
import { X, Loader2, AlertCircle, CheckCircle2, FlaskConical } from "lucide-react";
import { useAuth } from "@/context/auth/AuthContext";
import { getRawDatasetSchema, ColumnSchema } from "@/lib/api/environment/api";
import { predictRun, PredictResponse, Algorithm } from "@/lib/api/runs/api";

const ALGO_LABELS: Record<Algorithm, string> = {
  LOGISTIC_REGRESSION: "Logistic Regression",
  RANDOM_FOREST:       "Random Forest",
  XGBOOST:             "XGBoost",
  SVM:                 "SVM",
  DECISION_TREE:       "Decision Tree",
  KNN:                 "KNN",
  LINEAR_REGRESSION:   "Linear Regression",
};

interface Props {
  open:          boolean;
  onClose:       () => void;
  projectId:     string;
  environmentId: string;
  runId:         string;
  algorithm:     Algorithm;
  targetColumn?: string;
}

export default function PredictModal({
  open, onClose, projectId, environmentId, runId, algorithm, targetColumn
}: Props) {
  const { token } = useAuth();

  const [schema,     setSchema]     = useState<ColumnSchema[]>([]);
  const [values,     setValues]     = useState<Record<string, string>>({});
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState<string | null>(null);
  const [result,     setResult]     = useState<PredictResponse | null>(null);

  useEffect(() => {
    if (!open || !token) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setValues({});

    getRawDatasetSchema(projectId, environmentId, token)
      .then((cols: ColumnSchema[]) => {
        const filtered = cols.filter((c) => c.name !== targetColumn);
        setSchema(filtered);
        const init: Record<string, string> = {};
        filtered.forEach((c) => (init[c.name] = ""));
        setValues(init);
      })
      .catch((e) => setError(e.message ?? "Failed to load dataset columns."))
      .finally(() => setLoading(false));
  }, [open, projectId, environmentId, token, targetColumn]);

  const handleSubmit = async () => {
    if (!token) return;
    setSubmitting(true);
    setError(null);
    setResult(null);
    try {
      const features: Record<string, string | number> = {};

      for (const col of schema) {
        const raw = values[col.name] ?? "";
        if (raw === "") {
          setError(`La valeur de "${col.name}" est requise.`);
          setSubmitting(false);
          return;
        }
        if (col.type === "number") {
          const num = parseFloat(raw);
          if (isNaN(num)) {
            setError(`Valeur invalide pour "${col.name}" — nombre attendu.`);
            setSubmitting(false);
            return;
          }
          features[col.name] = num;
        } else {
          features[col.name] = raw;
        }
      }

      const res = await predictRun(environmentId, runId, { features }, token);
      setResult(res);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Prediction failed.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-card)] w-full max-w-lg max-h-[90vh] flex flex-col shadow-xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <FlaskConical size={17} className="text-[var(--primary)]" />
            <div>
              <p className="text-sm font-semibold text-[var(--foreground)]">Predict</p>
              <p className="text-xs text-[var(--text-3)]">{ALGO_LABELS[algorithm]}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[var(--text-3)] hover:text-[var(--foreground)] transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-4">

          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={20} className="animate-spin text-[var(--text-3)]" />
            </div>
          )}

          {error && (
            <div className="flex items-start gap-3 p-3 rounded-[var(--radius-component)] bg-[#fef2f2] border border-[#fecaca]">
              <AlertCircle size={15} className="text-[#dc2626] shrink-0 mt-0.5" />
              <p className="text-xs text-[#dc2626]">{error}</p>
            </div>
          )}

          {result && (
            <div className="flex flex-col gap-2 p-4 rounded-[var(--radius-component)] bg-[#f0fdf4] border border-[#bbf7d0]">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-[#15803d]" />
                <p className="text-xs font-semibold text-[#15803d] uppercase tracking-wide">Prediction Result</p>
              </div>
              {result.prediction_label != null && (
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-3)]">Label</span>
                  <span className="font-bold text-[var(--foreground)]">{result.prediction_label}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-[var(--text-3)]">Raw prediction</span>
                <span className="font-mono text-xs text-[var(--foreground)]">
                  {JSON.stringify(result.prediction)}
                </span>
              </div>
            </div>
          )}

          {!loading && schema.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {schema.map((col) => (
                <div key={col.name} className="flex flex-col gap-1">
                  <label className="text-[11px] font-medium text-[var(--text-2)] truncate flex items-center gap-1" title={col.name}>
                    {col.name}
                    <span className="text-[9px] text-[var(--text-3)] font-normal">
                      {col.type === "number" ? "num" : "text"}
                    </span>
                  </label>
                  <input
                    type={col.type === "number" ? "number" : "text"}
                    step={col.type === "number" ? "any" : undefined}
                    placeholder={col.sample_values?.[0] ?? (col.type === "number" ? "0" : "ex: male, yes...")}
                    value={values[col.name] ?? ""}
                    onChange={(e) => setValues((prev) => ({ ...prev, [col.name]: e.target.value }))}
                    className="px-3 py-1.5 bg-[var(--bg-2)] border border-[var(--border)] rounded-[var(--radius-component)] text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {!loading && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--border)]">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-[var(--text-2)] hover:text-[var(--foreground)] transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2 rounded-[var(--radius-component)] text-sm font-semibold bg-[var(--primary)] text-white hover:bg-[var(--accent-3)] transition-colors disabled:opacity-50"
            >
              {submitting
                ? <><Loader2 size={13} className="animate-spin" /> Predicting...</>
                : <><FlaskConical size={13} /> Predict</>
              }
            </button>
          </div>
        )}
      </div>
    </div>
  );
}