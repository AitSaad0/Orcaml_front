export interface EnvironmentCardProps {
  environmentId: string;
  projectId: string;
  name: string;
  status: string;
  targetColumn: string;
  taskType: string;
  totalRuns: number;
  deployments: number;
  showMenu?: boolean;
}