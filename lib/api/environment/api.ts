const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export interface Environment {
  id: string;
  name: string;
  project_id: string;
  target_column: string;
  task_type: "classification" | "regression";
  status: "pending" | "running" | "completed" | "failed" | "canceled";
  created_at: string;
  total_runs: number;
  total_deployments: number;
}
function authHeaders(token: string) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function getEnvironments(token: string, projectId: string): Promise<Environment[]> {
  const res = await fetch(`${API_BASE}/environments/${projectId}`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Failed to fetch environments");
  const data = await res.json();
  return data.environments;
}

export async function getEnvironment(
  token: string,
  projectId: string,
  environmentId: string
): Promise<Environment> {
  const res = await fetch(`${API_BASE}/environments/${projectId}/${environmentId}`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Failed to fetch environment");
  return res.json();
}

export async function updateEnvironment(
  token: string,
  projectId: string,
  environmentId: string,
  body: { name?: string; target_column?: string; task_type?: string; status?: string }
): Promise<Environment> {
  const res = await fetch(`${API_BASE}/environments/${projectId}/${environmentId}`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail ?? "Failed to update environment");
  }
  return res.json();
}

export async function deleteEnvironment(
  token: string,
  projectId: string,
  environmentId: string
): Promise<void> {
  const res = await fetch(`${API_BASE}/environments/${projectId}/${environmentId}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail ?? "Failed to delete environment");
  }
}