export type EnvironmentCardProps = {
  name: string;
  status: "active" | "inactive";
  targetColumn: string;
  taskType: string;
  totalRuns: number;
  deployments: number;
  showMenu?: boolean;
};