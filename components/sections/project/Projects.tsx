"use client";

import { ChartLine } from "lucide-react";
import StatsCard from "../../ui/StatsCard";
import EnvironmentCard from "../../ui/EnvironmentCard";
import CreateEnvironmentCard from "../../ui/CreateEnvironmentCard";
import { useEffect } from "react";
import { envCreatedEvent } from "@/lib/events";
import { ProjectComponentProps } from "@/types/environment/ProjectComponentProps";

export default function Projects({
  name,
  projectId,
  totalExperiments,
  totalDeployments,
  totalRuns,
  environments,
  onRefresh,
}: ProjectComponentProps) {

  useEffect(() => {
    function handleEnvCreated(e: Event) {
      const { projectId: createdProjectId } = (e as CustomEvent).detail;
      if (createdProjectId === projectId) onRefresh();
    }
    window.addEventListener(envCreatedEvent, handleEnvCreated);
    return () => window.removeEventListener(envCreatedEvent, handleEnvCreated);
  }, [projectId, onRefresh]);

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
            name={env.name}
            status={env.status === "active" ? "active" : "inactive"}
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