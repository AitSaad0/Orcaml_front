"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth/AuthContext";
import NavBar from "@/components/ui/NavBar";
import SideBar from "@/components/ui/SideBar";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { token, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !token) {
      router.replace("/auth/login");
    }
  }, [token, isLoading, router]);

  if (isLoading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Inter', sans-serif",
        color: "#777",
        fontSize: "14px",
      }}>
        Loading…
      </div>
    );
  }

  if (!token) return null;

  return (
    <div className="flex flex-col min-h-screen">
      {/* NavBar en haut */}
      <NavBar page="projects" />

      {/* SideBar + contenu */}
      <div className="flex flex-1 overflow-hidden">
        <SideBar />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}