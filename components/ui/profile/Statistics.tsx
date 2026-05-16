"use client";

type StatCard = {
  label: string;
  value: number;
};

const STATS: StatCard[] = [
  { label: "Total Projects", value: 12 },
  { label: "Total Runs",     value: 342 },
  { label: "Deployments",    value: 24 },
];

// 7 rows (days) x 52 cols (weeks) of random activity data
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const WEEKS = 52;

function generateHeatmap(): number[][] {
  return DAYS.map(() =>
    Array.from({ length: WEEKS }, () => Math.floor(Math.random() * 5))
  );
}

const heatmap = generateHeatmap();

const intensityClass = ["bg-[var(--bg-3)]", "bg-[var(--primary)]/20", "bg-[var(--primary)]/40", "bg-[var(--primary)]/70", "bg-[var(--primary)]"];

export default function Statistics() {
  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-[var(--foreground)] tracking-tight">Profile Settings</h2>
        <p className="text-sm text-[var(--text-3)] mt-1">Manage your account and preferences</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4">
        {STATS.map(({ label, value }) => (
          <div key={label} className="bg-[var(--card)] rounded-[var(--radius-card)] p-6 border border-[var(--border)]">
            <p className="text-sm text-[var(--text-2)] mb-2">{label}</p>
            <p className="text-3xl font-bold text-[var(--foreground)]">{value}</p>
          </div>
        ))}
      </div>

      {/* Heatmap */}
      <div className="bg-[var(--card)] rounded-[var(--radius-card)] p-6 border border-[var(--border)] overflow-x-auto">
        <h3 className="text-base font-semibold text-[var(--card-foreground)] mb-5">Activity Heatmap</h3>
        <div className="flex gap-3">
          {/* Day labels */}
          <div className="flex flex-col gap-[3px] pt-0.5">
            {DAYS.map((day) => (
              <span key={day} className="text-[11px] text-[var(--text-3)] h-3.5 leading-none">{day}</span>
            ))}
          </div>
          {/* Grid */}
          <div className="flex gap-[3px]">
            {Array.from({ length: WEEKS }, (_, w) => (
              <div key={w} className="flex flex-col gap-[3px]">
                {DAYS.map((day, d) => (
                  <div
                    key={day}
                    className={`w-3.5 h-3.5 rounded-sm ${intensityClass[heatmap[d][w]]}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 