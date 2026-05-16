  const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

  // ─── Types ────────────────────────────────────────────────────────────────────

  export interface RegisterRequest {
    email: string;
    password: string;
    full_name?: string;
  }

  export interface LoginRequest {
    email: string;
    password: string;
  }

  export interface UserResponse {
    id: string;
    email: string;
    full_name: string | null;
    created_at: string;
  }

  export interface TokenResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
  }

  // ─── API Calls ────────────────────────────────────────────────────────────────

  export async function registerUser(data: RegisterRequest): Promise<UserResponse> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || "Registration failed");
    }
    return res.json();
  }

  export async function loginUser(data: LoginRequest): Promise<TokenResponse> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || "Invalid credentials");
    }
    return res.json();
  }

  export async function getMe(token: string): Promise<UserResponse> {
    const res = await fetch(`${API_BASE}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Unauthorized");
    return res.json();
  }