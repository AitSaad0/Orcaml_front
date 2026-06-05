"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/auth/AuthContext";
import Projects from "@/components/sections/project/Projects";
import { getProjects, Project } from "@/lib/api/project/api";
import { getEnvironments, Environment } from "@/lib/api/environment/api";

export default function ProjectPage({ params }: { params: { projectId: string } }) {
  const { token } = useAuth();
  const [project,      setProject]      = useState<Project | null>(null);
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!token) return;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(params.projectId)) {
      setError("Invalid project URL — please select a project from the sidebar.");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const [projects, envs] = await Promise.all([
        getProjects(token),
        getEnvironments(token, params.projectId),
      ]);
      const found = projects.find((p) => p.id === params.projectId);
      if (!found) throw new Error("Project not found");
      setProject(found);
      setEnvironments(envs);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, params.projectId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── FIX : calculer les stats depuis les environments ──
  const totalRuns        = environments.reduce((sum, env) => sum + (env.total_runs        ?? 0), 0);
  const totalDeployments = environments.reduce((sum, env) => sum + (env.total_deployments ?? 0), 0);
  const totalExperiments = environments.length;

  if (loading) return (
    <div className="flex-1 flex items-center justify-center text-[var(--text-3)] text-sm">
      Loading...
    </div>
  );
  if (error) return (
    <div className="flex-1 flex items-center justify-center text-[var(--destructive)] text-sm">
      {error}
    </div>
  );
  if (!project) return (
    <div className="flex-1 flex items-center justify-center text-[var(--text-3)] text-sm">
      Project not found
    </div>
  );

  return (
    <div className="flex-1 min-h-0 overflow-y-auto">
      <Projects
        name={project.name}
        projectId={params.projectId}
        totalExperiments={totalExperiments}
        totalDeployments={totalDeployments}
        totalRuns={totalRuns}
        environments={environments}
        onRefresh={fetchData}
      />
    </div>
  );
}