

import { Stats } from "fs";
import StatsCard from "../ui/StatsCard";
import { ChartLine } from "lucide-react";
import EnvironmentCard from "../ui/EnvironmentCard";
import CreateEnvironmentCard from "../ui/CreateEnvironmentCard";

type ProjectComponentProps = {
    name: string;
    totalExperiments: number;
    totalDeployments: number;
    totalRuns: number;
    environments: {
        id: string;
        name: string;
        status: "active" | "inactive";
        target_column: string;
        task_type: string;
        total_runs: number;
        deployments: number;
    }[];
}
export default function Projects({
    name,
    totalExperiments,
    totalDeployments,
    totalRuns,
    environments
} : ProjectComponentProps) {

    return(
        <div className="flex flex-col gap-2 p-8">
            <h1 className="text-2xl font-bold">{name}</h1>
            <h5 className="text-sm text-muted-foreground">Manage your ML environments and experiments</h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 w-full">
                <StatsCard title="Total Experiments" value={totalExperiments} icon={<ChartLine  size={32}/>} />
                <StatsCard title="Total Deployments" value={totalDeployments} icon={<ChartLine  size={32}/>} />
                <StatsCard title="Total Runs" value={totalRuns} icon={<ChartLine  size={32}/>} />
            </div>
            <h3 className="py-2 text-lg font-semibold">Environments</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               {environments.map((env) => (
                    <EnvironmentCard
                        key={env.id}
                        name={env.name || "Default Env"}
                        status={(env.status?.toLowerCase() as "active" | "inactive") || "inactive"}
                        targetColumn={env.target_column || "default_column"}
                        taskType={env.task_type || "default_type"}
                        totalRuns={env.total_runs || 0}
                        deployments={env.deployments || 0}
                    />
                ))}
                <CreateEnvironmentCard />

            </div>
        </div>
    );
}