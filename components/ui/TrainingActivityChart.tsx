"use client";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { day: "Mon", runs: 28 },
  { day: "Tue", runs: 35 },
  { day: "Wed", runs: 30 },
  { day: "Thu", runs: 42 },
  { day: "Fri", runs: 50 },
  { day: "Sat", runs: 38 },
  { day: "Sun", runs: 30 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 text-xs shadow-md">
      <p className="text-muted-foreground mb-1">{label}</p>
      <p className="font-semibold text-primary">{payload[0].value} runs</p>
    </div>
  );
};

export default function TrainingActivityChart() {
  return (
    <div className="bg-card text-card-foreground border border-border rounded-lg shadow-md p-6">
      <h2 className="text-base font-semibold">Training Activity</h2>
      <p className="text-xs text-muted-foreground mt-1 mb-5">Training runs over the past week</p>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="gradRuns" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#818cf8" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#818cf8" stopOpacity={0.03} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis dataKey="day" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 60]} ticks={[0, 15, 30, 45, 60]} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="runs" stroke="#818cf8" strokeWidth={2.5} fill="url(#gradRuns)" dot={false} activeDot={{ r: 5, fill: "#6366f1", stroke: "hsl(var(--card))", strokeWidth: 2 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}