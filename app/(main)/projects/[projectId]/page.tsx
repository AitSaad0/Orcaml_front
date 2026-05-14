import { ChartLine } from "lucide-react";
import StatsCard from "../../../../components/ui/StatsCard";
import EnvironmentCard from "../../../../components/ui/EnvironmentCard";
import CreateEnvironmentCard from "../../../../components/ui/CreateEnvironmentCard";
import Projects from "@/components/sections/Projects";

const projects = [
    {
        id: "1",
        name: "Churn Prediction",
        total_experiments: 24,
        total_deployments: 3,
        total_runs: 42
    }, 
    {
        id: "2",
        name: "Fraud Detection",
        total_experiments: 12,
        total_deployments: 1,
        total_runs: 18
    }
];

const environments = [
    {
        project_id: "1",
        environments: [
            {
            id: "env1",
            name: "ChurnV1",
            status: "inactive" as const,
            target_column: "churn_flag",
            task_type: "classification",
            total_runs: 24,
            deployments: 2
            }, 
            {
            id: "env2",
            name: "ChurnV2",
            status: "active" as const,
            target_column: "churn_flag",
            task_type: "classification",
            total_runs: 18,
            deployments: 1
            }
        ]
    },
    {
        project_id: "2",
        environments: [
            {
                id: "env3",
                name: "FraudProd",
                status: "active" as const,
                target_column: "is_fraud",
                task_type: "classification",
                total_runs: 18,
                deployments: 1
            }
    ]
    },    
]




export default function ProjectPage({params}: {params: {projectId: string}}) {
    const project = projects.find(p => p.id === params.projectId);
    const projectEnvironments = environments.find(e => e.project_id === params.projectId)?.environments || [];

    if (!project) {
        return <div className="p-8">Project not found</div>;
    }

    return (
        <Projects 
            name={project.name}
            totalExperiments={project.total_experiments}
            totalDeployments={project.total_deployments}
            totalRuns={project.total_runs}
            environments={projectEnvironments}
        />

    );
}