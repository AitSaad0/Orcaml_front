"use client";

import { useEffect, useState } from "react";
import { statsDataset, DataStatsResponse, ColumnStat } from "@/lib/api/dataset/api";
import { Loader2, AlertCircle } from "lucide-react";

interface Props {
  datasetId: string;
  token: string;
}

export default function DataStats({ datasetId, token }: Props) {
  const [data, setData] = useState<DataStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    statsDataset(token, datasetId)
      .then(setData)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Failed to load stats"))
      .finally(() => setLoading(false));
  }, [datasetId, token]);

  if (loading) return (
    <div className="state-row">
      <Loader2 size={18} className="spin" />
      <span>Computing statistics...</span>
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

  // Calculate missing columns count
  const columnsWithMissing = data.columns.filter(col => col.missing > 0).length;
  const numericCols = data.columns.filter(col => col.mean !== undefined).length;
  const categoricalCols = data.columns.filter(col => col.mean === undefined).length;

  return (
    <div className="stats-root">
      <div className="metrics-row">
        <MetricCard label="Total rows" value={data.total_rows.toLocaleString()} />
        <MetricCard label="Total columns" value={data.total_columns} />
        <MetricCard label="Numeric cols" value={numericCols} />
        <MetricCard label="Categorical cols" value={categoricalCols} />
        <MetricCard label="Duplicate rows" value={data.duplicate_rows} />
        <MetricCard label="Cols with missing" value={columnsWithMissing} />
      </div>

      <section className="card">
        <p className="section-label">Column details</p>
        <div className="tscroll">
          <table>
            <thead>
              <tr>
                <th>Column</th>
                <th>Type</th>
                <th>Missing</th>
                <th>Stats</th>
              </tr>
            </thead>
            <tbody>
              {data.columns.map((col) => {
                const isNum = col.mean !== undefined && col.mean !== null;
                const missingPercent = data.total_rows > 0 ? (col.missing / data.total_rows) * 100 : 0;
                
                return (
                  <tr key={col.column}>
                    <td className="fw">{col.column}</td>
                    <td>
                      <span className={`badge ${isNum ? "b-num" : "b-cat"}`}>{col.dtype}</span>
                    </td>
                    <td>
                      <div className="miss-cell">
                        <div className="miss-track">
                          <div className="miss-fill" style={{ width: `${Math.min(missingPercent, 100)}%` }} />
                        </div>
                        <span className="miss-pct">{missingPercent.toFixed(1)}% ({col.missing})</span>
                      </div>
                    </td>
                    <td className="stats-cell">
                      {isNum ? (
                        <div className="numeric-stats">
                          <span>μ={col.mean?.toFixed(2)}</span>
                          <span>σ={col.std?.toFixed(2)}</span>
                          <span>min={col.min?.toFixed(2)}</span>
                          <span>max={col.max?.toFixed(2)}</span>
                        </div>
                      ) : (
                        <div className="categ-stats">
                          <span>unique={col.unique_count}</span>
                          {col.top_value && <span>top={col.top_value}</span>}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <style jsx>{`
        .stats-root { display: flex; flex-direction: column; gap: 1.25rem; }

        .metrics-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
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
        
        table { width: 100%; border-collapse: collapse; font-size: 13px; }
        
        th {
          text-align: left; padding: 8px 10px;
          font-size: 12px; font-weight: 600; color: #777;
          border-bottom: 1px solid #f0f0f8; white-space: nowrap;
        }
        
        td { 
          padding: 12px 10px; 
          border-bottom: 1px solid #f7f7fc; 
          color: #1a1a2e; 
          vertical-align: middle;
        }
        
        tr:last-child td { border-bottom: none; }
        tr:hover td { background: #fafafe; }
        
        .fw { font-weight: 500; }

        .badge {
          display: inline-block; padding: 2px 8px; border-radius: 4px;
          font-size: 11px; font-weight: 600;
        }
        .b-num { background: #e6f1fb; color: #0c447c; }
        .b-cat { background: #eeedfe; color: #3c3489; }

        .miss-cell { display: flex; align-items: center; gap: 8px; min-width: 120px; }
        .miss-track { flex: 1; min-width: 60px; height: 6px; background: #f0f0f5; border-radius: 3px; overflow: hidden; }
        .miss-fill { height: 100%; background: #ef9f27; border-radius: 3px; }
        .miss-pct { font-size: 12px; color: #999; min-width: 70px; }

        .stats-cell { max-width: 300px; }
        .numeric-stats, .categ-stats { 
          display: flex; 
          gap: 12px; 
          flex-wrap: wrap;
          font-size: 12px;
        }
        .numeric-stats span, .categ-stats span {
          background: #f7f7fc;
          padding: 2px 8px;
          border-radius: 4px;
          color: #555;
          font-family: monospace;
          font-size: 11px;
        }
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
        .mc { background: #f7f7fc; border-radius: 10px; padding: 14px 16px; }
        .mc-label { font-size: 12px; color: #999; margin: 0 0 4px; }
        .mc-value { font-size: 22px; font-weight: 600; color: #1a1a2e; margin: 0; }
      `}</style>
    </div>
  );
}