const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export type DeploymentStatus = "DEPLOYING" | "ACTIVE" | "STOPPED" | "FAILED";

export interface ModelArtifact {
  id: string;
  run_id: string;
  environment_id: string;
  algorithm: string;
  mlflow_run_id: string;
  file_path: string | null;
  created_at: string;
}

export interface Deployment {
  id: string;
  model_id: string;
  environment_id: string;
  status: DeploymentStatus;
  endpoint_url: string | null;
  port: number | null;
  total_calls: number;
  avg_latency_ms: number | null;
  last_called_at: string | null;
  created_at: string;
  deployed_at: string | null;
  stopped_at: string | null;
  model: ModelArtifact;
}

export interface PredictResult {
  deployment_id: string;
  model_id: string;
  algorithm: string;
  prediction: any[];
  prediction_label: string | null;
}

export interface LogsResult {
  deployment_id: string;
  logs: string[];
}

function authHeaders(token: string) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

function baseUrl(environmentId: string) {
  return `${API_BASE}/deployments/environments/${environmentId}`;
}

export async function listDeployments(
  token: string,
  environmentId: string
): Promise<Deployment[]> {
  const res = await fetch(baseUrl(environmentId), {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Failed to fetch deployments");
  return res.json();
}

export async function getDeployment(
  token: string,
  environmentId: string,
  deploymentId: string
): Promise<Deployment> {
  const res = await fetch(`${baseUrl(environmentId)}/${deploymentId}`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Failed to fetch deployment");
  return res.json();
}

export async function deployModel(
  token: string,
  environmentId: string,
  runId: string
): Promise<Deployment> {
  const res = await fetch(baseUrl(environmentId), {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ run_id: runId }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail ?? "Failed to deploy model");
  }
  return res.json();
}

export async function undeployModel(
  token: string,
  environmentId: string,
  deploymentId: string
): Promise<Deployment> {
  const res = await fetch(`${baseUrl(environmentId)}/${deploymentId}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail ?? "Failed to undeploy model");
  }
  return res.json();
}

export async function predict(
  token: string,
  environmentId: string,
  deploymentId: string,
  features: Record<string, any>
): Promise<PredictResult> {
  const res = await fetch(`${baseUrl(environmentId)}/${deploymentId}/predict`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ features }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail ?? "Prediction failed");
  }
  return res.json();
}

export async function getLogs(
  token: string,
  environmentId: string,
  deploymentId: string,
  tail = 100
): Promise<LogsResult> {
  const res = await fetch(
    `${baseUrl(environmentId)}/${deploymentId}/logs?tail=${tail}`,
    { headers: authHeaders(token) }
  );
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail ?? "Failed to fetch logs");
  }
  return res.json();
}
