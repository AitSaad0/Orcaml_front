import { Clock } from "lucide-react";

type RunStatus = "success" | "running" | "failed";

interface Run {
  id: string;
  name: string;
  status: RunStatus;
  accuracy?: number;
  duration: string;
}

const runs: Run[] = [
  { id: "1", name: "ChurnV2 – XGBoost", status: "success", accuracy: 0.9234, duration: "2m 34s" },
  { id: "2", name: "FraudProd – RandomForest", status: "running", duration: "1m 12s" },
  { id: "3", name: "ChurnV1 – LogisticReg", status: "success", accuracy: 0.8876, duration: "1m 08s" },
  { id: "4", name: "FraudProd – XGBoost", status: "failed", duration: "0m 45s" },
  { id: "5", name: "ChurnV2 – LightGBM", status: "success", accuracy: 0.9412, duration: "3m 02s" },
];

export default function RecentRuns() {
  return (
    <div className="bg-card text-card-foreground border border-border rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base font-semibold">Recent Runs</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Latest training executions</p>
        </div>
        <button className="text-xs text-primary hover:underline font-medium transition-colors">
          View all →
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {runs.map((run) => (
          <div
            key={run.id}
            className="flex items-center justify-between px-4 py-3 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                run.status === "success" ? "bg-emerald-400" :
                run.status === "running" ? "bg-primary animate-pulse" :
                "bg-destructive"
              }`} />
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                run.status === "success" ? "bg-emerald-400/10 text-emerald-500" :
                run.status === "running" ? "bg-primary/10 text-primary" :
                "bg-destructive/10 text-destructive"
              }`}>
                {run.status}
              </span>
              <span className="text-sm font-medium">{run.name}</span>
            </div>
            <div className="flex items-center gap-6 text-xs text-muted-foreground">
              {run.accuracy !== undefined && (
                <span>Accuracy: <span className="font-semibold text-card-foreground">{run.accuracy}</span></span>
              )}
              <span className="flex items-center gap-1">
                <Clock size={11} />
                {run.duration}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}