import { Environment } from "@/lib/api/environment/api";

export type ProjectComponentProps = {
  name: string;
  projectId: string;
  totalExperiments: number;
  totalDeployments: number;
  totalRuns: number;
  environments: Environment[];
  onRefresh: () => void;
};