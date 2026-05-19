"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth/AuthContext";
import {
  getRuns,
  getBestManualRun,
  getBestAutoRun,
  createBatchRuns,
  createAutoRuns,
  cancelRun,
  RunResponse,
  Algorithm,
} from "@/lib/api/runs/api";
import {
  Play,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Clock,
  Ban,
  ChevronDown,
  ChevronUp,
  Trophy,
  XCircle,
  Zap,
  Sliders,
  TriangleAlert,
} from "lucide-react";

const ALGORITHMS: Algorithm[] = [
  "LOGISTIC_REGRESSION",
  "RANDOM_FOREST",
  "XGBOOST",
  "SVM",
  "DECISION_TREE",
  "KNN",
  "LINEAR_REGRESSION",
];

const ALGO_LABELS: Record<Algorithm, string> = {
  LOGISTIC_REGRESSION: "Logistic Regression",
  RANDOM_FOREST:       "Random Forest",
  XGBOOST:             "XGBoost",
  SVM:                 "SVM",
  DECISION_TREE:       "Decision Tree",
  KNN:                 "KNN",
  LINEAR_REGRESSION:   "Linear Regression",
};

const REGRESSION_ONLY: Algorithm[] = ["LINEAR_REGRESSION"];

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  PENDING:   { label: "Pending",   color: "#b45309", bg: "#fef3c7", icon: <Clock size={12} /> },
  RUNNING:   { label: "Running",   color: "#1d4ed8", bg: "#dbeafe", icon: <Loader2 size={12} className="animate-spin" /> },
  COMPLETED: { label: "Completed", color: "#15803d", bg: "#dcfce7", icon: <CheckCircle2 size={12} /> },
  FAILED:    { label: "Failed",    color: "#b91c1c", bg: "#fee2e2", icon: <AlertCircle size={12} /> },
  CANCELLED: { label: "Cancelled", color: "#6b7280", bg: "#f3f4f6", icon: <Ban size={12} /> },
};

const DEFAULT_HYPERPARAMS: Record<Algorithm, Record<string, unknown>> = {
  LOGISTIC_REGRESSION: { C: 1.0,  max_iter: 100 },
  RANDOM_FOREST:       { n_estimators: 100, max_depth: 10 },
  XGBOOST:             { n_estimators: 100, max_depth: 6, learning_rate: 0.1, subsample: 1.0 },
  SVM:                 { C: 1.0,  kernel: "rbf" },
  DECISION_TREE:       { max_depth: 10 },
  KNN:                 { n_neighbors: 5 },
  LINEAR_REGRESSION:   { fit_intercept: true },
};

const MAX_MANUAL_ATTEMPTS = 5;
const MAX_ALGOS_PER_BATCH = 6;

interface Props { environmentId: string; }

type FeedbackType = "success" | "error" | "warning";
interface Feedback { type: FeedbackType; title: string; message: string; }

const fmt = (v: number | null | undefined, d = 4) => v != null ? v.toFixed(d) : "—";

function FeedbackBanner({ feedback, onClose }: { feedback: Feedback; onClose: () => void }) {
  const styles = {
    success: { bg: "bg-[#f0fdf4]", border: "border-[#bbf7d0]", color: "text-[#15803d]", icon: <CheckCircle2 size={17} className="text-[#15803d] shrink-0 mt-0.5" /> },
    error:   { bg: "bg-[#fef2f2]", border: "border-[#fecaca]", color: "text-[#dc2626]", icon: <AlertCircle  size={17} className="text-[#dc2626] shrink-0 mt-0.5" /> },
    warning: { bg: "bg-[#fffbeb]", border: "border-[#fde68a]", color: "text-[#92400e]", icon: <TriangleAlert size={17} className="text-[#d97706] shrink-0 mt-0.5" /> },
  }[feedback.type];

  return (
    <div className={`flex items-start gap-3 p-4 rounded-[var(--radius-card)] border ${styles.bg} ${styles.border}`}>
      {styles.icon}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${styles.color}`}>{feedback.title}</p>
        <p className={`text-xs mt-0.5 leading-relaxed ${styles.color} opacity-75`}>{feedback.message}</p>
      </div>
      <button onClick={onClose} className="opacity-40 hover:opacity-80 transition-opacity shrink-0">
        <XCircle size={16} />
      </button>
    </div>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`relative w-11 h-6 rounded-full transition-colors ${value ? "bg-[var(--primary)]" : "bg-[var(--bg-3)]"}`}
    >
      <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${value ? "translate-x-6" : "translate-x-1"}`} />
    </button>
  );
}

