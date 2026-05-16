"use client";

import { useState } from "react";
import { InputFieldProps } from "@/interfaces/profile/InputFieldProps";
import { PersonalInfoData } from "@/interfaces/profile/PersonalInfoData";
import { SaveStatus } from "@/types/profile/SaveStatus";

function InputField({ label, value, onChange, type = "text" }: InputFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[13px] font-medium text-[var(--text-2)]">
        {label}
      </label>
      <input
        type={type}
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

const buttonClass: Record<SaveStatus, string> = {
  idle:    "bg-[var(--primary)] hover:bg-[var(--accent-3)] cursor-pointer",
  saving:  "bg-[var(--accent-2)] cursor-not-allowed",
  success: "bg-[var(--success)] cursor-default",
  error:   "bg-[var(--destructive)] cursor-default",
};

const buttonLabel: Record<SaveStatus, string> = {
  idle:    "Save Changes",
  saving:  "Saving...",
  success: "Saved ✓",
  error:   "Failed ✗",
};

export default function PersonalInfo({ id, firstName, lastName, email }: PersonalInfoData) {
  const [form, setForm] = useState<PersonalInfoData>({ id, firstName, lastName, email });
  const [status, setStatus] = useState<SaveStatus>("idle");

  const handleChange = (field: keyof PersonalInfoData) => (val: string) =>
    setForm((prev) => ({ ...prev, [field]: val }));

  const handleSave = async () => {
    setStatus("saving");
    await new Promise((res) => setTimeout(res, 900));
    setStatus("success");
    setTimeout(() => setStatus("idle"), 2200);
  };

  return (
    <div className="bg-[var(--card)] rounded-[var(--radius-card)] p-8 w-full max-w-2xl">
      <h2 className="text-lg font-semibold text-[var(--card-foreground)] mb-7 tracking-tight">
        Personal Information
      </h2>

      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-4">
          <InputField label="First Name" value={form.firstName} onChange={handleChange("firstName")} />
          <InputField label="Last Name"  value={form.lastName}  onChange={handleChange("lastName")} />
        </div>
        <InputField label="Email" value={form.email} onChange={handleChange("email")} type="email" />
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
  );
}   