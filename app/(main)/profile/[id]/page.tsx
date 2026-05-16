"use client";

import { useState } from "react";
import { User, Shield, BarChart2, KeyRound, Bell } from "lucide-react";
import PersonalInfo  from "@/components/ui/profile/PersonalInformation";
import Security      from "@/components/ui/profile/Security"
import Statistics    from "@/components/ui/profile/Statistics";
import ApiKeys       from "@/components/ui/profile/ApiKeys";
import Preferences   from "@/components/ui/profile/Preferences";
import { PersonalInfoData } from "@/interfaces/profile/PersonalInfoData";

type TabId = "personal" | "security" | "statistics" | "api-keys" | "preferences";

interface Tab {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

const tabs: Tab[] = [
  { id: "personal",    label: "Personal Info", icon: <User size={16} /> },
  { id: "security",    label: "Security",      icon: <Shield size={16} /> },
  { id: "statistics",  label: "Statistics",    icon: <BarChart2 size={16} /> },
  { id: "api-keys",    label: "API Keys",      icon: <KeyRound size={16} /> },
  { id: "preferences", label: "Preferences",   icon: <Bell size={16} /> },
];

const profileData: PersonalInfoData = {
  id: "1",
  firstName: "Saad",
  lastName: "Amzazi",
  email: "saad@example.com",
};

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<TabId>("personal");

  return (
    <div className="min-h-screen bg-[var(--background)] p-6 md:p-10">
      <h1 className="text-xl font-semibold text-[var(--foreground)] mb-6 tracking-tight">
        Profile
      </h1>

      <div className="flex gap-6 items-start">
        <nav className="w-52 shrink-0 flex flex-col gap-1">
          {tabs.map(({ id, label, icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-[var(--radius-component)]
                  text-sm font-medium w-full text-left transition-all duration-150
                  ${isActive
                    ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                    : "text-[var(--text-2)] hover:bg-[var(--bg-2)] hover:text-[var(--foreground)]"
                  }`}
              >
                <span className={isActive ? "opacity-100" : "opacity-60"}>{icon}</span>
                {label}
              </button>
            );
          })}
        </nav>

        <div className="flex-1 min-w-0">
          {activeTab === "personal"    && <PersonalInfo {...profileData} />}
          {activeTab === "security"    && <Security />}
          {activeTab === "statistics"  && <Statistics />}
          {activeTab === "api-keys"    && <ApiKeys />}
          {activeTab === "preferences" && <Preferences />}
        </div>
      </div>
    </div>
  );
}