function BestRunCard({ title, run, loading, isRegression }: {
  title: string; run: RunResponse | null; loading: boolean; isRegression: boolean;
}) {
  if (loading) return (
    <div className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--card)] p-5 flex items-center justify-center min-h-[180px]">
      <Loader2 size={18} className="animate-spin text-[var(--text-3)]" />
    </div>
  );
  if (!run) return (
    <div className="rounded-[var(--radius-card)] border border-dashed border-[var(--border-2)] bg-[var(--bg-2)] p-5 flex flex-col items-center justify-center gap-2 min-h-[180px]">
      <Trophy size={20} className="text-[var(--text-3)]" />
      <p className="text-sm font-medium text-[var(--text-3)]">{title}</p>
      <p className="text-xs text-[var(--text-3)] opacity-60">No completed run yet</p>
    </div>
  );
  return (
    <div className="rounded-[var(--radius-card)] border border-[#bbf7d0] bg-[#f0fdf4] p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy size={15} className="text-[#15803d]" />
          <span className="text-xs font-semibold text-[#15803d] uppercase tracking-wide">{title}</span>
        </div>
        <CheckCircle2 size={16} className="text-[#15803d]" />
      </div>
      <p className="text-base font-bold text-black">{ALGO_LABELS[run.algorithm]}</p>
      <div className="flex flex-col gap-1.5">
        {!isRegression ? (
          <>
            {run.f1_score  != null && <div className="flex justify-between text-sm"><span className="text-[var(--text-3)]">F1 Score</span>  <span className="font-bold text-[#15803d]">{fmt(run.f1_score)}</span></div>}
            {run.accuracy  != null && <div className="flex justify-between text-sm"><span className="text-[var(--text-3)]">Accuracy</span>  <span className="font-medium">{fmt(run.accuracy)}</span></div>}
            {run.precision != null && <div className="flex justify-between text-sm"><span className="text-[var(--text-3)]">Precision</span> <span className="font-medium">{fmt(run.precision)}</span></div>}
            {run.recall    != null && <div className="flex justify-between text-sm"><span className="text-[var(--text-3)]">Recall</span>    <span className="font-medium">{fmt(run.recall)}</span></div>}
          </>
        ) : (
          <>
            {run.r2   != null && <div className="flex justify-between text-sm"><span className="text-[var(--text-3)]">R² Score</span> <span className="font-bold text-[#15803d]">{fmt(run.r2)}</span></div>}
            {run.rmse != null && <div className="flex justify-between text-sm"><span className="text-[var(--text-3)]">RMSE</span>     <span className="font-medium">{fmt(run.rmse)}</span></div>}
            {run.mae  != null && <div className="flex justify-between text-sm"><span className="text-[var(--text-3)]">MAE</span>      <span className="font-medium">{fmt(run.mae)}</span></div>}
          </>
        )}
        {run.duration_seconds != null && (
          <div className="flex justify-between text-xs text-[var(--text-3)]">
            <span>Duration</span><span>{run.duration_seconds.toFixed(1)}s</span>
          </div>
        )}
      </div>
    </div>
  );
}

