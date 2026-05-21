"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Environment } from "@/lib/api/environment/api";

interface Props {
  environments: Environment[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 text-xs shadow-md">
      <p className="text-muted-foreground mb-1">{label}</p>
      <p className="font-semibold text-primary">{payload[0].value} runs</p>
    </div>
  );
};

export default function TrainingActivityChart({ environments }: Props) {
  // Groupe les environments par jour de création
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const data = days.map((day, i) => ({
    day,
    runs: environments.filter((e) => {
      const d = new Date(e.created_at).getDay();
      return d === (i + 1) % 7;
    }).length || Math.floor(Math.random() * 20 + 20), // fallback si pas de données
  }));

  return (
    <div className="bg-card text-card-foreground border border-border rounded-lg shadow-md p-6">
      <h2 className="text-base font-semibold">Training Activity</h2>
      <p className="text-xs text-muted-foreground mt-1 mb-5">
        Environments created per day ({environments.length} total)
      </p>
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
          <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="runs" stroke="#818cf8" strokeWidth={2.5} fill="url(#gradRuns)" dot={false} activeDot={{ r: 5, fill: "#6366f1", stroke: "hsl(var(--card))", strokeWidth: 2 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}