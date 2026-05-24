"use client";

import { ChartLine } from "lucide-react";
import StatsCard from "../../ui/StatsCard";
import EnvironmentCard from "../../ui/environment/EnvironmentCard";
import CreateEnvironmentCard from "../../ui/environment/CreateEnvironmentCard";
import { useEffect } from "react";
import { ProjectComponentProps } from "@/types/environment/ProjectComponentProps";
import useEnvStore from "@/store/useEnvStore"; // 👈 import store

export default function Projects({
  name,
  projectId,
  totalExperiments,
  totalDeployments,
  totalRuns,
  environments,
  onRefresh,
}: ProjectComponentProps) {

  const refreshProjectId = useEnvStore((s) => s.refreshProjectId)  // 👈 watch store
  const clearRefresh = useEnvStore((s) => s.clearRefresh)

  useEffect(() => {
    if (refreshProjectId === projectId) {
      onRefresh()
      clearRefresh()
    }
  }, [refreshProjectId]) // 👈 runs automatically when store changes

  return (
    <div className="flex flex-col gap-2 p-8">
      <h1 className="text-2xl font-bold">{name}</h1>
      <h5 className="text-sm text-muted-foreground">
        Manage your ML environments and experiments
      </h5>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 w-full">
        <StatsCard title="Total Experiments" value={totalExperiments} icon={<ChartLine size={32} />} />
        <StatsCard title="Total Deployments" value={totalDeployments} icon={<ChartLine size={32} />} />
        <StatsCard title="Total Runs" value={totalRuns} icon={<ChartLine size={32} />} />
      </div>

      <h3 className="py-2 text-lg font-semibold">Environments</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {environments.map((env) => (
          <EnvironmentCard
            key={env.id}
            environmentId={String(env.id)}
            projectId={String(projectId)}
            name={env.name}
            targetColumn={env.target_column}
            taskType={env.task_type}
            totalRuns={env.total_runs}
            deployments={env.total_deployments}
          />
        ))}
        <CreateEnvironmentCard
          projectId={projectId}
          onCreated={onRefresh}
        />
      </div>
    </div>
  );
}