function HyperparamForm({ algo, values, onChange }: {
  algo: Algorithm;
  values: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
}) {
  const inputClass = "w-full mt-1 px-3 py-1.5 bg-[var(--bg-2)] border border-[var(--border)] rounded-[var(--radius-component)] text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]";
  return (
    <div className="p-4 bg-[var(--card)] rounded-[var(--radius-component)] border border-[var(--border)] flex flex-col gap-3">
      <span className="text-xs font-bold text-[var(--primary)]">{ALGO_LABELS[algo]}</span>
      {algo === "LOGISTIC_REGRESSION" && (<>
        <label className="text-[11px] text-[var(--text-2)]">C — Regularization (0.01 – 100.0)<input type="number" step="0.01" min="0.01" max="100.0" value={values.C as number} onChange={(e) => onChange("C", parseFloat(e.target.value))} className={inputClass}/></label>
        <label className="text-[11px] text-[var(--text-2)]">Max Iterations (100 – 5000)<input type="number" min="100" max="5000" value={values.max_iter as number} onChange={(e) => onChange("max_iter", parseInt(e.target.value))} className={inputClass}/></label>
      </>)}
      {algo === "RANDOM_FOREST" && (<>
        <label className="text-[11px] text-[var(--text-2)]">n_estimators (10 – 500)<input type="number" min="10" max="500" value={values.n_estimators as number} onChange={(e) => onChange("n_estimators", parseInt(e.target.value))} className={inputClass}/></label>
        <label className="text-[11px] text-[var(--text-2)]">Max Depth (1 – 50)<input type="number" min="1" max="50" value={values.max_depth as number} onChange={(e) => onChange("max_depth", parseInt(e.target.value))} className={inputClass}/></label>
      </>)}
      {algo === "XGBOOST" && (<>
        <label className="text-[11px] text-[var(--text-2)]">n_estimators (10 – 500)<input type="number" min="10" max="500" value={values.n_estimators as number} onChange={(e) => onChange("n_estimators", parseInt(e.target.value))} className={inputClass}/></label>
        <label className="text-[11px] text-[var(--text-2)]">Max Depth (1 – 10)<input type="number" min="1" max="10" value={values.max_depth as number} onChange={(e) => onChange("max_depth", parseInt(e.target.value))} className={inputClass}/></label>
        <label className="text-[11px] text-[var(--text-2)]">Learning Rate (0.01 – 0.5)<input type="number" step="0.01" min="0.01" max="0.5" value={values.learning_rate as number} onChange={(e) => onChange("learning_rate", parseFloat(e.target.value))} className={inputClass}/></label>
        <label className="text-[11px] text-[var(--text-2)]">Subsample (0.5 – 1.0)<input type="number" step="0.05" min="0.5" max="1.0" value={values.subsample as number} onChange={(e) => onChange("subsample", parseFloat(e.target.value))} className={inputClass}/></label>
      </>)}
      {algo === "SVM" && (<>
        <label className="text-[11px] text-[var(--text-2)]">C — Regularization (0.01 – 100.0)<input type="number" step="0.01" min="0.01" max="100.0" value={values.C as number} onChange={(e) => onChange("C", parseFloat(e.target.value))} className={inputClass}/></label>
        <label className="text-[11px] text-[var(--text-2)]">Kernel<select value={values.kernel as string} onChange={(e) => onChange("kernel", e.target.value)} className={inputClass}><option value="rbf">rbf</option><option value="linear">linear</option><option value="poly">poly</option></select></label>
      </>)}
      {algo === "DECISION_TREE" && (<label className="text-[11px] text-[var(--text-2)]">Max Depth (1 – 50)<input type="number" min="1" max="50" value={values.max_depth as number} onChange={(e) => onChange("max_depth", parseInt(e.target.value))} className={inputClass}/></label>)}
      {algo === "KNN" && (<label className="text-[11px] text-[var(--text-2)]">n_neighbors (1 – 20)<input type="number" min="1" max="20" value={values.n_neighbors as number} onChange={(e) => onChange("n_neighbors", parseInt(e.target.value))} className={inputClass}/></label>)}
      {algo === "LINEAR_REGRESSION" && (<label className="flex items-center gap-2 text-[11px] text-[var(--text-2)]"><input type="checkbox" checked={values.fit_intercept as boolean} onChange={(e) => onChange("fit_intercept", e.target.checked)} className="accent-[var(--primary)]"/>Fit Intercept</label>)}
    </div>
  );
}

