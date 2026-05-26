"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/auth/AuthContext";

import {
  getDatasetSchema,
  saveCleaningConfig,
  getCleaningReview,
  triggerCleaning,
  getCleaningStatus,
  getCleaningReport,
  getCleanedPreview,
  rollbackCleaning,
  DatasetSchemaResponse,
  CleaningConfigCreate,
  ReviewResponse,
  CleaningJobResponse,
  CleaningReportResponse,
  PreviewResponse,
} from "@/lib/api/dataset/cleaning";

import SchemaInspector     from "@/components/sections/cleaning/SchemaInspector";
import ColumnConfigBuilder from "@/components/sections/cleaning/ColumnConfigBuilder";
import ConfigReview        from "@/components/sections/cleaning/ConfigReview";
import CleaningJobMonitor  from "@/components/sections/cleaning/CleaningJobMonitor";
import ResultPanel         from "@/components/sections/cleaning/ResultPanel";

import {
  Database,
  Settings2,
  Eye,
  Zap,
  BarChart2,
  AlertTriangle,
  Loader2,
  ArrowLeft,
  ArrowRight,
  Save,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// STEPPER STEPS DEFINITION
// ─────────────────────────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: "Schema",  sublabel: "Inspect columns",    icon: <Database  size={16} /> },
  { id: 2, label: "Config",  sublabel: "Per-column rules",   icon: <Settings2 size={16} /> },
  { id: 3, label: "Review",  sublabel: "Confirm plan",       icon: <Eye       size={16} /> },
  { id: 4, label: "Run",     sublabel: "Async cleaning job", icon: <Zap       size={16} /> },
  { id: 5, label: "Results", sublabel: "Report & rollback",  icon: <BarChart2 size={16} /> },
];

// ─────────────────────────────────────────────────────────────────────────────
// DEFAULT CLEANING CONFIG (v2.0)
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_CONFIG: CleaningConfigCreate = {
  missing_strategy:  "MEDIAN",
  remove_duplicates: true,
  encoding_method:   "ONE_HOT",
  scaling_method:    "STANDARD",
  version:           "V2",
  column_rules:      [],
};

// ─────────────────────────────────────────────────────────────────────────────
// STEPPER UI
// ─────────────────────────────────────────────────────────────────────────────

