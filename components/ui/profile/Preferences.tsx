"use client";

import { useState } from "react";

type Preference = {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
};

const INITIAL: Preference[] = [
  { id: "email_runs",    label: "Email notifications for completed runs", description: "Get notified when training completes",  enabled: true },
  { id: "deployments",   label: "Deployment status updates",              description: "Alerts for deployment issues",           enabled: true },
  { id: "weekly",        label: "Weekly activity summary",                description: "Receive weekly reports",                 enabled: false },
  { id: "security",      label: "Security alerts",                        description: "Important security notifications",       enabled: false },
];

function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200
        ${enabled ? "bg-[var(--primary)]" : "bg-[var(--bg-4)]"}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow
        transition-transform duration-200 ${enabled ? "translate-x-5" : "translate-x-0"}`}
      />
    </button>
  );
}

export default function Preferences() {
  const [prefs, setPrefs] = useState<Preference[]>(INITIAL);

  const toggle = (id: string) =>
    setPrefs((prev) =>
      prev.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p))
    );

  return (
    <div className="bg-[var(--card)] rounded-[var(--radius-card)] p-8 w-full">
      <h2 className="text-lg font-semibold text-[var(--card-foreground)] mb-7 tracking-tight">
        Notification Preferences
      </h2>

      <div className="flex flex-col divide-y divide-[var(--border)]">
        {prefs.map((pref) => (
          <div key={pref.id} className="flex items-center justify-between py-5 first:pt-0 last:pb-0">
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