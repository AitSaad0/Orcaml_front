"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/auth/AuthContext";
import {
  listDatasets,
  saveCleaningConfig,
  triggerCleaning,
  getCleaningStatus,
  CleaningConfigCreate,
  CleanedDatasetResponse,
  MissingStrategy,
  EncodingMethod,
  ScalingMethod,
  CleaningVersion,
} from "@/lib/api/dataset/api";
import { Play, Loader2, CheckCircle, XCircle } from "lucide-react";

const missingOptions: { value: MissingStrategy; label: string }[] = [
  { value: "mean",   label: "Fill with mean" },
  { value: "median", label: "Fill with median" },
  { value: "mode",   label: "Fill with mode" },
  { value: "drop",   label: "Drop rows" },
];

const encodingOptions: { value: EncodingMethod; label: string }[] = [
  { value: "one_hot", label: "One-Hot Encoding" },
  { value: "label",   label: "Label Encoding" },
  { value: "ordinal", label: "Ordinal Encoding" },
];

const scalingOptions: { value: ScalingMethod; label: string }[] = [
  { value: "standard", label: "Standard Scaler" },
  { value: "minmax",   label: "Min-Max Scaler" },
  { value: "robust",   label: "Robust Scaler" },
  { value: "none",     label: "No Scaling" },
];

export default function CleaningPage() {
  const { token } = useAuth();
  const params = useParams();
  const envId = params.environmentId as string;

  const [hasDataset, setHasDataset] = useState(false);
  const [config, setConfig] = useState<CleaningConfigCreate>({
    missing_strategy:  "median",
    remove_duplicates: true,
    encoding_method:   "one_hot",
    scaling_method:    "standard",
    version:           "V1",
  });

  const [saving,   setSaving]   = useState(false);
  const [running,  setRunning]  = useState(false);
  const [job,      setJob]      = useState<CleanedDatasetResponse | null>(null);
  const [error,    setError]    = useState<string | null>(null);

  // Check if env has a dataset
  useEffect(() => {
    if (!token) return;
    listDatasets(token, envId)
      .then((ds) => setHasDataset(ds.length > 0))
      .catch(() => setHasDataset(false));
  }, [token, envId]);

  // Poll status when job is running
  useEffect(() => {
    if (!job || job.status === "DONE" || job.status === "FAILED") return;
    const interval = setInterval(async () => {
      if (!token) return;
      const updated = await getCleaningStatus(token, envId, job.id);
      setJob(updated);
      if (updated.status === "DONE" || updated.status === "FAILED") {
        clearInterval(interval);
        setRunning(false);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [job, token, envId]);

  async function handleRunCleaning() {
    if (!token) return;
    setError(null);
    try {
      setSaving(true);
      await saveCleaningConfig(token, envId, config);
      setSaving(false);
      setRunning(true);
      const result = await triggerCleaning(token, envId);
      setJob(result);
    } catch (err: any) {
      setError(err.message);
      setSaving(false);
      setRunning(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Data Preprocessing</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure data cleaning and transformation
          </p>
        </div>
        <button
          onClick={handleRunCleaning}
          disabled={saving || running || !hasDataset}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving || running ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <Play size={15} />
          )}
          {saving ? "Saving..." : running ? "Running..." : "Run Cleaning"}
        </button>
      </div>

      {!hasDataset && (
        <div className="text-sm text-amber-500 bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-3">
          ⚠️ No dataset uploaded yet. Please upload a dataset first.
        </div>
      )}

      {error && (
        <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {/* Job status */}
      {job && (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border text-sm font-medium ${
          job.status === "DONE"    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" :
          job.status === "FAILED"  ? "bg-destructive/10 border-destructive/20 text-destructive" :
          "bg-primary/10 border-primary/20 text-primary"
        }`}>
          {job.status === "DONE"   && <CheckCircle size={16} />}
          {job.status === "FAILED" && <XCircle size={16} />}
          {(job.status === "PENDING" || job.status === "RUNNING") && <Loader2 size={16} className="animate-spin" />}
          Cleaning job: <span className="font-bold">{job.status}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Missing Value Handling */}
        <div className="bg-card text-card-foreground border border-border rounded-lg shadow-md p-6 flex flex-col gap-5">
          <h2 className="text-base font-semibold">Missing Value Handling</h2>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Strategy
            </label>
            <select
              value={config.missing_strategy}
              onChange={(e) => setConfig({ ...config, missing_strategy: e.target.value as MissingStrategy })}
              className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
            >
              {missingOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between py-2 border-t border-border">
            <div>
              <p className="text-sm font-medium">Remove Duplicates</p>
              <p className="text-xs text-muted-foreground">Drop duplicate rows from dataset</p>
            </div>
            <button
              onClick={() => setConfig({ ...config, remove_duplicates: !config.remove_duplicates })}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                config.remove_duplicates ? "bg-primary" : "bg-border"
              }`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                config.remove_duplicates ? "translate-x-5" : "translate-x-0"
              }`} />
            </button>
          </div>
        </div>

        {/* Encoding */}
        <div className="bg-card text-card-foreground border border-border rounded-lg shadow-md p-6 flex flex-col gap-5">
          <h2 className="text-base font-semibold">Encoding</h2>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Categorical Encoding
            </label>
            <select
              value={config.encoding_method}
              onChange={(e) => setConfig({ ...config, encoding_method: e.target.value as EncodingMethod })}
              className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
            >
              {encodingOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Scaling Method
            </label>
            <select
              value={config.scaling_method}
              onChange={(e) => setConfig({ ...config, scaling_method: e.target.value as ScalingMethod })}
              className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
            >
              {scalingOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Version */}
      <div className="bg-card text-card-foreground border border-border rounded-lg shadow-md p-6">
        <h2 className="text-base font-semibold mb-4">Pipeline Version</h2>
        <div className="flex gap-3">
          {(["V1", "V2"] as CleaningVersion[]).map((v) => (
            <button
              key={v}
              onClick={() => setConfig({ ...config, version: v })}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium border transition-all ${
                config.version === v
                  ? "bg-primary text-white border-primary"
                  : "bg-background border-border text-muted-foreground hover:border-primary/50"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}