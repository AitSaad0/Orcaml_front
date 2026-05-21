const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UserResponse {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
}

export interface UpdateUserRequest {
  full_name?: string;
  email?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function authHeaders(token: string) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

// ─── API Calls ────────────────────────────────────────────────────────────────

export async function getMe(token: string): Promise<UserResponse> {
  const res = await fetch(`${API_BASE}/users/me`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Failed to fetch user");
  return res.json();
}

export async function updateMe(
  body: UpdateUserRequest,
  token: string
): Promise<UserResponse> {
  const res = await fetch(`${API_BASE}/users/me`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || "Failed to update profile");
  }
  return res.json();
}
// ─── Types ────────────────────────────────────────────────────────────────────

export interface UserPreferences {
  email_runs:  boolean;
  deployments: boolean;
  weekly:      boolean;
  security:    boolean;
}

// ─── Preferences ──────────────────────────────────────────────────────────────

export async function getPreferences(token: string): Promise<UserPreferences> {
  const res = await fetch(`${API_BASE}/users/me/preferences`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Failed to fetch preferences");
  return res.json();
}

export async function updatePreferences(
  body: Partial<UserPreferences>,
  token: string
): Promise<UserPreferences> {
  const res = await fetch(`${API_BASE}/users/me/preferences`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Failed to update preferences");
  return res.json();
}