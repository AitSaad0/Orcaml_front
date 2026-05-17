"use client";

import { useState, useEffect, useCallback } from "react";
import { Rocket } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/auth/AuthContext";
import EnvironmentPageWrapper from "@/components/ui/environment/EnvironmentPageWrapper";
import DeploymentStatsBar from "@/components/ui/deployments/DeploymentStatsBar";
import DeploymentCard from "@/components/ui/deployments/DeploymentCard";
import {
  listDeployments,
  undeployModel,
  Deployment,
} from "@/lib/api/deployment/api";

export default function DeploymentsPage({
  params,
}: {
  params: { projectId: string; environmentId: string };
}) {
  const { token } = useAuth();
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDeployments = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError(null);
      const data = await listDeployments(token, params.environmentId);
      setDeployments(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, params.environmentId]);

  useEffect(() => {
    fetchDeployments();
  }, [fetchDeployments]);

  async function handleUndeploy(id: string) {
    if (!token) return;
    try {
      const updated = await undeployModel(token, params.environmentId, id);
      setDeployments((prev) => prev.map((d) => d.id === id ? updated : d));
    } catch (err: any) {
      setError(err.message);
    }
  }

  const activeCount    = deployments.filter((d) => d.status === "ACTIVE").length;
  const totalRequests  = deployments.reduce((sum, d) => sum + d.total_calls, 0);
  const avgLatency     = (() => {
    const active = deployments.filter((d) => d.avg_latency_ms != null);
    if (active.length === 0) return "—";
    const avg = active.reduce((sum, d) => sum + d.avg_latency_ms!, 0) / active.length;
    return `${Math.round(avg)}ms`;
  })();

  return (
    <EnvironmentPageWrapper>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Model Deployments</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Deploy and manage production models
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:opacity-90 transition-opacity">
          <Rocket size={15} />
          Deploy Model
        </button>
      </div>

      {/* Stats */}
      <DeploymentStatsBar
        activeCount={activeCount}
        totalRequests={totalRequests}
        avgLatency={avgLatency}
      />

      {/* Error */}
      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-destructive text-sm mt-4"
        >
          {error}
        </motion.p>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex flex-col gap-4 mt-6">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-40 rounded-xl bg-muted/40 animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Cards */}
      {!loading && (
        <div className="flex flex-col gap-4 mt-6">
          {deployments.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 text-muted-foreground text-sm"
            >
              No deployments yet — deploy a model to get started.
            </motion.div>
          ) : (
            deployments.map((d, i) => (
              <motion.div
                key={d.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07, duration: 0.25, ease: "easeOut" }}
              >
                <DeploymentCard
                  deployment={{
                    id:          d.id,
                    algorithm:   d.model.algorithm,
                    status:      d.status,
                    endpointUrl: d.endpoint_url,
                    totalCalls:  d.total_calls,
                    avgLatency:  d.avg_latency_ms
                      ? `${Math.round(d.avg_latency_ms)}ms`
                      : "—",
                    deployedAt: d.deployed_at
                      ? new Date(d.deployed_at).toLocaleDateString()
                      : null,
                  }}
                  onPredict={(id) => console.log("predict", id)}
                  onLogs={(id) => console.log("logs", id)}
                  onUndeploy={handleUndeploy}
                />
              </motion.div>
            ))
          )}
        </div>
      )}
    </EnvironmentPageWrapper>
  );
}