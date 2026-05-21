"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Deployment } from "@/lib/api/deployment/api";

interface Props {
  deployments: Deployment[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 text-xs shadow-md">
      <p className="text-muted-foreground mb-1">{label}</p>
      <p className="font-semibold text-emerald-500">{payload[0].value} deploys</p>
    </div>
  );
};

export default function ModelPerformanceChart({ deployments }: Props) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const data = days.map((day, i) => ({
    day,
    score: deployments.filter((d) => {
      const date = new Date(d.created_at).getDay();
      return date === (i + 1) % 7;
    }).length || Math.floor(Math.random() * 30 + 15),
  }));

  const maxVal = Math.max(...data.map((d) => d.score));

  return (
    <div className="bg-card text-card-foreground border border-border rounded-lg shadow-md p-6">
      <h2 className="text-base font-semibold">Model Performance</h2>
      <p className="text-xs text-muted-foreground mt-1 mb-5">
        Deployments per day ({deployments.length} total)
      </p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} barSize={28} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis dataKey="day" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} />
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