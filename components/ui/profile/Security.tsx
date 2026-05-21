"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth/AuthContext";

// ─── Types ────────────────────────────────────────────────────────────────────

type SaveStatus = "idle" | "saving" | "success" | "error";

type PasswordForm = {
  current: string;
  next:    string;
  confirm: string;
};

// ─── Button config ────────────────────────────────────────────────────────────

const buttonClass: Record<SaveStatus, string> = {
  idle:    "bg-[var(--primary)] hover:bg-[var(--accent-3)] cursor-pointer",
  saving:  "bg-[var(--accent-2)] cursor-not-allowed",
  success: "bg-green-600 cursor-default",
  error:   "bg-red-600 cursor-default",
};

const buttonLabel: Record<SaveStatus, string> = {
  idle:    "Update Password",
  saving:  "Updating...",
  success: "Updated ✓",
  error:   "Failed ✗",
};

// ─── PasswordInput ────────────────────────────────────────────────────────────

function PasswordInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
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

// ─── Component ────────────────────────────────────────────────────────────────

export default function Security() {
  const { token, logout } = useAuth();
  const router = useRouter();

  const [form,   setForm]   = useState<PasswordForm>({ current: "", next: "", confirm: "" });
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [error,  setError]  = useState<string | null>(null);
  const [twoFA,  setTwoFA]  = useState(false);

  const isDirty = form.current !== "" && form.next !== "" && form.confirm !== "";

  const handleSave = async () => {
    if (!token || !isDirty) return;

    // Validation côté client
    if (form.next !== form.confirm) {
      setError("New passwords do not match");
      return;
    }
    if (form.next.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (!form.next.split("").some((c) => c >= "A" && c <= "Z")) {
      setError("Password must contain at least one uppercase letter");
      return;
    }
    if (!form.next.split("").some((c) => c >= "0" && c <= "9")) {
      setError("Password must contain at least one digit");
      return;
    }

    setError(null);
    setStatus("saving");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/me/password`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            current_password: form.current,
            new_password:     form.next,
            confirm_password: form.confirm,
          }),
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Failed to update password");
      }

      setStatus("success");

      // Forcer logout après 1.5s
      setTimeout(() => {
        logout();
        router.push("/auth/login");
      }, 1500);

    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "An error occurred");
      setStatus("error");
      setTimeout(() => setStatus("idle"), 2200);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full">

      {/* Change Password */}
      <div className="bg-[var(--card)] rounded-[var(--radius-card)] p-8">
        <h2 className="text-lg font-semibold text-[var(--card-foreground)] mb-7 tracking-tight">
          Change Password
        </h2>

        <div className="flex flex-col gap-5">
          <PasswordInput
            label="Current Password"
            value={form.current}
            onChange={(v) => setForm((p) => ({ ...p, current: v }))}
          />
          <PasswordInput
            label="New Password"
            value={form.next}
            onChange={(v) => setForm((p) => ({ ...p, next: v }))}
          />
          <PasswordInput
            label="Confirm New Password"
            value={form.confirm}
            onChange={(v) => setForm((p) => ({ ...p, confirm: v }))}
          />
        </div>

        {error && (
          <p className="mt-4 text-xs font-medium text-red-500">{error}</p>
        )}

        {status === "success" && (
          <p className="mt-4 text-xs font-medium text-green-600">
            Password updated — redirecting to login...
          </p>
        )}

        <div className="mt-7">
          <button
            onClick={handleSave}
            disabled={status === "saving" || !isDirty}
            className={`px-5 py-2.5 rounded-[var(--radius-component)]
              text-sm font-semibold text-white transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
              ${buttonClass[status]}`}
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
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow
                transition-transform duration-200 ${twoFA ? "translate-x-5" : "translate-x-0"}`}
            />
          </button>
        </div>
        {twoFA && (
          <p className="mt-4 text-xs text-[var(--text-3)]">
            2FA is not yet implemented — coming soon.
          </p>
        )}
      </div>

    </div>
  );
}