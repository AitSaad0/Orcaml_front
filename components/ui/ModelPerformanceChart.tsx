"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useAuth } from "@/context/auth/AuthContext";
import { getDeploymentActivity } from "@/lib/api/users/api";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 text-xs shadow-md">
      <p className="text-muted-foreground mb-1">{label}</p>
      <p className="font-semibold text-emerald-500">{payload[0].value} deploys</p>
    </div>
  );
};

export default function ModelPerformanceChart() {
  const { token } = useAuth();
  const [data,  setData]  = useState<{ day: string; score: number }[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!token) return;

    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const today = new Date();

    getDeploymentActivity(token)
      .then((activity) => {
        const chartData = Array.from({ length: 7 }, (_, i) => {
          const date = new Date(today);
          date.setDate(today.getDate() - (6 - i));
          const key      = date.toISOString().split("T")[0];
          const dayLabel = days[(date.getDay() + 6) % 7];
          return { day: dayLabel, score: activity[key] ?? 0 };
        });
        setData(chartData);
        setTotal(Object.values(activity).reduce((a, b) => a + b, 0));
      })
      .catch(() => setData(days.map((day) => ({ day, score: 0 }))));
  }, [token]);

  const maxVal = Math.max(...data.map((d) => d.score), 1);

  return (
    <div className="bg-card text-card-foreground border border-border rounded-lg shadow-md p-6">
      <h2 className="text-base font-semibold">Model Performance</h2>
      <p className="text-xs text-muted-foreground mt-1 mb-5">
        Deployments per day ({total} total)
      </p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} barSize={28} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis dataKey="day" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
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