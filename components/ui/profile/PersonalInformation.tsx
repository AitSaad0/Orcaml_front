"use client";

import { useState } from "react";
import { useAuth } from "@/context/auth/AuthContext";
import { updateMe } from "@/lib/api/users/api";
import { UserResponse } from "@/lib/api/auth/auth";

// ─── Types ────────────────────────────────────────────────────────────────────

type SaveStatus = "idle" | "saving" | "success" | "error";

interface InputFieldProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  type?: string;
  disabled?: boolean;
}

// ─── InputField ───────────────────────────────────────────────────────────────

function InputField({ label, value, onChange, type = "text", disabled = false }: InputFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[13px] font-medium text-[var(--text-2)]">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full rounded-[var(--radius-component)] px-3.5 py-2.5
          bg-[var(--input-background)] text-[var(--foreground)] border border-[var(--border)]
          text-sm outline-none transition-all duration-150
          focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--ring)]/20
          disabled:opacity-50 disabled:cursor-not-allowed"
      />
    </div>
  );
}

// ─── Button config ────────────────────────────────────────────────────────────

const buttonClass: Record<SaveStatus, string> = {
  idle:    "bg-[var(--primary)] hover:bg-[var(--accent-3)] cursor-pointer",
  saving:  "bg-[var(--accent-2)] cursor-not-allowed",
  success: "bg-green-600 cursor-default",
  error:   "bg-red-600 cursor-default",
};

const buttonLabel: Record<SaveStatus, string> = {
  idle:    "Save Changes",
  saving:  "Saving...",
  success: "Saved ✓",
  error:   "Failed ✗",
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  user: UserResponse;
  onUpdate?: (updated: UserResponse) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PersonalInformation({ user, onUpdate }: Props) {
  const { token } = useAuth();

  const [fullName, setFullName] = useState(user.full_name ?? "");
  const [email,    setEmail]    = useState(user.email);
  const [status,   setStatus]   = useState<SaveStatus>("idle");

  const isDirty = fullName !== (user.full_name ?? "") || email !== user.email;

  const handleSave = async () => {
    if (!token || !isDirty) return;
    setStatus("saving");
    try {
      const updated = await updateMe({ full_name: fullName, email }, token);
      onUpdate?.(updated);
      setStatus("success");
      setTimeout(() => setStatus("idle"), 2200);
    } catch (e) {
      console.error("error:", e);
      setStatus("error");
      setTimeout(() => setStatus("idle"), 2200);
    }
  };

  return (
    <div className="bg-[var(--card)] rounded-[var(--radius-card)] p-8 w-full max-w-2xl">
      <h2 className="text-lg font-semibold text-[var(--card-foreground)] mb-7 tracking-tight">
        Personal Information
      </h2>

      <div className="flex flex-col gap-5">
        <InputField
          label="Full Name"
          value={fullName}
          onChange={setFullName}
        />
        <InputField
          label="Email"
          value={email}
          onChange={setEmail}
          type="email"
        />
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-[var(--text-2)]">
            Member Since
          </label>
          <p className="text-sm text-[var(--text-3)] px-3.5 py-2.5 bg-[var(--bg-2)] rounded-[var(--radius-component)] border border-[var(--border)]">
            {new Date(user.created_at).toLocaleDateString("en-US", {
              year: "numeric", month: "long", day: "numeric",
            })}
          </p>
        </div>
      </div>

      <div className="mt-7">
        <button
          onClick={handleSave}
          disabled={status === "saving" || !isDirty}
          className={`px-5 py-2.5 rounded-[var(--radius-component)]
            text-sm font-semibold text-white transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
            ${status === "idle" && !isDirty ? "bg-[var(--primary)] opacity-50 cursor-not-allowed" : buttonClass[status]}`}
        >
          {buttonLabel[status]}
        </button>
      </div>
    </div>
  );
}