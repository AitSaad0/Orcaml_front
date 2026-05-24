"use client";

import { useEffect, useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { previewDataset, DataPreviewResponse } from "@/lib/api/dataset/api";

interface Props {
  datasetId: string;
  token: string;
}

export default function DataPreview({ datasetId, token }: Props) {
  const [data, setData]       = useState<DataPreviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    // uses your existing: previewDataset(token, datasetId)
    previewDataset(token, datasetId)
      .then(setData)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Failed to load preview"))
      .finally(() => setLoading(false));
  }, [datasetId, token]);

  if (loading) return (
    <div className="state-row">
      <Loader2 size={18} className="spin" />
      <span>Loading preview...</span>
      <style jsx>{`
        .state-row { display:flex;align-items:center;gap:10px;padding:2rem 0;font-size:14px;color:#999; }
        .spin { animation:spin 0.7s linear infinite; }
        @keyframes spin { to { transform:rotate(360deg); } }
      `}</style>
    </div>
  );

  if (error) return (
    <div className="err-box">
      <AlertCircle size={15} />{error}
      <style jsx>{`.err-box{display:flex;align-items:center;gap:8px;padding:12px 14px;background:#fff0f0;border:1px solid #f09595;border-radius:8px;font-size:13px;color:#a32d2d;}`}</style>
    </div>
  );

  if (!data) return null;

  // your DataPreviewResponse shape:
  // columns: { name, type }[]
  // rows: Record<string, any>[]
  // total_rows, total_columns
  // missing_per_column: Record<string, number>

  const missingCols = data.columns?.filter(c => (c as any).missing_count > 0).length ?? 0;

  return (
    <div className="preview-root">

      <div className="metrics-row">
        <MetricCard label="Total rows"            value={data.total_rows.toLocaleString()} />
        <MetricCard label="Total columns"         value={data.total_columns} />
        <MetricCard label="Cols with missing"     value={missingCols} />
      </div>

      <section className="card">
        <p className="section-label">Column overview</p>
        <div className="tscroll">
          <table>
            <thead>
              <tr>
                <th>Column</th>
                <th>Type</th>
                <th>Missing count</th>
                <th>Missing %</th>
              </tr>
            </thead>
            <tbody>
              {data.columns.map((col) => {
                const colAny  = col as any;
                const dtype   = colAny.dtype ?? colAny.type ?? "";
                const isNum   = /int|float/.test(dtype);
                const missing = colAny.missing_count ?? (data as any).missing_per_column?.[col.name] ?? 0;
                const missPct = colAny.missing_percent ?? (data.total_rows > 0 ? (missing / data.total_rows) * 100 : 0);
                return (
                  <tr key={col.name}>
                    <td className="fw">{col.name}</td>
                    <td>
                      <span className={`badge ${isNum ? "b-num" : "b-cat"}`}>{dtype}</span>
                    </td>
                    <td>{missing}</td>
                    <td>
                      <div className="miss-cell">
                        <div className="miss-track">
                          <div className="miss-fill" style={{ width: `${Math.min(missPct, 100)}%` }} />
                        </div>
                        <span className="miss-pct">{missPct.toFixed(1)}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {((data as any).head ?? data.rows ?? []).length > 0 && (
        <section className="card">
          <p className="section-label">First {((data as any).head ?? data.rows).length} rows</p>
          <div className="tscroll">
            <table style={{ tableLayout: "fixed" }}>
              <thead>
                <tr>
                  {data.columns.map((c) => (
                    <th key={c.name} style={{ maxWidth: 140 }}>{c.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {((data as any).head ?? data.rows).map((row: Record<string, unknown>, i: number) => (
                  <tr key={i}>
                    {data.columns.map((c) => (
                      <td key={c.name} className="cell-trunc">
                        {row[c.name] === "" || row[c.name] == null
                          ? <span className="null-val">—</span>
                          : String(row[c.name])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <style jsx>{`
        .preview-root { display:flex; flex-direction:column; gap:1.25rem; }

        .metrics-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(130px,1fr));
          gap: 10px;
        }

        .card {
          background: #fff;
          border: 1px solid #ededf5;
          border-radius: 12px;
          padding: 1.25rem;
        }
        .section-label {
          font-size: 12px; font-weight: 600; color: #999;
          text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 12px;
        }

        .tscroll { overflow-x: auto; }
        table { width:100%; border-collapse:collapse; font-size:13px; }
        th {
          text-align:left; padding:8px 10px;
          font-size:12px; font-weight:600; color:#777;
          border-bottom:1px solid #f0f0f8; white-space:nowrap;
        }
        td { padding:8px 10px; border-bottom:1px solid #f7f7fc; color:#1a1a2e; }
        tr:last-child td { border-bottom:none; }
        tr:hover td { background:#fafafe; }
        .fw { font-weight:500; }

        .badge {
          display:inline-block; padding:2px 8px; border-radius:4px;
          font-size:11px; font-weight:600;
        }
        .b-num { background:#e6f1fb; color:#0c447c; }
        .b-cat { background:#eeedfe; color:#3c3489; }

        .miss-cell  { display:flex; align-items:center; gap:8px; }
        .miss-track { flex:1; min-width:60px; height:6px; background:#f0f0f5; border-radius:3px; overflow:hidden; }
        .miss-fill  { height:100%; background:#ef9f27; border-radius:3px; }
        .miss-pct   { font-size:12px; color:#999; min-width:36px; }

        .cell-trunc { max-width:140px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .null-val   { color:#ccc; font-style:italic; }
      `}</style>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="mc">
      <p className="mc-label">{label}</p>
      <p className="mc-value">{value}</p>
      <style jsx>{`
        .mc       { background:#f7f7fc; border-radius:10px; padding:14px 16px; }
        .mc-label { font-size:12px; color:#999; margin:0 0 4px; }
        .mc-value { font-size:22px; font-weight:600; color:#1a1a2e; margin:0; }
      `}</style>
    </div>
  );
}