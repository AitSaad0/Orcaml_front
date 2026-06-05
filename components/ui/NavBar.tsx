"use client";

import Image from "next/image";
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

  const initials = user?.full_name
    ? user.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <nav className="flex justify-between items-center px-6 h-16 border-b border-[var(--border)] bg-[var(--card)]">

      {/* ── GAUCHE : logo centré dans le navbar ── */}
      <div className="flex items-center">
        <Image
          src="/logo 1.png"
          alt="OrcaML Logo"
          width={75}
          height={30}
          className="object-contain"
          priority
        />
      </div>

      {/* ── DROITE ── */}
      <div className="flex items-center gap-4">
        <Notification />
        <Toggle />

        <div className="w-px h-4 bg-[var(--border)]" />

        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-[#6366f1] flex items-center justify-center text-white text-[11px] font-semibold select-none">
            {initials}
          </div>

          {user?.full_name && (
            <span className="text-[13px] font-medium text-[var(--foreground)] hidden sm:block">
              {user.full_name}
            </span>
          )}

          <button
            onClick={handleLogout}
            className="text-[var(--text-3)] hover:text-red-500 transition-colors"
            title="Se déconnecter"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
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