function Stepper({
  current,
  completed,
}: {
  current: number;
  completed: Set<number>;
}) {
  return (
    <div className="flex items-center gap-0 overflow-x-auto pb-1">
      {STEPS.map((step, i) => {
        const isActive = step.id === current;
        const isDone   = completed.has(step.id);

        return (
          <div key={step.id} className="flex items-center">
            {/* Step bubble */}
            <div
              className={`flex items-center gap-2.5 px-4 py-2 rounded-lg transition-all ${
                isActive
                  ? "bg-primary text-white"
                  : isDone
                  ? "bg-primary/20 text-primary"
                  : "bg-card text-muted-foreground border border-border"
              }`}
            >
              {/* Number / checkmark circle */}
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  isActive ? "bg-white/20" : isDone ? "bg-primary/20" : "bg-muted"
                }`}
              >
                {isDone && !isActive ? "✓" : step.id}
              </div>

              {/* Label + sublabel */}
              <div className="hidden sm:flex flex-col leading-tight">
                <span className="text-xs font-semibold">{step.label}</span>
                <span
                  className={`text-[10px] ${
                    isActive ? "text-white/70" : "text-muted-foreground"
                  }`}
                >
                  {step.sublabel}
                </span>
              </div>
            </div>

            {/* Connector line between steps */}
            {i < STEPS.length - 1 && (
              <div
                className={`w-6 h-px mx-1 shrink-0 ${
                  isDone ? "bg-primary" : "bg-border"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function CleaningPage() {
  const { token } = useAuth();
  const params    = useParams();
  const envId     = params.environmentId as string;

  // ── Stepper state ──────────────────────────────────────────────────────────
  const [step,      setStep]      = useState<number>(1);
  const [completed, setCompleted] = useState<Set<number>>(new Set<number>());

  function markDone(n: number) {
    setCompleted((prev) => new Set<number>([...prev, n]));
  }

  // ── Phase 1 — Schema ───────────────────────────────────────────────────────
  const [schema,        setSchema]        = useState<DatasetSchemaResponse | null>(null);
  const [schemaLoading, setSchemaLoading] = useState<boolean>(false);
  const [schemaError,   setSchemaError]   = useState<string | null>(null);

  // Fetch schema automatically when the page loads
  const fetchSchema = useCallback(async () => {
    if (!token) return;
    setSchemaLoading(true);
    setSchemaError(null);
    try {
      const result = await getDatasetSchema(token, envId);
      setSchema(result);
      markDone(1);
    } catch (e: any) {
      setSchemaError(e.message);
    } finally {
      setSchemaLoading(false);
    }
  }, [token, envId]);

  useEffect(() => {
    fetchSchema();
  }, [fetchSchema]);

  // ── Phase 2 — Config ───────────────────────────────────────────────────────
  const [config,    setConfig]    = useState<CleaningConfigCreate>(DEFAULT_CONFIG);
  const [saving,    setSaving]    = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Called when user clicks "Save & Review" on step 2
  async function handleSaveConfig() {
    if (!token) return;
    setSaving(true);
    setSaveError(null);
    try {
      await saveCleaningConfig(token, envId, config);
      markDone(2);
      setStep(3);
      // Automatically fetch the review after saving
      fetchReview();
    } catch (e: any) {
      setSaveError(e.message);
    } finally {
      setSaving(false);
    }
  }

  // ── Phase 3 — Review ───────────────────────────────────────────────────────
  const [review,        setReview]        = useState<ReviewResponse | null>(null);
  const [reviewLoading, setReviewLoading] = useState<boolean>(false);
  const [reviewError,   setReviewError]   = useState<string | null>(null);

  async function fetchReview() {
    if (!token) return;
    setReviewLoading(true);
    setReviewError(null);
    try {
      const result = await getCleaningReview(token, envId);
      setReview(result);
      markDone(3);
    } catch (e: any) {
      setReviewError(e.message);
    } finally {
      setReviewLoading(false);
    }
  }

  // ── Phase 4 — Trigger + polling ────────────────────────────────────────────
  const [job,          setJob]          = useState<CleaningJobResponse | null>(null);
  const [triggering,   setTriggering]   = useState<boolean>(false);
  const [triggerError, setTriggerError] = useState<string | null>(null);

  // Ref keeps the interval ID so we can clear it when component unmounts
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Called from CleaningJobMonitor when user clicks "Start Cleaning Job"
  async function handleTrigger() {
    if (!token) return;
    setTriggering(true);
    setTriggerError(null);
    try {
      const result = await triggerCleaning(token, envId);
      setJob(result);
      markDone(4);
      startPolling(result.id);
    } catch (e: any) {
      // FIX 1: error is now shown in the UI instead of silently dropped
      setTriggerError(e.message);
    } finally {
      setTriggering(false);
    }
  }

  // Poll the backend every 3 seconds until the job is done or failed
  function startPolling(jobId: string) {
    if (pollRef.current) clearInterval(pollRef.current);

    pollRef.current = setInterval(async () => {
      if (!token) return;
      const updated = await getCleaningStatus(token, envId, jobId);
      setJob(updated);

      if (updated.status === "ready" || updated.status === "failed") {
        clearInterval(pollRef.current!);

        if (updated.status === "ready") {
          markDone(4);
          setStep(5);
          // Automatically load report and preview when job finishes
          fetchReport(jobId);
          fetchPreview(jobId);
        }
      }
    }, 3000);
  }

  // Clear polling interval when component unmounts
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  // ── Phase 5 — Report ───────────────────────────────────────────────────────
  const [report,        setReport]        = useState<CleaningReportResponse | null>(null);
  const [reportLoading, setReportLoading] = useState<boolean>(false);
  const [reportError,   setReportError]   = useState<string | null>(null);

  async function fetchReport(jobId: string) {
    if (!token) return;
    setReportLoading(true);
    setReportError(null);
    try {
      const result = await getCleaningReport(token, envId, jobId);
      setReport(result);
    } catch (e: any) {
      setReportError(e.message);
    } finally {
      setReportLoading(false);
    }
  }

  // ── Phase 5b — Preview ─────────────────────────────────────────────────────
  const [preview,        setPreview]        = useState<PreviewResponse | null>(null);
  const [previewLoading, setPreviewLoading] = useState<boolean>(false);
  const [previewError,   setPreviewError]   = useState<string | null>(null);

  async function fetchPreview(jobId: string) {
    if (!token) return;
    setPreviewLoading(true);
    setPreviewError(null);
    try {
      const result = await getCleanedPreview(token, envId, jobId, 50);
      setPreview(result);
    } catch (e: any) {
      setPreviewError(e.message);
    } finally {
      setPreviewLoading(false);
    }
  }

  // ── Phase 5c — Rollback ────────────────────────────────────────────────────
  const [rolling,       setRolling]       = useState<boolean>(false);
  const [rollbackError, setRollbackError] = useState<string | null>(null);
  const [rollbackMsg,   setRollbackMsg]   = useState<string | null>(null);

  async function handleRollback() {
    if (!token || !job) return;
    setRolling(true);
    setRollbackError(null);
    try {
      const result = await rollbackCleaning(token, envId, job.id);
      setRollbackMsg(result.message);
      // Reset everything so user can reconfigure from step 2
      setJob(null);
      setReport(null);
      setPreview(null);
      // FIX 2: properly typed Set with explicit generic
      setCompleted(new Set<number>([1, 2]));
      setStep(2);
    } catch (e: any) {
      setRollbackError(e.message);
    } finally {
      setRolling(false);
    }
  }

  // ── Navigation logic ───────────────────────────────────────────────────────

  // Determines if the Next button should be enabled
  function canGoNext(): boolean {
    if (step === 1) return !!schema;              // need schema loaded
    if (step === 2) return true;                  // always can save
    if (step === 3) return !!review;              // need review loaded
    if (step === 4) return job?.status === "ready"; // need job done
    return false;
  }

  // What happens when Next is clicked depends on the current step
  function handleNext() {
    if (step === 2) {
      handleSaveConfig(); // saves config and moves to step 3
      return;
    }
    if (step === 3) {
      setStep(4); // just move to step 4
      return;
    }
    setStep((s) => Math.min(s + 1, 5));
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  // Map each step number to its content component
  const stepContent: Record<number, React.ReactNode> = {
    1: (
      <SchemaInspector
        schema={schema}
        loading={schemaLoading}
        error={schemaError}
      />
    ),
    2: (
      <ColumnConfigBuilder
        schema={schema}
        config={config}
        onChange={setConfig}
      />
    ),
    3: (
      <ConfigReview
        review={review}
        loading={reviewLoading}
        error={reviewError}
      />
    ),
    4: (
      <CleaningJobMonitor
        job={job}
        onTrigger={handleTrigger}
        triggering={triggering}
      />
    ),
    5: (
      <ResultPanel
        report={report}
        reportLoading={reportLoading}
        reportError={reportError}
        preview={preview}
        previewLoading={previewLoading}
        previewError={previewError}
        onRollback={handleRollback}
        rolling={rolling}
        rollbackError={rollbackError}
        rollbackMsg={rollbackMsg}
      />
    ),
  };

  return (
    <div className="flex flex-col gap-6 p-6 max-w-5xl mx-auto">

      {/* ── Page header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold">Data Preprocessing</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Enhanced v2.0 — Per-column rules · Outlier detection · Rollback
          </p>
        </div>
        <span className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-xs font-semibold">
          Pipeline v2.0
        </span>
      </div>

      {/* ── Stepper ── */}
      <Stepper current={step} completed={completed} />

      {/* ── Step card ── */}
      <div className="bg-card border border-border rounded-xl shadow-sm">

        {/* Card header: step title + Back/Next buttons */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              {STEPS[step - 1].icon}
            </div>
            <div>
              <h2 className="font-semibold text-sm">
                Step {step} — {STEPS[step - 1].label}
              </h2>
              <p className="text-xs text-muted-foreground">
                {STEPS[step - 1].sublabel}
              </p>
            </div>
          </div>

          {/* Back + Next buttons */}
          <div className="flex items-center gap-2">

            {/* Back button — hidden on step 1 */}
            {step > 1 && (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all"
              >
                <ArrowLeft size={14} />
                Back
              </button>
            )}

            {/* Next button — hidden on step 5 */}
            {step < 5 && (
              <button
                onClick={handleNext}
                disabled={
                  !canGoNext() ||
                  saving ||
                  schemaLoading ||
                  // On step 4, disable while job is still running
                  (step === 4 && !!job && job.status !== "ready")
                }
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-white text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {/* Button label changes based on context */}
                {saving ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Saving…
                  </>
                ) : step === 2 ? (
                  <>
                    <Save size={14} />
                    Save & Review
                  </>
                ) : step === 4 && job && (job.status === "pending" || job.status === "cleaning") ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Waiting…
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* FIX 3: ChevronRight removed — saveError and triggerError banners */}
        {saveError && (
          <div className="mx-6 mt-4 flex items-center gap-3 px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            <AlertTriangle size={16} />
            {saveError}
          </div>
        )}

        {/* FIX 1: trigger error now displayed */}
        {triggerError && (
          <div className="mx-6 mt-4 flex items-center gap-3 px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            <AlertTriangle size={16} />
            {triggerError}
          </div>
        )}

        {/* Step content */}
        <div className="p-6">
          {stepContent[step]}
        </div>
      </div>
    </div>
  );
}