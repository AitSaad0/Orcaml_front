"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { getMe, UserResponse } from "@/lib/api/auth/auth";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AuthContextType {
  user: UserResponse | null;
  token: string | null;
  login: (token: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | null>(null);

// ─── Cookie helpers ───────────────────────────────────────────────────────────

const COOKIE_NAME = "orcaml_token";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 jours

function setCookie(value: string) {
  document.cookie = `${COOKIE_NAME}=${value}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

function deleteCookie() {
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0`;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]           = useState<UserResponse | null>(null);
  const [token, setToken]         = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("orcaml_token");
    if (!stored) { setIsLoading(false); return; }

    getMe(stored)
      .then((me) => {
        setToken(stored);
        setUser(me);
      })
      .catch(() => {
        localStorage.removeItem("orcaml_token");
        deleteCookie();
      })
      .finally(() => setIsLoading(false));
  }, []);

  async function login(accessToken: string) {
    try {
      const me = await getMe(accessToken);
      setToken(accessToken);
      setUser(me);
      localStorage.setItem("orcaml_token", accessToken);
      setCookie(accessToken);
    } catch {
      logout();
    }
  }

  function logout() {
    setUser(null);
    setToken(null);
    localStorage.removeItem("orcaml_token");
    deleteCookie();
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}