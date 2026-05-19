const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// ─── Types ────────────────────────────────────────────────────────────────────

export type Algorithm =
  | "RANDOM_FOREST"
  | "LOGISTIC_REGRESSION"
  | "SVM"
  | "DECISION_TREE"
  | "KNN"
  | "XGBOOST"
  | "LINEAR_REGRESSION";

export type RunStatus = "PENDING" | "RUNNING" | "COMPLETED" | "FAILED" | "CANCELLED";

export interface TrainingConfigResponse {
  id: string;
  algorithm: Algorithm;
  hyperparameters: Record<string, unknown>;
  test_size: number;
  random_state: number;
  cross_validation: boolean;
  cv_folds: number;
  created_at: string;
}

export interface RunResponse {
  id: string;
  environment_id: string;
  algorithm: Algorithm;
  status: RunStatus;
  duration_seconds: number | null;
  is_manual: boolean;
  mlflow_run_id: string | null;
  accuracy: number | null;
  f1_score: number | null;
  precision: number | null;
  recall: number | null;
  rmse: number | null;
  mae: number | null;
  r2: number | null;
  created_at: string;
  started_at: string | null;
  finished_at: string | null;
  training_config: TrainingConfigResponse | null;
}

export interface BatchRunResponse {
  runs: RunResponse[];
  total: number;
  message: string;
}

export interface BatchRunCreate {
  algorithms: Algorithm[];
  hyperparameters?: Record<string, Record<string, unknown>>;
  test_size?: number;
  random_state?: number;
  cross_validation?: boolean;
  cv_folds?: number;
}

export interface AutoRunCreate {
  algorithms: Algorithm[];
  n_iter?: number;
  test_size?: number;
  random_state?: number;
  cross_validation?: boolean;
  cv_folds?: number;
}

// ─── API Calls ────────────────────────────────────────────────────────────────

function authHeaders(token: string) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function getRuns(
  environmentId: string,
  token: string
): Promise<RunResponse[]> {
  const res = await fetch(
    `${API_BASE}/environments/${environmentId}/runs`,
    { headers: authHeaders(token) }
  );
  if (!res.ok) throw new Error("Failed to fetch runs");
  return res.json();
}

export async function createBatchRuns(
  environmentId: string,
  body: BatchRunCreate,
  token: string
): Promise<BatchRunResponse> {
  const res = await fetch(
    `${API_BASE}/environments/${environmentId}/runs/batch`,
    {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify(body),
    }
  );
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || "Failed to create runs");
  }
  return res.json();
}

export async function createAutoRuns(
  environmentId: string,
  body: AutoRunCreate,
  token: string
): Promise<BatchRunResponse> {
  const res = await fetch(
    `${API_BASE}/environments/${environmentId}/runs/auto`,
    {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify(body),
    }
  );
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || "Failed to create auto runs");
  }
  return res.json();
}

export async function cancelRun(
  environmentId: string,
  runId: string,
  token: string
): Promise<void> {
  const res = await fetch(
    `${API_BASE}/environments/${environmentId}/runs/${runId}/cancel`,
    { method: "POST", headers: authHeaders(token) }
  );
  if (!res.ok) throw new Error("Failed to cancel run");
}
export async function getBestManualRun(
  environmentId: string,
  token: string
): Promise<RunResponse | null> {
  const res = await fetch(
    `${API_BASE}/environments/${environmentId}/runs/best-manual`,
    { headers: authHeaders(token) }
  );
  if (res.status === 404) return null; // pas encore de run complété
  if (!res.ok) throw new Error("Failed to fetch best manual run");
  return res.json();
}

export async function getBestAutoRun(
  environmentId: string,
  token: string
): Promise<RunResponse | null> {
  const res = await fetch(
    `${API_BASE}/environments/${environmentId}/runs/best-auto`,
    { headers: authHeaders(token) }
  );
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to fetch best auto run");
  return res.json();
}
export interface PredictRequest {
  features: Record<string, any>;
}

export interface PredictResponse {
  run_id: string;
  algorithm: string;
  prediction: any[];
  prediction_label?: string | null;
}

export async function predictRun(environmentId: string, runId: string, data: PredictRequest, token: string): Promise<PredictResponse> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/environments/${environmentId}/runs/${runId}/predict`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Prediction failed");
  }
  return res.json();
}