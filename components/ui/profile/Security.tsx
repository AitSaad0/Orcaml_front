"use client";

import { useState } from "react";
import { SaveStatus } from "@/types/profile/SaveStatus";

type PasswordForm = {
  current: string;
  next: string;
  confirm: string;
};

type Session = {
  id: string;
  device: string;
  location: string;
  active: boolean;
};

const MOCK_SESSIONS: Session[] = [
  { id: "1", device: "Chrome on MacOS",  location: "San Francisco, US", active: true },
  { id: "2", device: "Safari on iPhone", location: "San Francisco, US", active: false },
];

const buttonClass: Record<SaveStatus, string> = {
  idle:    "bg-[var(--primary)] hover:bg-[var(--accent-3)] cursor-pointer",
  saving:  "bg-[var(--accent-2)] cursor-not-allowed",
  success: "bg-[var(--success)] cursor-default",
  error:   "bg-[var(--destructive)] cursor-default",
};

const buttonLabel: Record<SaveStatus, string> = {
  idle:    "Update Password",
  saving:  "Updating...",
  success: "Updated ✓",
  error:   "Failed ✗",
};

function PasswordInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[13px] font-medium text-[var(--text-2)]">{label}</label>
      <input
        type="password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-[var(--radius-component)] px-3.5 py-2.5
          bg-[var(--input-background)] text-[var(--foreground)] border border-[var(--border)]
          text-sm outline-none transition-all duration-150
          focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--ring)]/20"
      />
    </div>
  );
}

export default function Security() {
  const [form, setForm] = useState<PasswordForm>({ current: "", next: "", confirm: "" });
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [twoFA, setTwoFA] = useState(false);
  const [sessions, setSessions] = useState<Session[]>(MOCK_SESSIONS);

  const handleSave = async () => {
    setStatus("saving");
    await new Promise((res) => setTimeout(res, 900));
    setStatus("success");
    setTimeout(() => setStatus("idle"), 2200);
  };

  const revokeSession = (id: string) =>
    setSessions((prev) => prev.filter((s) => s.id !== id));

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Change Password */}
      <div className="bg-[var(--card)] rounded-[var(--radius-card)] p-8">
        <h2 className="text-lg font-semibold text-[var(--card-foreground)] mb-7 tracking-tight">
          Change Password
        </h2>
        <div className="flex flex-col gap-5">
          <PasswordInput label="Current Password" value={form.current} onChange={(v) => setForm((p) => ({ ...p, current: v }))} />
          <PasswordInput label="New Password"      value={form.next}    onChange={(v) => setForm((p) => ({ ...p, next: v }))} />
          <PasswordInput label="Confirm New Password" value={form.confirm} onChange={(v) => setForm((p) => ({ ...p, confirm: v }))} />
        </div>
        <div className="mt-7">
          <button
            onClick={handleSave}
            disabled={status === "saving"}
            className={`px-5 py-2.5 rounded-[var(--radius-component)]
              text-sm font-semibold text-[var(--primary-foreground)]
              transition-all duration-200 ${buttonClass[status]}`}
          >
            {buttonLabel[status]}
          </button>
        </div>
      </div>

      {/* 2FA */}
      <div className="bg-[var(--card)] rounded-[var(--radius-card)] p-8">
        <h2 className="text-lg font-semibold text-[var(--card-foreground)] mb-6 tracking-tight">
          Two-Factor Authentication
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-[var(--foreground)]">Enable 2FA</p>
            <p className="text-xs text-[var(--text-3)] mt-0.5">Add an extra layer of security</p>
          </div>
          <button
            onClick={() => setTwoFA((v) => !v)}
            className={`relative w-11 h-6 rounded-full transition-colors duration-200
              ${twoFA ? "bg-[var(--primary)]" : "bg-[var(--bg-4)]"}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow
              transition-transform duration-200 ${twoFA ? "translate-x-5" : "translate-x-0"}`}
            />
          </button>
        </div>
      </div>

      {/* Active Sessions */}
      <div className="bg-[var(--card)] rounded-[var(--radius-card)] p-8">
        <h2 className="text-lg font-semibold text-[var(--card-foreground)] mb-6 tracking-tight">
          Active Sessions
        </h2>
        <div className="flex flex-col gap-3">
          {sessions.map((session) => (
            <div key={session.id}
              className="flex items-center justify-between p-4 rounded-[var(--radius-component)] bg-[var(--bg-2)] border border-[var(--border)]"
            >
              <div>
                <p className="text-sm font-medium text-[var(--foreground)]">{session.device}</p>
                <p className="text-xs text-[var(--text-3)] mt-0.5">{session.location}</p>
              </div>
              <div className="flex items-center gap-3">
                {session.active && (
                  <span className="text-xs font-medium text-[var(--success)]">Active</span>
                )}
                <button
                  onClick={() => revokeSession(session.id)}
                  className="px-3 py-1.5 rounded-[var(--radius-component)] text-xs font-medium
                    border border-[var(--border)] text-[var(--text-2)]
                    hover:border-[var(--destructive)] hover:text-[var(--destructive)] transition-colors"
                >
                  Revoke
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 