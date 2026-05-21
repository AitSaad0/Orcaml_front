"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth/AuthContext";
import { getPreferences, updatePreferences, UserPreferences } from "@/lib/api/users/api";

// ─── Types ────────────────────────────────────────────────────────────────────

type Preference = {
  id: keyof UserPreferences;
  label: string;
  description: string;
  enabled: boolean;
};

const PREFERENCE_META: Omit<Preference, "enabled">[] = [
  { id: "email_runs",  label: "Email notifications for completed runs", description: "Get notified when training completes" },
  { id: "deployments", label: "Deployment status updates",              description: "Alerts for deployment issues" },
  { id: "weekly",      label: "Weekly activity summary",                description: "Receive weekly reports" },
  { id: "security",    label: "Security alerts",                        description: "Important security notifications" },
];

// ─── Toggle ───────────────────────────────────────────────────────────────────

function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200
        ${enabled ? "bg-[var(--primary)]" : "bg-[var(--bg-4)]"}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow
          transition-transform duration-200 ${enabled ? "translate-x-5" : "translate-x-0"}`}
      />
    </button>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Preferences() {
  const { token } = useAuth();

  const [prefs,   setPrefs]   = useState<Preference[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  // ── Charger les préférences depuis l'API au montage ─────────────────────
  useEffect(() => {
    if (!token) return;

    getPreferences(token)
      .then((data) => {
        setPrefs(
          PREFERENCE_META.map((meta) => ({
            ...meta,
            enabled: data[meta.id] ?? false,
          }))
        );
      })
      .catch(() => setError("Failed to load preferences"))
      .finally(() => setLoading(false));
  }, [token]);

  // ── Toggle + PATCH immédiat (optimistic update) ──────────────────────────
  const toggle = async (id: keyof UserPreferences) => {
    if (!token) return;

    const updated = prefs.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p));
    setPrefs(updated); // optimistic — UI répond instantanément

    const payload = Object.fromEntries(
      updated.map((p) => [p.id, p.enabled])
    ) as Partial<UserPreferences>;

    try {
      await updatePreferences(payload, token);
    } catch {
      // Rollback si l'API échoue
      setPrefs(prefs);
      setError("Failed to save preference");
    }
  };

  // ── États de chargement / erreur ─────────────────────────────────────────
  if (loading) {
    return (
      <div className="bg-[var(--card)] rounded-[var(--radius-card)] p-8 w-full">
        <div className="h-5 w-48 bg-[var(--bg-3)] rounded animate-pulse mb-7" />
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex justify-between items-center py-5 border-b border-[var(--border)] last:border-0">
            <div className="space-y-2">
              <div className="h-4 w-56 bg-[var(--bg-3)] rounded animate-pulse" />
              <div className="h-3 w-40 bg-[var(--bg-3)] rounded animate-pulse" />
            </div>
            <div className="w-11 h-6 bg-[var(--bg-3)] rounded-full animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-[var(--card)] rounded-[var(--radius-card)] p-8 w-full">
      <h2 className="text-lg font-semibold text-[var(--card-foreground)] mb-7 tracking-tight">
        Notification Preferences
      </h2>

      {error && (
        <div className="mb-5 text-sm text-red-500 bg-red-50 border border-red-200 rounded-[10px] px-4 py-3">
          {error}
        </div>
      )}

      <div className="flex flex-col divide-y divide-[var(--border)]">
        {prefs.map((pref) => (
          <div
            key={pref.id}
            className="flex items-center justify-between py-5 first:pt-0 last:pb-0"
          >
            <div>
              <p className="text-sm font-medium text-[var(--foreground)]">{pref.label}</p>
              <p className="text-xs text-[var(--text-3)] mt-0.5">{pref.description}</p>
            </div>
            <Toggle enabled={pref.enabled} onToggle={() => toggle(pref.id)} />
          </div>
        ))}
      </div>
    </div>
  );
}