import { MoreVertical } from "lucide-react";
import { EnvironmentCardProps } from "../../../types/EnvironmentCardProps";
import Link from "next/link";


export default function EnvironmentCard({
  environmentId,
  projectId,
  name,
  status,
  targetColumn,
  taskType,
  totalRuns,
  deployments,
  showMenu = false,
}: EnvironmentCardProps) {
  return (
    <Link href={`/projects/${projectId}/environments/${environmentId}`}>
      <div className="bg-card text-card-foreground border border-border rounded-xl p-5 w-full flex flex-col gap-4 hover:border-primary transition-colors cursor-pointer">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 bg-success/10 text-success text-xs font-medium px-2.5 py-1 rounded-full w-fit">
            <span
              className={`w-1.5 h-1.5 rounded-full inline-block ${
                status === "active" ? "bg-green-500" : "bg-red-500"
              }`}
            />
            {status}
          </div>

          {showMenu && (
            <button className="text-muted-foreground hover:text-foreground transition-colors">
              <MoreVertical size={16} />
            </button>
          )}
        </div>

        {/* Name */}
        <h3 className="text-lg font-semibold">{name}</h3>

        {/* Details */}
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Target Column</span>
            <span className="font-mono text-foreground">{targetColumn}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Task Type</span>
            <span className="bg-bg-3 text-foreground text-xs px-2.5 py-0.5 rounded-md">
              {taskType}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Total Runs</span>
            <span className="font-medium">{totalRuns}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Deployments</span>
            <span className="font-medium">{deployments}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}