"use client";

import { Activity, FileText, Trash2, Copy } from "lucide-react";
import { motion } from "framer-motion";

export interface DeploymentCardData {
  id: string;
  algorithm: string;
  status: "ACTIVE" | "STOPPED" | "DEPLOYING" | "FAILED";
  endpointUrl: string | null;
  totalCalls: number;
  avgLatency: string;
  deployedAt: string | null;
}

interface Props {
  deployment: DeploymentCardData;
  onPredict: (id: string) => void;
  onLogs: (id: string) => void;
  onUndeploy: (id: string) => void;
}

const STATUS_STYLES: Record<string, string> = {
  ACTIVE:    "bg-green-500/10 text-green-500",
  STOPPED:   "bg-red-500/10 text-red-400",
  DEPLOYING: "bg-yellow-500/10 text-yellow-400",
  FAILED:    "bg-red-500/10 text-red-500",
};

const STATUS_DOT: Record<string, string> = {
  ACTIVE:    "bg-green-500",
  STOPPED:   "bg-red-400",
  DEPLOYING: "bg-yellow-400 animate-pulse",
  FAILED:    "bg-red-500",
};

export default function DeploymentCard({ deployment, onPredict, onLogs, onUndeploy }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="bg-card border border-border rounded-xl p-5 flex flex-col gap-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_STYLES[deployment.status]}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[deployment.status]}`} />
            {deployment.status.toLowerCase()}
          </span>
          <h3 className="text-base font-semibold">{deployment.algorithm}</h3>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onPredict(deployment.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg
              border border-border hover:bg-accent transition-colors"
          >
            <Activity size={13} /> Predict
          </button>
          <button
            onClick={() => onLogs(deployment.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg
              border border-border hover:bg-accent transition-colors"
          >
            <FileText size={13} /> Logs
          </button>
          {deployment.status === "ACTIVE" && (
            <button
              onClick={() => onUndeploy(deployment.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg
                border border-destructive/40 text-destructive hover:bg-destructive/10 transition-colors"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Endpoint */}
      {deployment.endpointUrl && (
        <div className="flex items-center justify-between bg-muted/40 rounded-lg px-3 py-2 text-xs font-mono">
          <span className="text-muted-foreground mr-2">POST</span>
          <span className="truncate flex-1 text-foreground">{deployment.endpointUrl}</span>
          <button
            onClick={() => navigator.clipboard.writeText(deployment.endpointUrl!)}
            className="ml-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Copy size={13} />
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Requests (24h)", value: deployment.totalCalls.toLocaleString() },
          { label: "Avg. Latency",   value: deployment.avgLatency },
          { label: "Deployed",       value: deployment.deployedAt ?? "—" },
        ].map((stat) => (
          <div key={stat.label} className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">{stat.label}</span>
            <span className="text-sm font-medium">{stat.value}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}