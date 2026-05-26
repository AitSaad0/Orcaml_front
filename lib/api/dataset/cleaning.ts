// ─────────────────────────────────────────────────────────────────────────────
// OrcaML — Enhanced Cleaning API v2.0
// ─────────────────────────────────────────────────────────────────────────────

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// ── Types ──────────────────────────────────────────────────────────────────

export type ColumnDtype = "numeric" | "categorical" | "text" | "datetime";
export type SuggestedAction = "clean" | "keep" | "drop" | "target";
export type ColumnAction = "clean" | "keep" | "drop" | "target";
export type MissingStrategy = "MEDIAN" | "MEAN" | "MODE" | "DROP_ROWS" | "CONSTANT";
export type EncodingMethod = "ONE_HOT" | "LABEL" | "ORDINAL" | "none";
export type ScalingMethod = "STANDARD" | "MIN_MAX" | "ROBUST" | "none";
export type OutlierMethod = "iqr" | "zscore" | "clip" | "none";
export type CleaningStatus = "pending" | "cleaning" | "ready" | "failed" | "rolled_back";

export interface ColumnSchema {
  name: string;
  dtype: ColumnDtype;
  null_count: number;
  null_pct: number;
  unique_count: number;
  sample_values: (string | number)[];
  suggested_action: SuggestedAction;
}

export interface DatasetSchemaResponse {
  environment_id: string;
  total_rows: number;
  total_columns: number;
  columns: ColumnSchema[];
}

export interface ColumnRule {
  column: string;
  action: ColumnAction;
  missing_strategy?: MissingStrategy;
  fill_value?: string | number;
  scaling_method?: ScalingMethod;
  outlier_method?: OutlierMethod;
  encoding_method?: EncodingMethod;
}

export interface CleaningConfigCreate {
  missing_strategy: MissingStrategy;
  remove_duplicates: boolean;
  encoding_method: EncodingMethod;
  scaling_method: ScalingMethod;
  version: "V1" | "V2";
  column_rules: ColumnRule[];
}

export interface ColumnSummary {
  column: string;
  action: ColumnAction;
  details: string;
}

export interface ReviewResponse {
  environment_id: string;
  config_id: string;
  remove_duplicates: boolean;
  columns_to_clean: number;
  columns_to_drop: number;
  columns_to_keep: number;
  target_column: string | null;
  column_summary: ColumnSummary[];
}

export interface CleaningJobResponse {
  id: string;
  status: CleaningStatus;
  rows_before?: number;
  rows_after?: number;
}

export interface ColumnReport {
  action: ColumnAction;
  nulls_before?: number;
  nulls_after?: number;
  outliers_removed?: number;
  scaling?: ScalingMethod;
  encoding?: EncodingMethod;
  new_columns?: string[];
}

export interface CleaningReportResponse {
  cleaned_dataset_id: string;
  environment_id: string;
  status: CleaningStatus;
  rows_before: number;
  rows_after: number;
  duplicates_removed: number;
  cleaned_at: string;
  rolled_back: boolean;
  columns: Record<string, ColumnReport>;
}

export interface PreviewResponse {
  cleaned_dataset_id: string;
  total_rows: number;
  columns: string[];
  rows: Record<string, string | number>[];
}

export interface RollbackResponse {
  cleaned_dataset_id: string;
  rolled_back: boolean;
  rolled_back_at: string;
  message: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function headers(token: string) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.detail ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ── Phase 1 — Dataset Schema ───────────────────────────────────────────────

export async function getDatasetSchema(
  token: string,
  envId: string
): Promise<DatasetSchemaResponse> {
  const res = await fetch(`${BASE}/environments/${envId}/datasets/schema`, {
    headers: headers(token),
  });
  return handle<DatasetSchemaResponse>(res);
}

// ── Phase 2 — Save Cleaning Config ────────────────────────────────────────

export async function saveCleaningConfig(
  token: string,
  envId: string,
  config: CleaningConfigCreate
): Promise<{ id: string }> {
  const res = await fetch(`${BASE}/environments/${envId}/cleaning/config`, {
    method: "POST",
    headers: headers(token),
    body: JSON.stringify(config),
  });
  return handle<{ id: string }>(res);
}

// ── Phase 3 — Config Review ────────────────────────────────────────────────

export async function getCleaningReview(
  token: string,
  envId: string
): Promise<ReviewResponse> {
  const res = await fetch(`${BASE}/environments/${envId}/cleaning/review`, {
    headers: headers(token),
  });
  return handle<ReviewResponse>(res);
}

// ── Phase 4 — Trigger + Status ────────────────────────────────────────────

export async function triggerCleaning(
  token: string,
  envId: string
): Promise<CleaningJobResponse> {
  const res = await fetch(`${BASE}/environments/${envId}/cleaning/trigger`, {
    method: "POST",
    headers: headers(token),
  });
  return handle<CleaningJobResponse>(res);
}

export async function getCleaningStatus(
  token: string,
  envId: string,
  jobId: string
): Promise<CleaningJobResponse> {
  const res = await fetch(
    `${BASE}/environments/${envId}/cleaning/${jobId}/status`,
    { headers: headers(token) }
  );
  return handle<CleaningJobResponse>(res);
}

// ── Phase 5 — Report ───────────────────────────────────────────────────────

export async function getCleaningReport(
  token: string,
  envId: string,
  jobId: string
): Promise<CleaningReportResponse> {
  const res = await fetch(
    `${BASE}/environments/${envId}/cleaning/${jobId}/report`,
    { headers: headers(token) }
  );
  return handle<CleaningReportResponse>(res);
}

// ── Phase 5b — Preview ─────────────────────────────────────────────────────

export async function getCleanedPreview(
  token: string,
  envId: string,
  jobId: string,
  rows = 50
): Promise<PreviewResponse> {
  const res = await fetch(
    `${BASE}/environments/${envId}/cleaning/${jobId}/preview?rows=${rows}`,
    { headers: headers(token) }
  );
  return handle<PreviewResponse>(res);
}

// ── Phase 5c — Rollback ────────────────────────────────────────────────────

export async function rollbackCleaning(
  token: string,
  envId: string,
  jobId: string
): Promise<RollbackResponse> {
  const res = await fetch(
    `${BASE}/environments/${envId}/cleaning/${jobId}/rollback`,
    { method: "POST", headers: headers(token) }
  );
  return handle<RollbackResponse>(res);
}