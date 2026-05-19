interface Props {
  activeCount: number;
  totalRequests: number;
  avgLatency: string;
}

export default function DeploymentStatsBar({ activeCount, totalRequests, avgLatency }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {[
        { label: "Active Deployments", value: activeCount },
        { label: "Total Requests (24h)", value: totalRequests.toLocaleString() },
        { label: "Avg. Latency", value: avgLatency },
      ].map((stat) => (
        <div key={stat.label} className="bg-card border border-border rounded-xl p-5">
          <p className="text-sm text-muted-foreground">{stat.label}</p>
          <p className="text-2xl font-bold mt-1">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}