"use client";

import { useState } from "react";
import {
  CleaningReportResponse,
  PreviewResponse,
  ColumnReport,
} from "@/lib/api/dataset/cleaning";
import {
  BarChart2,
  Table2,
  RotateCcw,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  TrendingDown,
  Layers,
  Tag,
  Ruler,
} from "lucide-react";

// ── Report tab ─────────────────────────────────────────────────────────────

function ReportTab({ report }: { report: CleaningReportResponse }) {
  const cols = Object.entries(report.columns);

  return (
    <div className="flex flex-col gap-5">
      {/* Top-level numbers */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Rows Before",       value: report.rows_before.toLocaleString(),        color: "" },
          { label: "Rows After",        value: report.rows_after.toLocaleString(),          color: "text-emerald-400" },
          { label: "Removed",           value: (report.rows_before - report.rows_after).toLocaleString(), color: "text-rose-400" },
          { label: "Duplicates Removed",value: report.duplicates_removed.toLocaleString(),  color: "text-amber-400" },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-lg px-4 py-3">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className={`text-xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Per-column table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center gap-2 text-sm font-semibold">
          <BarChart2 size={15} className="text-primary" />
          Per-Column Stats
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {["Column", "Action", "Nulls Before", "Nulls After", "Outliers", "Scaling", "Encoding", "New Columns"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide whitespace-nowrap"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {cols.map(([name, col], i) => (
                <tr
                  key={name}
                  className={`border-b border-border/50 hover:bg-muted/20 transition-colors ${
                    i % 2 === 0 ? "" : "bg-muted/10"
                  }`}
                >
                  <td className="px-4 py-3 font-mono font-medium">{name}</td>
                  <td className="px-4 py-3">
                    <ActionBadge action={col.action} />
                  </td>
                  <Num v={col.nulls_before} />
                  <Num v={col.nulls_after} highlight />
                  <Num v={col.outliers_removed} warn />
                  <td className="px-4 py-3">
                    <CodeChip v={col.scaling} />
                  </td>
                  <td className="px-4 py-3">
                    <CodeChip v={col.encoding} />
                  </td>
                  <td className="px-4 py-3">
                    {col.new_columns?.length ? (
                      <div className="flex flex-wrap gap-1">
                        {col.new_columns.map((c) => (
                          <span key={c} className="px-1.5 py-0.5 bg-violet-500/10 text-violet-400 rounded text-xs font-mono">
                            {c}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Num({ v, highlight, warn }: { v?: number; highlight?: boolean; warn?: boolean }) {
  return (
    <td className="px-4 py-3">
      {v != null ? (
        <span className={warn && v > 0 ? "text-rose-400 font-medium" : highlight && v === 0 ? "text-emerald-400" : ""}>
          {v.toLocaleString()}
        </span>
      ) : (
        <span className="text-muted-foreground">—</span>
      )}
    </td>
  );
}

function CodeChip({ v }: { v?: string }) {
  if (!v) return <span className="text-muted-foreground">—</span>;
  return (
    <span className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono text-muted-foreground">
      {v}
    </span>
  );
}

function ActionBadge({ action }: { action: string }) {
  const styles: Record<string, string> = {
    clean:  "bg-emerald-500/10 text-emerald-400",
    drop:   "bg-rose-500/10 text-rose-400",
    keep:   "bg-sky-500/10 text-sky-400",
    target: "bg-amber-500/10 text-amber-400",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${styles[action] ?? "bg-muted text-muted-foreground"}`}>
      {action}
    </span>
  );
}

// ── Preview tab ────────────────────────────────────────────────────────────

function PreviewTab({
  preview,
  loading,
  error,
}: {
  preview: PreviewResponse | null;
  loading: boolean;
  error: string | null;
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground text-sm">
        <Loader2 size={18} className="animate-spin text-primary" />
        Loading preview…
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
        <AlertTriangle size={16} />
        {error}
      </div>
    );
  }
  if (!preview) return null;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-muted-foreground">
        Showing first {preview.rows.length} of {preview.total_rows.toLocaleString()} rows
      </p>
      <div className="bg-card border border-border rounded-lg overflow-auto max-h-[480px]">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-card z-10">
            <tr className="border-b border-border bg-muted/40">
              {preview.columns.map((c) => (
                <th
                  key={c}
                  className="px-3 py-2.5 text-left font-medium text-muted-foreground uppercase tracking-wide whitespace-nowrap"
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {preview.rows.map((row, i) => (
              <tr key={i} className={`border-b border-border/40 hover:bg-muted/20 ${i % 2 === 0 ? "" : "bg-muted/10"}`}>
                {preview.columns.map((c) => (
                  <td key={c} className="px-3 py-2 font-mono whitespace-nowrap">
                    {String(row[c] ?? "—")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Rollback tab ───────────────────────────────────────────────────────────

function RollbackTab({
  rolledBack,
  onRollback,
  rolling,
  rollbackError,
  rollbackMsg,
}: {
  rolledBack: boolean;
  onRollback: () => void;
  rolling: boolean;
  rollbackError: string | null;
  rollbackMsg: string | null;
}) {
  const [confirmed, setConfirmed] = useState(false);

  if (rolledBack || rollbackMsg) {
    return (
      <div className="flex flex-col items-center gap-4 py-16">
        <CheckCircle2 size={40} className="text-emerald-400" />
        <div className="text-center">
          <h3 className="font-semibold">Run Discarded</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            {rollbackMsg ?? "Your raw dataset is untouched. Update the config and re-trigger to start fresh."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm">
        <AlertTriangle size={16} className="mt-0.5 shrink-0" />
        <span>
          Rollback will discard this cleaning run and mark it as rejected.
          Your <strong>raw dataset is never touched</strong>. You can then update
          the config and re-trigger a fresh job.
        </span>
      </div>

      <div className="bg-card border border-border rounded-lg p-5 flex flex-col gap-4">
        <h3 className="font-semibold text-sm">What rollback does</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          {[
            ["✓", "Sets status to rolled_back",             "text-foreground"],
            ["✓", "Prevents further preview/report access", "text-foreground"],
            ["✓", "Records rolled_back_at timestamp",       "text-foreground"],
            ["✗", "Does NOT delete the cleaned CSV",        "text-muted-foreground"],
            ["✗", "Does NOT delete the raw CSV",            "text-muted-foreground"],
            ["✗", "Does NOT delete the CleaningConfig",     "text-muted-foreground"],
          ].map(([icon, text, cls], i) => (
            <li key={i} className={`flex items-center gap-2 ${cls}`}>
              <span className={icon === "✓" ? "text-emerald-400" : "text-rose-400"}>
                {icon}
              </span>
              {text}
            </li>
          ))}
        </ul>
      </div>

      {rollbackError && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          <AlertTriangle size={16} />
          {rollbackError}
        </div>
      )}

      <label className="flex items-center gap-3 text-sm cursor-pointer">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
          className="w-4 h-4 rounded accent-primary"
        />
        I understand this will discard the current cleaning result
      </label>

      <button
        onClick={onRollback}
        disabled={!confirmed || rolling}
        className="flex items-center justify-center gap-2 px-5 py-2.5 bg-destructive hover:bg-destructive/90 text-white rounded-lg font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed w-full"
      >
        {rolling ? (
          <Loader2 size={15} className="animate-spin" />
        ) : (
          <RotateCcw size={15} />
        )}
        {rolling ? "Rolling back…" : "Rollback This Run"}
      </button>
    </div>
  );
}

// ── Main export ────────────────────────────────────────────────────────────

interface Props {
  report: CleaningReportResponse | null;
  reportLoading: boolean;
  reportError: string | null;
  preview: PreviewResponse | null;
  previewLoading: boolean;
  previewError: string | null;
  onRollback: () => void;
  rolling: boolean;
  rollbackError: string | null;
  rollbackMsg: string | null;
}

type ActiveTab = "report" | "preview" | "rollback";

export default function ResultPanel(props: Props) {
  const [tab, setTab] = useState<ActiveTab>("report");

  const tabs: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: "report",   label: "Report",   icon: <BarChart2  size={14} /> },
    { id: "preview",  label: "Preview",  icon: <Table2     size={14} /> },
    { id: "rollback", label: "Rollback", icon: <RotateCcw  size={14} /> },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Tab bar */}
      <div className="flex gap-1 bg-muted/30 p-1 rounded-lg w-fit">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              tab === t.id
                ? "bg-card shadow text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "report" && props.report && <ReportTab report={props.report} />}
      {tab === "report" && props.reportLoading && (
        <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground text-sm">
          <Loader2 size={18} className="animate-spin text-primary" /> Loading report…
        </div>
      )}
      {tab === "report" && props.reportError && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          <AlertTriangle size={16} /> {props.reportError}
        </div>
      )}

      {tab === "preview" && (
        <PreviewTab
          preview={props.preview}
          loading={props.previewLoading}
          error={props.previewError}
        />
      )}

      {tab === "rollback" && (
        <RollbackTab
          rolledBack={props.report?.rolled_back ?? false}
          onRollback={props.onRollback}
          rolling={props.rolling}
          rollbackError={props.rollbackError}
          rollbackMsg={props.rollbackMsg}
        />
      )}
    </div>
  );
}