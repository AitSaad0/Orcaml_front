"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth/AuthContext";
import { getProjects, Project } from "@/lib/api/project/api";
import { getEnvironments, Environment } from "@/lib/api/environment/api";
import { listDeployments, Deployment } from "@/lib/api/deployment/api";
import StatsCard from "@/components/ui/StatsCard";
import TrainingActivityChart from "@/components/ui/TrainingActivityChart";
import ModelPerformanceChart from "@/components/ui/ModelPerformanceChart";
import RecentRuns from "@/components/ui/RecentRuns";
import { Database, Activity, Rocket, TrendingUp } from "lucide-react";

export default function DashboardPage() {
  const { token } = useAuth();

  const [projects, setProjects] = useState<Project[]>([]);
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    async function fetchAll() {
      try {
        // 1. fetch projects
        const projs = await getProjects(token!);
        setProjects(projs);

        // 2. fetch environments pour chaque project
        const allEnvs: Environment[] = [];
        for (const proj of projs) {
          const envs = await getEnvironments(token!, proj.id);
          allEnvs.push(...envs);
        }
        setEnvironments(allEnvs);

        // 3. fetch deployments pour chaque environment
        const allDeps: Deployment[] = [];
        for (const env of allEnvs) {
          const deps = await listDeployments(token!, env.id);
          allDeps.push(...deps);
        }
        setDeployments(allDeps);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchAll();
  }, [token]);

  // Stats calculées depuis les vraies données
  const totalProjects = projects.length;
  const activeRuns = environments.filter((e) => e.status === "active").length;
  const totalDeployments = deployments.length;
  const activeDeployments = deployments.filter((d) => d.status === "ACTIVE").length;
  const successRate = totalDeployments > 0
    ? ((activeDeployments / totalDeployments) * 100).toFixed(1) + "%"
    : "—";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-20 text-muted-foreground text-sm">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Overview of your MLOps platform
        </p>
      </div>

      {/* Stats dynamiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatsCard
          title="Total Projects"
          value={totalProjects}
          icon={<Database size={18} />}
          trend={`${totalProjects} projects`}
          trendUp={true}
        />
        <StatsCard
          title="Active Environments"
          value={activeRuns}
          icon={<Activity size={18} />}
          trend={`${environments.length} total envs`}
          trendUp={activeRuns > 0}
        />
        <StatsCard
          title="Deployments"
          value={totalDeployments}
          icon={<Rocket size={18} />}
          trend={`${activeDeployments} active`}
          trendUp={activeDeployments > 0}
        />
        <StatsCard
          title="Success Rate"
          value={successRate}
          icon={<TrendingUp size={18} />}
          trend="based on active deploys"
          trendUp={activeDeployments > 0}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TrainingActivityChart environments={environments} />
        <ModelPerformanceChart deployments={deployments} />
      </div>

      {/* Recent runs depuis les environments */}
      <RecentRuns environments={environments} />
    </div>
  );
}