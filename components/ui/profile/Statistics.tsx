"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/context/auth/AuthContext";
import { Loader2 } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserStats {
  total_projects:    number;
  total_runs:        number;
  total_deployments: number;
}

// ─── Heatmap helpers ──────────────────────────────────────────────────────────

const DAYS  = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const WEEKS = 52;

const intensityStyle: React.CSSProperties[] = [
  { backgroundColor: "var(--bg-3)" },
  { backgroundColor: "var(--primary)", opacity: 0.2 },
  { backgroundColor: "var(--primary)", opacity: 0.4 },
  { backgroundColor: "var(--primary)", opacity: 0.7 },
  { backgroundColor: "var(--primary)", opacity: 1   },
];

function getMonday(): Date {
  const today     = new Date();
  const dayOfWeek = (today.getDay() + 6) % 7; // 0=Mon … 6=Sun
  const monday    = new Date(today);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(today.getDate() - dayOfWeek - (WEEKS - 1) * 7);
  return monday;
}

function toIntensity(count: number): number {
  if (count === 0) return 0;
  if (count <= 2)  return 1;
  if (count <= 4)  return 2;
  if (count <= 7)  return 3;
  return 4;
}

function buildGrid(activity: Record<string, number>): {
  grid:  number[][];
  dates: string[][];
} {
  const grid:  number[][] = Array.from({ length: 7 }, () => Array(WEEKS).fill(0));
  const dates: string[][] = Array.from({ length: 7 }, () => Array(WEEKS).fill(""));
  const monday = getMonday();

  for (let w = 0; w < WEEKS; w++) {
    for (let d = 0; d < 7; d++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + w * 7 + d);
      const key    = date.toISOString().slice(0, 10);
      dates[d][w]  = key;
      grid[d][w]   = toIntensity(activity[key] ?? 0);
    }
  }

  return { grid, dates };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Statistics() {
  const { token } = useAuth();

  const [stats,    setStats]    = useState<UserStats | null>(null);
  const [activity, setActivity] = useState<Record<string, number>>({});
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me/stats`,    { headers }).then((r) => r.json()),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me/activity`, { headers }).then((r) => r.json()),
    ])
      .then(([statsData, activityData]) => {
        setStats(statsData);
        setActivity(activityData);
      })
      .catch((e) => {
        console.error("error:", e);
        setError("Unable to load statistics");
      })
      .finally(() => setLoading(false));
  }, [token]);

  const { grid, dates } = useMemo(() => buildGrid(activity), [activity]);

  const STAT_CARDS = stats
    ? [
        { label: "Total Projects", value: stats.total_projects    },
        { label: "Completed Runs", value: stats.total_runs        },
        { label: "Deployments",    value: stats.total_deployments },
      ]
    : [];

  return (
    <div className="flex flex-col gap-4 w-full">

      <div>
        <h2 className="text-2xl font-bold text-[var(--foreground)] tracking-tight">Statistics</h2>
        <p className="text-sm text-[var(--text-3)] mt-1">Overview of your activity on OrcaML</p>
      </div>

      {/* Stat cards */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={20} className="animate-spin text-[var(--text-3)]" />
        </div>
      ) : error ? (
        <div className="p-4 rounded-[var(--radius-card)] bg-[#fef2f2] border border-[#fecaca]">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {STAT_CARDS.map(({ label, value }) => (
            <div
              key={label}
              className="bg-[var(--card)] rounded-[var(--radius-card)] p-6 border border-[var(--border)]"
            >
              <p className="text-sm text-[var(--text-2)] mb-2">{label}</p>
              <p className="text-3xl font-bold text-[var(--foreground)]">{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Heatmap */}
      {!loading && !error && (
        <div className="bg-[var(--card)] rounded-[var(--radius-card)] p-6 border border-[var(--border)] overflow-x-auto">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-semibold text-[var(--card-foreground)]">
              Activity Heatmap
            </h3>
            <span className="text-xs text-[var(--text-3)]">Last 52 weeks</span>
          </div>

          <div className="flex gap-3">
            {/* Day labels */}
            <div className="flex flex-col gap-[3px] pt-0.5">
              {DAYS.map((day) => (
                <span key={day} className="text-[11px] text-[var(--text-3)] h-3.5 leading-none">
                  {day}
                </span>
              ))}
            </div>

            {/* Grid */}
            <div className="flex gap-[3px]">
              {Array.from({ length: WEEKS }, (_, w) => (
                <div key={w} className="flex flex-col gap-[3px]">
                  {DAYS.map((day, d) => {
                    const dateStr = dates[d][w];
                    const count   = activity[dateStr] ?? 0;
                    return (
                      <div
                        key={day}
                        title={count > 0 ? `${dateStr} — ${count} run${count > 1 ? "s" : ""}` : dateStr}
                        style={intensityStyle[grid[d][w]]}
                        className="w-3.5 h-3.5 rounded-sm cursor-default"
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-2 mt-4 justify-end">
            <span className="text-[10px] text-[var(--text-3)]">Less</span>
            {intensityStyle.map((style, i) => (
              <div key={i} style={style} className="w-3 h-3 rounded-sm" />
            ))}
            <span className="text-[10px] text-[var(--text-3)]">More</span>
          </div>
        </div>
      )}

    </div>
  );
}