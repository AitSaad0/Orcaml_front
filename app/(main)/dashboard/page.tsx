import StatsCard from "@/components/ui/StatsCard";
import TrainingActivityChart from "@/components/ui/TrainingActivityChart";
import ModelPerformanceChart from "@/components/ui/ModelPerformanceChart";
import RecentRuns from "@/components/ui/RecentRuns";
import { Database, Activity, Rocket, TrendingUp } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Overview of your MLOps platform
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatsCard title="Total Projects" value="12" icon={<Database size={18} />} trend="+2 vs last week" trendUp={true} />
        <StatsCard title="Active Runs" value="8" icon={<Activity size={18} />} trend="+3 vs last week" trendUp={true} />
        <StatsCard title="Deployments" value="24" icon={<Rocket size={18} />} trend="-1 vs last week" trendUp={false} />
        <StatsCard title="Success Rate" value="94.2%" icon={<TrendingUp size={18} />} trend="+1.2% vs last week" trendUp={true} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TrainingActivityChart />
        <ModelPerformanceChart />
      </div>

      <RecentRuns />
    </div>
  );
}