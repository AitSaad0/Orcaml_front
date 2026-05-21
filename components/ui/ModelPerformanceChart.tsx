"use client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const data = [
  { day: "Mon", score: 22 },
  { day: "Tue", score: 35 },
  { day: "Wed", score: 30 },
  { day: "Thu", score: 44 },
  { day: "Fri", score: 52 },
  { day: "Sat", score: 32 },
  { day: "Sun", score: 28 },
];

const maxVal = Math.max(...data.map((d) => d.score));

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 text-xs shadow-md">
      <p className="text-muted-foreground mb-1">{label}</p>
      <p className="font-semibold text-emerald-500">{payload[0].value} models</p>
    </div>
  );
};

export default function ModelPerformanceChart() {
  return (
    <div className="bg-card text-card-foreground border border-border rounded-lg shadow-md p-6">
      <h2 className="text-base font-semibold">Model Performance</h2>
      <p className="text-xs text-muted-foreground mt-1 mb-5">Successful evaluations per day</p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} barSize={28} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis dataKey="day" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 60]} ticks={[0, 15, 30, 45, 60]} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(16,185,129,0.06)" }} />
          <Bar dataKey="score" radius={[5, 5, 0, 0]}>
            {data.map((entry) => (
              <Cell key={entry.day} fill={entry.score === maxVal ? "#10b981" : "#6ee7b7"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}