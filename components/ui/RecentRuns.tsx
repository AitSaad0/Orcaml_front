import { Clock } from "lucide-react";
import { Environment } from "@/lib/api/environment/api";

interface Props {
  environments: Environment[];
}

export default function RecentRuns({ environments }: Props) {
  const recent = [...environments]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  return (
    <div className="bg-card text-card-foreground border border-border rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base font-semibold">Recent Environments</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Latest activity</p>
        </div>
      </div>

      {recent.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">No environments yet</p>
      ) : (
        <div className="flex flex-col gap-2">
          {recent.map((env) => (
            <div
              key={env.id}
              className="flex items-center justify-between px-4 py-3 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  env.status === "active" ? "bg-emerald-400" :
                  env.status === "pending" ? "bg-primary animate-pulse" :
                  "bg-destructive"
                }`} />
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  env.status === "active" ? "bg-emerald-400/10 text-emerald-500" :
                  env.status === "pending" ? "bg-primary/10 text-primary" :
                  "bg-destructive/10 text-destructive"
                }`}>
                  {env.status}
                </span>
                <span className="text-sm font-medium">{env.name}</span>
                <span className="text-xs text-muted-foreground">— {env.task_type}</span>
              </div>
              <div className="flex items-center gap-6 text-xs text-muted-foreground">
                <span>{env.total_runs} runs · {env.total_deployments} deploys</span>
                <span className="flex items-center gap-1">
                  <Clock size={11} />
                  {new Date(env.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}