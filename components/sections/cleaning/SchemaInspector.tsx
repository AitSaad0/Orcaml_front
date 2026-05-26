"use client";

import { ColumnSchema, DatasetSchemaResponse } from "@/lib/api/dataset/cleaning";
import { Database, Hash, Type, Calendar, Tag, Loader2, AlertTriangle } from "lucide-react";

interface Props {
  schema: DatasetSchemaResponse | null;
  loading: boolean;
  error: string | null;
}

const dtypeIcon = {
  numeric: <Hash size={12} />,
  categorical: <Tag size={12} />,
  text: <Type size={12} />,
  datetime: <Calendar size={12} />,
};

const dtypeColor = {
  numeric:     "bg-blue-500/10 text-blue-400 border-blue-500/20",
  categorical: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  text:        "bg-amber-500/10 text-amber-400 border-amber-500/20",
  datetime:    "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

const actionColor = {
  clean:  "bg-emerald-500/10 text-emerald-400",
  keep:   "bg-sky-500/10 text-sky-400",
  drop:   "bg-rose-500/10 text-rose-400",
  target: "bg-amber-500/10 text-amber-400",
};

export default function SchemaInspector({ schema, loading, error }: Props) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-muted-foreground">
        <Loader2 size={28} className="animate-spin text-primary" />
        <p className="text-sm">Inferring column types…</p>
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

  if (!schema) return null;

  return (
    <div className="flex flex-col gap-5">
      {/* Summary row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Rows",    value: schema.total_rows.toLocaleString() },
          { label: "Total Columns", value: schema.total_columns },
          { label: "With Nulls",    value: schema.columns.filter((c) => c.null_count > 0).length },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-card border border-border rounded-lg px-4 py-3 flex flex-col gap-1"
          >
            <span className="text-xs text-muted-foreground">{s.label}</span>
            <span className="text-xl font-bold">{s.value}</span>
          </div>
        ))}
      </div>

      {/* Column table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center gap-2 text-sm font-semibold">
          <Database size={15} className="text-primary" />
          Column Inspector
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {["Column", "Type", "Nulls", "Unique", "Sample Values", "Suggested"].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {schema.columns.map((col, i) => (
                <tr
                  key={col.name}
                  className={`border-b border-border/50 transition-colors hover:bg-muted/20 ${
                    i % 2 === 0 ? "" : "bg-muted/10"
                  }`}
                >
                  {/* Name */}
                  <td className="px-4 py-3 font-mono font-medium">{col.name}</td>

                  {/* Dtype badge */}
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium ${
                        dtypeColor[col.dtype]
                      }`}
                    >
                      {dtypeIcon[col.dtype]}
                      {col.dtype}
                    </span>
                  </td>

                  {/* Nulls */}
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <span className={col.null_count > 0 ? "text-amber-400" : "text-muted-foreground"}>
                        {col.null_count}
                      </span>
                      {col.null_count > 0 && (
                        <div className="w-20 h-1.5 bg-border rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-400 rounded-full"
                            style={{ width: `${Math.min(col.null_pct * 100, 100)}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Unique */}
                  <td className="px-4 py-3 text-muted-foreground">{col.unique_count}</td>

                  {/* Sample values */}
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {col.sample_values.slice(0, 3).map((v, j) => (
                        <span
                          key={j}
                          className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono text-muted-foreground"
                        >
                          {String(v)}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Suggested action */}
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                        actionColor[col.suggested_action]
                      }`}
                    >
                      {col.suggested_action}
                    </span>
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