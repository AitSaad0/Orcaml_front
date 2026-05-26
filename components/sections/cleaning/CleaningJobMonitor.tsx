"use client";

import { CleaningJobResponse, CleaningStatus } from "@/lib/api/dataset/cleaning";
import { Loader2, CheckCircle2, XCircle, Clock, Zap } from "lucide-react";

interface Props {
  job: CleaningJobResponse | null;
  onTrigger: () => void;
  triggering: boolean;
}

type StatusConfig = {
  icon: React.ReactNode;
  label: string;
  sublabel: string;
  bar: string;
  card: string;
};

const STATUS_CONFIG: Record<CleaningStatus, StatusConfig> = {
  pending: {
    icon: <Clock size={32} className="text-primary" />,
    label: "Job Queued",
    sublabel: "Waiting for a Celery worker to pick up the task…",
    bar: "bg-primary w-1/4",
    card: "border-primary/20 bg-primary/5",
  },
  cleaning: {
    icon: <Loader2 size={32} className="animate-spin text-violet-400" />,
    label: "Cleaning in Progress",
    sublabel: "The worker is applying per-column rules to your dataset…",
    bar: "bg-violet-400 w-3/4 animate-pulse",
    card: "border-violet-500/20 bg-violet-500/5",
  },
  ready: {
    icon: <CheckCircle2 size={32} className="text-emerald-400" />,
    label: "Cleaning Complete",
    sublabel: "Your cleaned dataset is ready. Check the report below.",
    bar: "bg-emerald-400 w-full",
    card: "border-emerald-500/20 bg-emerald-500/5",
  },
  failed: {
    icon: <XCircle size={32} className="text-destructive" />,
    label: "Job Failed",
    sublabel: "An error occurred. Roll back and try again.",
    bar: "bg-destructive w-full",
    card: "border-destructive/20 bg-destructive/5",
  },
  rolled_back: {
    icon: <XCircle size={32} className="text-muted-foreground" />,
    label: "Rolled Back",
    sublabel: "This cleaning run was discarded. Update the config and re-trigger.",
    bar: "bg-border w-full",
    card: "border-border bg-muted/10",
  },
};

export default function CleaningJobMonitor({ job, onTrigger, triggering }: Props) {
  // No job yet → show trigger CTA
  if (!job) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-16">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Zap size={28} className="text-primary" />
        </div>
        <div className="text-center">
          <h3 className="text-base font-semibold">Ready to Clean</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            Your config is saved and reviewed. Trigger the async Celery job to start
            cleaning your dataset.
          </p>
        </div>
        <button
          onClick={onTrigger}
          disabled={triggering}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium text-sm transition-all disabled:opacity-50"
        >
          {triggering ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <Zap size={15} />
          )}
          {triggering ? "Starting…" : "Start Cleaning Job"}
        </button>
      </div>
    );
  }

  const cfg = STATUS_CONFIG[job.status];

  return (
    <div className="flex flex-col gap-5">
      {/* Status card */}
      <div className={`rounded-lg border p-6 flex flex-col items-center gap-4 ${cfg.card}`}>
        {cfg.icon}
        <div className="text-center">
          <h3 className="font-semibold text-base">{cfg.label}</h3>
          <p className="text-sm text-muted-foreground mt-1">{cfg.sublabel}</p>
        </div>

        {/* Progress bar */}
        <div className="w-full max-w-sm h-2 bg-border rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-500 ${cfg.bar}`} />
        </div>

        {/* Row stats */}
        {job.rows_before != null && (
          <div className="flex gap-6 text-sm">
            <div className="text-center">
              <p className="text-muted-foreground text-xs">Rows Before</p>
              <p className="font-bold">{job.rows_before.toLocaleString()}</p>
            </div>
            <div className="w-px bg-border" />
            <div className="text-center">
              <p className="text-muted-foreground text-xs">Rows After</p>
              <p className={`font-bold ${job.rows_after! < job.rows_before ? "text-amber-400" : "text-emerald-400"}`}>
                {job.rows_after?.toLocaleString()}
              </p>
            </div>
            {job.rows_before > 0 && job.rows_after != null && (
              <>
                <div className="w-px bg-border" />
                <div className="text-center">
                  <p className="text-muted-foreground text-xs">Rows Removed</p>
                  <p className="font-bold text-rose-400">
                    {(job.rows_before - job.rows_after).toLocaleString()}
                  </p>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Polling note */}
      {(job.status === "pending" || job.status === "cleaning") && (
        <p className="text-center text-xs text-muted-foreground">
          Polling every 3 seconds…
        </p>
      )}
    </div>
  );
}