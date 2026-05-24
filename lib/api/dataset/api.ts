const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` };
}

// ─── TYPES ───────────────────────────────────────────────

export type MissingStrategy = "mean" | "median" | "mode" | "drop";
export type EncodingMethod  = "one_hot" | "label" | "ordinal";
export type ScalingMethod   = "standard" | "minmax" | "robust" | "none";
export type CleaningVersion = "V1" | "V2";

export interface Dataset {
  id: string;
  env_id: string;
  filename: string;
  r2_path: string;
  created_at: string;
}

export interface UploadDatasetResponse {
  id: string;
  env_id: string;
  filename: string;
  r2_path: string;
  created_at: string;
}

export interface DataPreviewResponse {
  columns: { name: string; type: string }[];
  rows: Record<string, any>[];
  total_rows: number;
  total_columns: number;
  missing_per_column: Record<string, number>;
}

export interface ColumnStat {
  column: string;
  dtype: string;
  missing: number;
  mean?: number;
  median?: number;
  std?: number;
  min?: number;
  max?: number;
  unique_count?: number;
  top_value?: string;
}

export interface DataStatsResponse {
  dataset_id: string;
  total_rows: number;
  total_columns: number;
  duplicate_rows: number;
  columns: ColumnStat[];
}

export interface CleaningConfigCreate {
  missing_strategy:  MissingStrategy;
  remove_duplicates: boolean;
  encoding_method:   EncodingMethod;
  scaling_method:    ScalingMethod;
  version:           CleaningVersion;
}

export interface CleaningConfigResponse {
  id: string;
  environment_id: string;
  missing_strategy: MissingStrategy;
  remove_duplicates: boolean;
  encoding_method: EncodingMethod;
  scaling_method: ScalingMethod;
  version: CleaningVersion;
  created_at: string;
}

export interface CleanedDatasetResponse {
  id: string;
  environment_id: string;
  status: "PENDING" | "RUNNING" | "DONE" | "FAILED";
  r2_path: string | null;
  created_at: string;
}

// ─── DATASET ─────────────────────────────────────────────

export async function uploadDataset(
  token: string,
  file: File,
  envId: string
): Promise<UploadDatasetResponse> {
  // 🔍 LOGS DE DIAGNOSTIC
  console.group("📤 UPLOAD DATASET DEBUG");
  console.log("1. Token reçu:", token);
  console.log("2. Token présent?", !!token);
  console.log("3. Longueur du token:", token?.length);
  console.log("4. Env ID:", envId);
  console.log("5. Nom du fichier:", file.name);
  console.log("6. Taille du fichier:", file.size, "bytes");
  console.log("7. Type du fichier:", file.type);
  console.log("8. API_BASE:", API_BASE);
  console.log("9. URL complète:", `${API_BASE}/datasets/upload`);
  
  // Vérifie si le token a des espaces
  const cleanToken = token.trim();
  if (cleanToken !== token) {
    console.warn("⚠️ Le token avait des espaces, nettoyage automatique");
  }
  
  const headers = { Authorization: `Bearer ${cleanToken}` };
  console.log("10. Headers envoyés:", headers);
  
  const form = new FormData();
  form.append("file", file);
  form.append("env_id", envId);
  console.log("11. FormData créé avec succès");
  console.groupEnd();

  const res = await fetch(`${API_BASE}/datasets/upload`, {
    method: "POST",
    headers: headers,
    body: form,
  });
  
  // 🔍 LOGS DE RÉPONSE
  console.group("📥 UPLOAD RESPONSE");
  console.log("Status:", res.status);
  console.log("Status text:", res.statusText);
  console.log("Headers:", Object.fromEntries(res.headers.entries()));
  console.groupEnd();
  
  if (!res.ok) {
    const errorText = await res.text();
    console.error("❌ Erreur détaillée:", errorText);
    throw new Error(`Failed to upload dataset: ${res.status} - ${errorText}`);
  }
  
  const result = await res.json();
  console.log("✅ Upload réussi:", result);
  return result;
}

export async function listDatasets(
  token: string,
  envId: string
): Promise<Dataset[]> {
  const res = await fetch(`${API_BASE}/datasets/?env_id=${envId}`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Failed to list datasets");
  const data = await res.json();
  return data.datasets;
}

export async function getDataset(
  token: string,
  datasetId: string
): Promise<Dataset> {
  const res = await fetch(`${API_BASE}/datasets/${datasetId}`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Failed to get dataset");
  return res.json();
}

export async function deleteDataset(
  token: string,
  datasetId: string
): Promise<void> {
  const res = await fetch(`${API_BASE}/datasets/${datasetId}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Failed to delete dataset");
}

export async function previewDataset(
  token: string,
  datasetId: string
): Promise<DataPreviewResponse> {
  const res = await fetch(`${API_BASE}/datasets/${datasetId}/preview`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Failed to fetch preview");
  return res.json();
}

export async function statsDataset(
  token: string,
  datasetId: string
): Promise<DataStatsResponse> {
  const res = await fetch(`${API_BASE}/datasets/${datasetId}/stats`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Failed to fetch stats");
  return res.json();
}

// ─── CLEANING ────────────────────────────────────────────

export async function saveCleaningConfig(
  token: string,
  envId: string,
  config: CleaningConfigCreate
): Promise<CleaningConfigResponse> {
  const res = await fetch(`${API_BASE}/cleaning/${envId}/config`, {
    method: "POST",
    headers: { ...authHeaders(token), "Content-Type": "application/json" },
    body: JSON.stringify(config),
  });
  if (!res.ok) throw new Error("Failed to save cleaning config");
  return res.json();
}

export async function triggerCleaning(
  token: string,
  envId: string
): Promise<CleanedDatasetResponse> {
  const res = await fetch(`${API_BASE}/cleaning/${envId}/trigger`, {
    method: "POST",
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Failed to trigger cleaning");
  return res.json();
}

export async function getCleaningStatus(
  token: string,
  envId: string,
  cleanedId: string
): Promise<CleanedDatasetResponse> {
  const res = await fetch(`${API_BASE}/cleaning/${envId}/status/${cleanedId}`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Failed to get cleaning status");
  return res.json();
}