export default function RunsSection({ environmentId }: Props) {
  const { token } = useAuth();

  const [runs,        setRuns]        = useState<RunResponse[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [fetchError,  setFetchError]  = useState<string | null>(null);
  const [expandedRun, setExpandedRun] = useState<string | null>(null);
  const [submitting,  setSubmitting]  = useState(false);
  const [feedback,    setFeedback]    = useState<Feedback | null>(null);

  const [bestManual,        setBestManual]        = useState<RunResponse | null>(null);
  const [bestAuto,          setBestAuto]          = useState<RunResponse | null>(null);
  const [bestManualLoading, setBestManualLoading] = useState(true);
  const [bestAutoLoading,   setBestAutoLoading]   = useState(true);

  const [selectedAlgos,   setSelectedAlgos]   = useState<Algorithm[]>([]);
  const [autoSearch,      setAutoSearch]       = useState(false);
  const [crossValidation, setCrossValidation]  = useState(false);
  const [cvFolds,         setCvFolds]          = useState(5);
  const [testSize,        setTestSize]         = useState(0.2);
  const [nIter,           setNIter]            = useState(10);
  const [algoHyperparams, setAlgoHyperparams]  = useState<Record<Algorithm, Record<string, unknown>>>(
    { ...DEFAULT_HYPERPARAMS } as Record<Algorithm, Record<string, unknown>>
  );

  const completedRuns = runs.filter((r) => r.status === "COMPLETED");

  const regressionCount = completedRuns.filter((r) => r.r2 != null || r.rmse != null).length;
  const classifCount    = completedRuns.filter((r) => r.f1_score != null || r.accuracy != null).length;

  const isRegression = completedRuns.length > 0
    ? regressionCount > classifCount
    : (bestManual?.r2 != null || bestAuto?.r2 != null);

  const fetchRuns = () => {
    if (!token) return;
    getRuns(environmentId, token)
      .then(setRuns)
      .catch(() => setFetchError("Unable to load runs. Check your connection."))
      .finally(() => setLoading(false));
  };

  const fetchBestRuns = () => {
    if (!token) return;
    setBestManualLoading(true);
    getBestManualRun(environmentId, token).then(setBestManual).catch(() => setBestManual(null)).finally(() => setBestManualLoading(false));
    setBestAutoLoading(true);
    getBestAutoRun(environmentId, token).then(setBestAuto).catch(() => setBestAuto(null)).finally(() => setBestAutoLoading(false));
  };

  useEffect(() => {
    fetchRuns(); fetchBestRuns();
    const interval = setInterval(fetchRuns, 5000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, environmentId]);

  const getManualCount = (algo: Algorithm) =>
    runs.filter((r) => r.algorithm === algo && r.is_manual && ["PENDING", "RUNNING", "COMPLETED"].includes(r.status)).length;

  const toggleAlgo = (algo: Algorithm) => {
    const isSelected     = selectedAlgos.includes(algo);
    const isIncompatible = !isRegression && REGRESSION_ONLY.includes(algo);
    if (isIncompatible) return;
    if (!autoSearch && getManualCount(algo) >= MAX_MANUAL_ATTEMPTS && !isSelected) return;
    if (selectedAlgos.length >= MAX_ALGOS_PER_BATCH && !isSelected) return;
    setSelectedAlgos((prev) => isSelected ? prev.filter((a) => a !== algo) : [...prev, algo]);
  };

  const updateHyperparam = (algo: Algorithm, key: string, value: unknown) => {
    setAlgoHyperparams((prev) => ({ ...prev, [algo]: { ...prev[algo], [key]: value } }));
  };

  const handleStart = async () => {
    if (!token || selectedAlgos.length === 0) return;
    setSubmitting(true);
    setFeedback(null);
    try {
      if (autoSearch) {
        const res = await createAutoRuns(environmentId, {
          algorithms: selectedAlgos, n_iter: nIter,
          cross_validation: crossValidation, cv_folds: crossValidation ? cvFolds : 5,
          test_size: testSize, random_state: 42,
        }, token);
        const isPartial = res.message.includes("⚠️");
        setFeedback({ type: isPartial ? "warning" : "success", title: isPartial ? "Partial success" : "Training started", message: res.message });
      } else {
        const hyperparameters: Record<string, Record<string, unknown>> = {};
        selectedAlgos.forEach((algo) => { hyperparameters[algo] = algoHyperparams[algo]; });
        const res = await createBatchRuns(environmentId, {
          algorithms: selectedAlgos, hyperparameters,
          cross_validation: crossValidation, cv_folds: crossValidation ? cvFolds : 5,
          test_size: testSize, random_state: 42,
        }, token);
        const isPartial = res.message.includes("⚠️");
        setFeedback({ type: isPartial ? "warning" : "success", title: isPartial ? "Partial success" : "Training started", message: res.message });
      }
      setSelectedAlgos([]);
      fetchRuns(); fetchBestRuns();
    } catch (e: unknown) {
      const raw = e instanceof Error ? e.message : "An unexpected error occurred.";
      const errorMap: { key: string; title: string; message: string }[] = [
        { key: "Limite de",         title: "Attempt limit reached",       message: raw },
        { key: "non supporté",      title: "Incompatible algorithm",      message: raw },
        { key: "Aucun run créé",    title: "No runs created",             message: raw },
        { key: "service de calcul", title: "Compute service unavailable", message: "Celery worker is not responding. Make sure Docker is running." },
        { key: "CleanedDataset",    title: "No dataset available",        message: "No cleaned dataset found. Please clean your data first." },
        { key: "Colonne cible",     title: "Target column missing",       message: raw },
        { key: "Hyperparamètre",    title: "Invalid hyperparameter",      message: raw },
      ];
      const matched = errorMap.find(({ key }) => raw.includes(key));
      setFeedback({ type: "error", title: matched?.title ?? "Training failed", message: matched?.message ?? raw });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (runId: string) => {
    if (!token) return;
    try { await cancelRun(environmentId, runId, token); fetchRuns(); }
    catch { setFeedback({ type: "error", title: "Cancel failed", message: "Unable to cancel this run. It may have already completed." }); }
  };

  return (
    <div className="flex flex-col gap-6">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            Runs <span className="ml-1 text-sm font-normal text-[var(--text-3)]">{isRegression ? "Regression" : "Classification"}</span>
          </h1>
          <p className="text-sm text-[var(--text-3)] mt-1">
            Max {MAX_ALGOS_PER_BATCH} algorithms — {MAX_MANUAL_ATTEMPTS} manual attempts per algo
          </p>
        </div>
        <button
          onClick={handleStart}
          disabled={submitting || selectedAlgos.length === 0}
          className="flex items-center gap-2 px-5 py-2.5 rounded-[var(--radius-component)] text-sm font-semibold
            bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--accent-3)] transition-colors disabled:opacity-50"
        >
          {submitting ? <Loader2 size={14} className="animate-spin" /> : autoSearch ? <Zap size={14} /> : <Play size={14} />}
          {autoSearch ? "Auto Search" : "Start Training"}
        </button>
      </div>

      {feedback && <FeedbackBanner feedback={feedback} onClose={() => setFeedback(null)} />}

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-4">
        <div className="rounded-[var(--radius-card)] bg-[var(--card)] border border-[var(--border)] p-6 flex flex-col gap-5">

          <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
            <div>
              <p className="text-sm font-semibold text-[var(--foreground)]">{autoSearch ? "Auto Random Search" : "Manual Batch Run"}</p>
              <p className="text-xs text-[var(--text-3)] mt-0.5">{autoSearch ? "Randomly samples HP combinations from HP_BOUNDS" : "Fine-tune hyperparameters manually per algorithm"}</p>
            </div>
            <Toggle value={autoSearch} onChange={(v) => { setAutoSearch(v); setSelectedAlgos([]); }} />
          </div>

          <div>
            <p className="text-xs font-semibold text-[var(--text-3)] uppercase tracking-wide mb-3">
              Algorithms — {selectedAlgos.length}/{MAX_ALGOS_PER_BATCH} selected
            </p>
            <div className="flex flex-wrap gap-2">
              {ALGORITHMS.map((algo) => {
                const manualCount    = getManualCount(algo);
                const isSelected     = selectedAlgos.includes(algo);
                const isIncompatible = !isRegression && REGRESSION_ONLY.includes(algo);
                const isLimitReached = !autoSearch && manualCount >= MAX_MANUAL_ATTEMPTS && !isSelected;
                const isMaxReached   = selectedAlgos.length >= MAX_ALGOS_PER_BATCH && !isSelected;
                const isDisabled     = isLimitReached || isMaxReached || isIncompatible;
                return (
                  <button key={algo} onClick={() => toggleAlgo(algo)} disabled={isDisabled}
                    title={isIncompatible ? "Regression only — not compatible with classification" : undefined}
                    className={`px-3 py-2 rounded-[var(--radius-component)] text-xs font-medium border transition-all flex items-center gap-1.5 ${
                      isSelected    ? "bg-[var(--primary)] text-[var(--primary-foreground)] border-[var(--primary)]"
                      : isIncompatible ? "opacity-30 cursor-not-allowed bg-[var(--bg-2)] text-[var(--text-3)] border-dashed border-[var(--border)]"
                      : isDisabled  ? "opacity-40 cursor-not-allowed bg-[var(--bg-2)] text-[var(--text-3)] border-[var(--border)]"
                      : "bg-transparent text-[var(--text-2)] border-[var(--border)] hover:border-[var(--primary)] hover:text-[var(--foreground)]"
                    }`}>
                    {ALGO_LABELS[algo]}
                    {!autoSearch && !isIncompatible && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                        isSelected ? "bg-white/20 text-white" : manualCount >= 4 ? "bg-orange-100 text-orange-600" : "bg-[var(--bg-3)] text-[var(--text-3)]"
                      }`}>{manualCount}/{MAX_MANUAL_ATTEMPTS}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {!autoSearch && selectedAlgos.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[var(--foreground)] mb-3">
                <Sliders size={13} className="text-[var(--primary)]" />Hyperparameters
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
                {selectedAlgos.map((algo) => (
                  <HyperparamForm key={algo} algo={algo} values={algoHyperparams[algo]} onChange={(k, v) => updateHyperparam(algo, k, v)} />
                ))}
              </div>
            </div>
          )}

          {autoSearch && (
            <div>
              <div className="flex justify-between mb-2">
                <p className="text-xs font-semibold text-[var(--text-3)] uppercase tracking-wide">Iterations per algorithm</p>
                <span className="text-xs font-bold text-[var(--foreground)]">{nIter}</span>
              </div>
              <input type="range" min={5} max={50} step={1} value={nIter} onChange={(e) => setNIter(Number(e.target.value))} className="w-full accent-[var(--primary)]" />
              <div className="flex justify-between text-[10px] text-[var(--text-3)] mt-1"><span>5 (min)</span><span>50 (max)</span></div>
            </div>
          )}

          <div>
            <div className="flex justify-between mb-2">
              <p className="text-xs font-semibold text-[var(--text-3)] uppercase tracking-wide">Test Size</p>
              <span className="text-xs font-bold text-[var(--foreground)]">{(testSize * 100).toFixed(0)}%</span>
            </div>
            <input type="range" min={0.1} max={0.5} step={0.05} value={testSize} onChange={(e) => setTestSize(Number(e.target.value))} className="w-full accent-[var(--primary)]" />
            <div className="flex justify-between text-[10px] text-[var(--text-3)] mt-1"><span>10%</span><span>50%</span></div>
          </div>

          <div className="flex flex-col gap-3 pt-2 border-t border-[var(--border)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--foreground)]">Cross-Validation</p>
                <p className="text-xs text-[var(--text-3)]">K-Fold — folds between 2 and 10</p>
              </div>
              <Toggle value={crossValidation} onChange={setCrossValidation} />
            </div>
            {crossValidation && (
              <div>
                <div className="flex justify-between mb-1">
                  <p className="text-xs text-[var(--text-3)]">Number of folds</p>
                  <span className="text-xs font-bold text-[var(--foreground)]">{cvFolds}</span>
                </div>
                <input type="range" min={2} max={10} step={1} value={cvFolds} onChange={(e) => setCvFolds(Number(e.target.value))} className="w-full accent-[var(--primary)]" />
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <BestRunCard title="Best Manual Run" run={bestManual} loading={bestManualLoading} isRegression={isRegression} />
          <BestRunCard title="Best Auto Run"   run={bestAuto}   loading={bestAutoLoading}   isRegression={isRegression} />
        </div>
      </div>

      <div>
        <h2 className="text-base font-semibold text-[var(--foreground)] mb-3">
          Training History <span className="ml-2 text-xs font-normal text-[var(--text-3)]">{runs.length} run{runs.length !== 1 ? "s" : ""}</span>
        </h2>

        {loading && (
          <div className="flex items-center gap-3 text-[var(--text-3)] py-16 justify-center">
            <Loader2 size={18} className="animate-spin" /><span className="text-sm">Loading history...</span>
          </div>
        )}

        {!loading && fetchError && (
          <div className="flex items-start gap-3 p-4 rounded-[var(--radius-card)] border bg-[#fef2f2] border-[#fecaca]">
            <AlertCircle size={16} className="text-[#dc2626] shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-[#dc2626]">Failed to load runs</p>
              <p className="text-xs text-[#dc2626] opacity-75 mt-0.5">{fetchError}</p>
            </div>
          </div>
        )}

        {!loading && !fetchError && runs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 border border-dashed border-[var(--border-2)] rounded-[var(--radius-card)] bg-[var(--bg-2)]">
            <Play size={22} className="text-[var(--text-3)] mb-2" />
            <p className="text-sm text-[var(--text-3)]">No runs yet — start training above</p>
          </div>
        )}

        {!loading && !fetchError && runs.length > 0 && (
          <div className="flex flex-col gap-2">
            {runs.map((run) => {
              const s          = STATUS_CONFIG[run.status] ?? STATUS_CONFIG.FAILED;
              const isExpanded = expandedRun === run.id;
              const isBest     = bestManual?.id === run.id || bestAuto?.id === run.id;

              return (
                <div key={run.id} className={`rounded-[var(--radius-card)] bg-[var(--card)] border transition-all duration-150 ${isBest ? "border-[#bbf7d0] bg-[#f0fdf4]/30" : "border-[var(--border)] hover:border-[var(--primary)]"}`}>
                  <div className="flex items-center gap-4 p-4 cursor-pointer" onClick={() => setExpandedRun(isExpanded ? null : run.id)}>
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold shrink-0" style={{ color: s.color, background: s.bg }}>
                      {s.icon}{s.label}
                    </div>
                    <span className="text-sm font-medium text-[var(--foreground)] w-40 shrink-0">
                      {ALGO_LABELS[run.algorithm]}
                      {isBest && <Trophy size={11} className="inline ml-1.5 text-[#15803d]" />}
                    </span>
                    <div className="flex gap-4 flex-1 text-xs text-[var(--text-3)]">
                      {!isRegression ? (
                        <>
                          {run.accuracy  != null && <span>Acc <b className="text-[var(--foreground)]">{fmt(run.accuracy, 3)}</b></span>}
                          {run.f1_score  != null && <span>F1 <b className="text-[var(--foreground)]">{fmt(run.f1_score, 3)}</b></span>}
                          {run.precision != null && <span>P <b className="text-[var(--foreground)]">{fmt(run.precision, 3)}</b></span>}
                          {run.recall    != null && <span>R <b className="text-[var(--foreground)]">{fmt(run.recall, 3)}</b></span>}
                        </>
                      ) : (
                        <>
                          {run.r2   != null && <span>R² <b className="text-[var(--foreground)]">{fmt(run.r2, 3)}</b></span>}
                          {run.rmse != null && <span>RMSE <b className="text-[var(--foreground)]">{fmt(run.rmse, 3)}</b></span>}
                        </>
                      )}
                    </div>
                    {run.duration_seconds != null && <span className="text-xs text-[var(--text-3)] shrink-0">{run.duration_seconds.toFixed(1)}s</span>}
                    <span className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 ${run.is_manual ? "bg-[var(--bg-3)] text-[var(--text-3)]" : "bg-[#dbeafe] text-[#1d4ed8]"}`}>
                      {run.is_manual ? "manual" : "auto"}
                    </span>
                    {(run.status === "PENDING" || run.status === "RUNNING") && (
                      <button onClick={(e) => { e.stopPropagation(); handleCancel(run.id); }} className="text-[var(--text-3)] hover:text-red-500 transition-colors shrink-0">
                        <XCircle size={15} />
                      </button>
                    )}
                    <div className="text-[var(--text-3)] shrink-0">{isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</div>
                  </div>

                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-[var(--border)] pt-4 grid grid-cols-2 gap-6 text-xs bg-[var(--bg-2)]/40">
                      <div>
                        <p className="text-[var(--text-3)] mb-2 font-bold tracking-wide uppercase text-[10px]">Metrics</p>
                        <div className="flex flex-col gap-1.5 text-[var(--text-2)]">
                          {!isRegression ? (
                            <>
                              <div className="flex justify-between"><span>Accuracy</span>  <b>{fmt(run.accuracy)}</b></div>
                              <div className="flex justify-between"><span>F1-Score</span>  <b>{fmt(run.f1_score)}</b></div>
                              <div className="flex justify-between"><span>Precision</span> <b>{fmt(run.precision)}</b></div>
                              <div className="flex justify-between"><span>Recall</span>    <b>{fmt(run.recall)}</b></div>
                            </>
                          ) : (
                            <>
                              <div className="flex justify-between"><span>R² Score</span> <b>{fmt(run.r2)}</b></div>
                              <div className="flex justify-between"><span>RMSE</span>      <b>{fmt(run.rmse)}</b></div>
                              <div className="flex justify-between"><span>MAE</span>       <b>{fmt(run.mae)}</b></div>
                            </>
                          )}
                          {run.duration_seconds != null && <div className="flex justify-between"><span>Duration</span><b>{run.duration_seconds.toFixed(2)}s</b></div>}
                        </div>
                      </div>
                      <div>
                        <p className="text-[var(--text-3)] mb-2 font-bold tracking-wide uppercase text-[10px]">Hyperparameters</p>
                        {run.training_config?.hyperparameters ? (
                          <div className="flex flex-col gap-1.5 text-[var(--text-2)] border-l-2 border-[var(--border)] pl-3">
                            <div className="flex justify-between"><span>CV</span>        <b>{run.training_config.cross_validation ? `${run.training_config.cv_folds} folds` : "No"}</b></div>
                            <div className="flex justify-between"><span>Test size</span> <b>{(run.training_config.test_size * 100).toFixed(0)}%</b></div>
                            {Object.entries(run.training_config.hyperparameters).map(([k, v]) => (
                              <div key={k} className="flex justify-between"><span>{k}</span><b>{String(v)}</b></div>
                            ))}
                          </div>
                        ) : <span className="text-[var(--text-3)]">—</span>}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}