"use client";

import { ReviewResponse } from "@/lib/api/dataset/cleaning";
import { Eye, Loader2, AlertTriangle, CheckCheck, Trash2, Lock, Target, Wand2 } from "lucide-react";

interface Props {
  review: ReviewResponse | null;
  loading: boolean;
  error: string | null;
}

const actionIcon = {
  clean:  <Wand2  size={13} className="text-emerald-400" />,
  drop:   <Trash2 size={13} className="text-rose-400" />,
  keep:   <Lock   size={13} className="text-sky-400" />,
  target: <Target size={13} className="text-amber-400" />,
};

const actionColor: Record<string, string> = {
  clean:  "border-l-emerald-500",
  drop:   "border-l-rose-500",
  keep:   "border-l-sky-500",
  target: "border-l-amber-500",
};

const actionBadge: Record<string, string> = {
  clean:  "bg-emerald-500/10 text-emerald-400",
  drop:   "bg-rose-500/10 text-rose-400",
  keep:   "bg-sky-500/10 text-sky-400",
  target: "bg-amber-500/10 text-amber-400",
};

export default function ConfigReview({ review, loading, error }: Props) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-muted-foreground">
        <Loader2 size={28} className="animate-spin text-primary" />
        <p className="text-sm">Loading config review…</p>
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

  if (!review) return null;

  const stats = [
    { label: "To Clean",  value: review.columns_to_clean, color: "text-emerald-400" },
    { label: "To Drop",   value: review.columns_to_drop,  color: "text-rose-400" },
    { label: "To Keep",   value: review.columns_to_keep,  color: "text-sky-400" },
    { label: "Target",    value: review.target_column ? 1 : 0, color: "text-amber-400" },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-lg px-4 py-3 flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">{s.label}</span>
            <span className={`text-2xl font-bold ${s.color}`}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* Flags */}
      <div className="flex flex-wrap gap-2">
        {review.remove_duplicates && (
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium">
            <CheckCheck size={12} />
            Remove duplicates enabled
          </span>
        )}
        {review.target_column && (
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium">
            <Target size={12} />
            Target column: <code className="ml-1 font-mono">{review.target_column}</code>
          </span>
        )}
      </div>

      {/* Column plan */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center gap-2 text-sm font-semibold">
          <Eye size={15} className="text-primary" />
          Cleaning Plan
        </div>
        <div className="divide-y divide-border/50">
          {review.column_summary.map((col) => (
            <div
              key={col.column}
              className={`flex items-start gap-4 px-4 py-3 border-l-2 ${actionColor[col.action] ?? "border-l-border"}`}
            >
              <div className="flex items-center gap-1.5 mt-0.5 min-w-[80px]">
                {actionIcon[col.action as keyof typeof actionIcon]}
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${actionBadge[col.action]}`}>
                  {col.action}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-mono font-medium text-sm">{col.column}</span>
                <p className="text-xs text-muted-foreground mt-0.5 font-mono">{col.details}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Warning */}
      <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs">
        <AlertTriangle size={14} className="mt-0.5 shrink-0" />
        <span>
          Review carefully before proceeding. Once the job starts you cannot modify the config —
          use <strong>Rollback</strong> if the result is unsatisfactory.
        </span>
      </div>
    </div>
  );
}