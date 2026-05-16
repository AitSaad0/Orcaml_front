const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export interface Environment {
  id: string;
  name: string;
  project_id: string;
  target_column: string;
  task_type: string;
  status: "pending" | "active" | "inactive";
  created_at: string;
  total_runs: number;
  total_deployments: number;
}

export async function getEnvironments(token: string, projectId: string): Promise<Environment[]> {
    const res = await fetch(`${API_BASE}/environments/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to fetch environments");
    const data = await res.json();
    return data.environments;
}