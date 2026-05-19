"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Toggle from "./Toggle";
import Notification from "./Notification";
import { NavBarProps } from "@/types/NavBarProps";
import { useAuth } from "@/context/auth/AuthContext";

export default function NavBar({ page }: NavBarProps) {
  const { user, logout } = useAuth();
  const router           = useRouter();

  function handleLogout() {
    logout();
    router.push("/auth/login");
  }

  // Initiales pour l'avatar (ex: "John Doe" → "JD")
  const initials = user?.full_name
    ? user.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <nav className="flex justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">

      {/* ── GAUCHE : logo + page ── */}
     {/* ── GAUCHE : logo seul ── */}
<div className="flex items-center">
  <h1 className="text-xl font-bold text-gray-900 dark:text-white">OrcaML</h1>
</div>

      {/* ── DROITE : notifications + toggle + user ── */}
      <div className="flex items-center gap-6 px-4">
        <Notification />
        <Toggle />

        {/* Séparateur */}
        <div className="w-px h-5 bg-gray-200 dark:bg-gray-700" />

        {/* User info + logout */}
        <div className="flex items-center gap-3">

          {/* Avatar initiales */}
          <div className="w-8 h-8 rounded-full bg-[#6366f1] flex items-center justify-center text-white text-[12px] font-semibold select-none">
            {initials}
          </div>

          {/* Nom affiché si disponible */}
          {user?.full_name && (
            <span className="text-[14px] font-medium text-gray-700 dark:text-gray-200 hidden sm:block">
              {user.full_name}
            </span>
          )}

          {/* Bouton logout */}
          <button
            onClick={handleLogout}
            className="text-[13px] text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
            title="Se déconnecter"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="1.8"
              strokeLinecap="round" strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>

        </div>
      </div>

    </nav>
  );
}