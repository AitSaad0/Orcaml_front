"use client";

import { LayoutDashboard, Settings, User, Folder, ChevronDown, ChevronRight, Plus, Box } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth/AuthContext";
import { getProjects, Project } from "@/lib/api/project/api";
import { getEnvironments, Environment } from "@/lib/api/environment/api";
import { envCreatedEvent } from "@/lib/events";
import CreateEnvironmentModal from "@/components/ui/environment/CreateEnvironmentModal";

const CURRENT_USER_ID = "1";

export default function SideBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { token } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [openProject, setOpenProject] = useState<string | null>(null);
  const [envsByProject, setEnvsByProject] = useState<Record<string, Environment[]>>({});
  const [envModal, setEnvModal] = useState<{ open: boolean; projectId: string } | null>(null);

  useEffect(() => {
    if (!token) return;
    getProjects(token).then(setProjects).catch(console.error);
  }, [token]);

  function refreshEnvs(projectId: string) {
    if (!token) return;
    getEnvironments(token, projectId).then((envs) =>
      setEnvsByProject((prev) => ({ ...prev, [projectId]: envs }))
    );
  }

  // Listen for env created events from anywhere
  useEffect(() => {
    function handleEnvCreated(e: Event) {
      const { projectId } = (e as CustomEvent).detail;
      refreshEnvs(projectId);
    }
    window.addEventListener(envCreatedEvent, handleEnvCreated);
    return () => window.removeEventListener(envCreatedEvent, handleEnvCreated);
  }, [token]);

  async function toggleProject(projectId: string) {
    if (openProject === projectId) {
      setOpenProject(null);
      return;
    }
    setOpenProject(projectId);
    router.push(`/projects/${projectId}`);
    if (!envsByProject[projectId] && token) {
      try {
        const envs = await getEnvironments(token, projectId);
        setEnvsByProject((prev) => ({ ...prev, [projectId]: envs }));
      } catch {
        setEnvsByProject((prev) => ({ ...prev, [projectId]: [] }));
      }
    }
  }

  return (
    <>
      <aside className="w-64 h-full border-r border-[var(--border)] bg-[var(--sidebar)] flex flex-col justify-between">

        {/* Top */}
        <div className="flex flex-col p-3 gap-0.5 overflow-y-auto">
          <Link
            href="/dashboard"
            className={`flex items-center gap-3 px-3 py-2 rounded-[var(--radius-component)] text-sm transition-colors
              ${pathname === "/dashboard"
                ? "bg-[var(--primary)] text-white"
                : "text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)]"}`}
          >
            <LayoutDashboard size={16} />
            Dashboard
          </Link>

          <p className="text-xs text-[var(--text-3)] px-3 mt-4 mb-1 font-medium tracking-wider uppercase">
            Projects
          </p>

          {projects.map((project) => {
            const isOpen = openProject === project.id;
            const envs = envsByProject[project.id] ?? [];

            return (
              <div key={project.id}>
                <button
                  onClick={() => toggleProject(project.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-[var(--radius-component)] text-sm w-full transition-colors
                    ${pathname.startsWith(`/projects/${project.id}`)
                      ? "bg-[var(--sidebar-accent)] text-[var(--foreground)]"
                      : "text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)]"}`}
                >
                  {isOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                  <Folder size={14} />
                  <span className="truncate flex-1 text-left">{project.name}</span>
                </button>

                {isOpen && (
                  <div className="flex flex-col ml-5 mt-0.5 gap-0.5 border-l border-[var(--border)] pl-2">
                    {envs.map((env) => (
                      <Link
                        key={env.id}
                        href={`/projects/${project.id}/environments/${env.id}`}
                        className={`flex items-center gap-2 px-2 py-1.5 rounded-[var(--radius-component)] text-xs transition-colors
                          ${pathname.includes(env.id)
                            ? "text-[var(--primary)] bg-[var(--sidebar-accent)]"
                            : "text-[var(--text-3)] hover:text-[var(--foreground)] hover:bg-[var(--sidebar-accent)]"}`}
                      >
                        <Box size={12} />
                        <span className="truncate">{env.name}</span>
                        <span className={`ml-auto shrink-0 w-1.5 h-1.5 rounded-full
                          ${env.status === "active" ? "bg-[var(--success)]" : "bg-[var(--text-3)]"}`}
                        />
                      </Link>
                    ))}
                    <button
                      onClick={() => setEnvModal({ open: true, projectId: project.id })}
                      className="flex items-center gap-2 px-2 py-1.5 text-xs text-[var(--text-3)]
                        hover:text-[var(--primary)] transition-colors rounded-[var(--radius-component)]"
                    >
                      <Plus size={12} />
                      Add Environment
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom */}
        <div className="flex flex-col gap-0.5 p-3 border-t border-[var(--border)]">
          <Link
            href={`/profile/${CURRENT_USER_ID}`}
            className={`flex items-center gap-3 px-3 py-2 rounded-[var(--radius-component)] text-sm transition-colors
              ${pathname.startsWith("/profile")
                ? "bg-[var(--primary)] text-white"
                : "text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)]"}`}
          >
            <User size={16} />
            Profile
          </Link>
          <Link
            href="/settings"
            className={`flex items-center gap-3 px-3 py-2 rounded-[var(--radius-component)] text-sm transition-colors
              ${pathname === "/settings"
                ? "bg-[var(--primary)] text-white"
                : "text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)]"}`}
          >
            <Settings size={16} />
            Settings
          </Link>
        </div>
      </aside>

      {envModal?.open && (
        <CreateEnvironmentModal
          open={envModal.open}
          projectId={envModal.projectId}
          onClose={() => setEnvModal(null)}
          onCreated={() => setEnvModal(null)}
        />
      )}
    </>
  );
}