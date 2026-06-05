"use client";

import { Activity, Rocket, FlaskConical } from "lucide-react";
import EnvironmentCard from "../../ui/environment/EnvironmentCard";
import CreateEnvironmentCard from "../../ui/environment/CreateEnvironmentCard";
import { useEffect } from "react";
import { ProjectComponentProps } from "@/types/environment/ProjectComponentProps";
import useEnvStore from "@/store/useEnvStore";

export default function Projects({
  name,
  projectId,
  totalExperiments,
  totalDeployments,
  totalRuns,
  environments,
  onRefresh,
}: ProjectComponentProps) {

  const refreshProjectId = useEnvStore((s) => s.refreshProjectId);
  const clearRefresh     = useEnvStore((s) => s.clearRefresh);

  useEffect(() => {
    if (refreshProjectId === projectId) {
      onRefresh();
      clearRefresh();
    }
  }, [refreshProjectId]);

  const stats = [
    { label: "Environments", value: totalExperiments, icon: <FlaskConical size={15} />, color: "#6366f1" },
    { label: "Total Runs",   value: totalRuns,         icon: <Activity size={15} />,    color: "#14b8a6" },
    { label: "Deployments",  value: totalDeployments,  icon: <Rocket size={15} />,      color: "#f59e0b" },
  ];

  return (
    <div className="flex flex-col gap-8 p-6">

      {/* ── Header ── */}
      <div className="flex items-end justify-between pb-5 border-b border-[var(--border)]">
        <div className="flex flex-col gap-1">
          <p className="text-[10px] font-bold uppercase tracking-[3px] text-[var(--text-3)]">
            Project Overview
          </p>
          <h1
            className="text-[28px] font-black tracking-tight text-[var(--foreground)]"
            style={{ letterSpacing: "-0.03em" }}
          >
            {name}
          </h1>
          <p className="text-[13px] text-[var(--text-3)]">
            Manage your ML environments and experiments
          </p>
        </div>

        {/* Live indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--border)] bg-[var(--card)] mb-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] font-medium text-[var(--text-3)]">Live</span>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="relative flex flex-col gap-4 p-5 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--card)] overflow-hidden"
          >
            <div
              className="absolute left-0 top-4 bottom-4 w-[3px] rounded-full"
              style={{ background: stat.color }}
            />
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: `${stat.color}18`, color: stat.color }}
            >
              {stat.icon}
            </div>
            <div>
              <p
                className="text-[32px] font-black leading-none tracking-tight text-[var(--foreground)]"
                style={{ letterSpacing: "-0.04em" }}
              >
                {stat.value}
              </p>
              <p className="text-[12px] text-[var(--text-3)] font-medium mt-1.5">
                {stat.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Environments ── */}
      <div className="flex flex-col gap-4">

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2
              className="text-[16px] font-bold text-[var(--foreground)]"
              style={{ letterSpacing: "-0.02em" }}
            >
              Environments
            </h2>
            <span className="text-[11px] font-semibold text-[var(--text-3)] bg-[var(--bg-2)] border border-[var(--border)] px-2 py-0.5 rounded-full tabular-nums">
              {environments.length}
            </span>
          </div>
          <div className="h-px flex-1 mx-4 bg-[var(--border)]" />
        </div>

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

    </div>
  );
}