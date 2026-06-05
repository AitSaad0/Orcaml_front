"use client";

import { LayoutDashboard, Settings, User, Folder, ChevronDown, ChevronRight, Plus, Box } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth/AuthContext";
import { getProjects, Project } from "@/lib/api/project/api";
import { getEnvironments, Environment } from "@/lib/api/environment/api";
import CreateEnvironmentModal from "@/components/ui/environment/CreateEnvironmentModal";
import useEnvStore from "@/store/useEnvStore";

const CURRENT_USER_ID = "1";

export default function SideBar() {
  const pathname  = usePathname();
  const router    = useRouter();
  const { token } = useAuth();

  const [projects,       setProjects]       = useState<Project[]>([]);
  const [openProject,    setOpenProject]    = useState<string | null>(null);
  const [envsByProject,  setEnvsByProject]  = useState<Record<string, Environment[]>>({});
  const [envModal,       setEnvModal]       = useState<{ open: boolean; projectId: string } | null>(null);

  const refreshProjectId    = useEnvStore((s) => s.refreshProjectId);
  const projectRefresh      = useEnvStore((s) => s.projectRefresh);
  const clearProjectRefresh = useEnvStore((s) => s.clearProjectRefresh);
  const clearRefresh        = useEnvStore((s) => s.clearRefresh);

  useEffect(() => {
    if (!token) return;
    getProjects(token).then(setProjects).catch(console.error);
  }, [token]);

  useEffect(() => {
    if (projectRefresh && token) {
      getProjects(token).then(setProjects).catch(console.error);
      clearProjectRefresh();
    }
  }, [projectRefresh]);

  function refreshEnvs(projectId: string) {
    if (!token) return;
    getEnvironments(token, projectId).then((envs) =>
      setEnvsByProject((prev) => ({ ...prev, [projectId]: envs }))
    );
  }

  useEffect(() => {
    if (refreshProjectId) {
      refreshEnvs(refreshProjectId);
      clearRefresh();
    }
  }, [refreshProjectId]);

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
      <aside className="w-64 h-full flex flex-col justify-between bg-[var(--sidebar)] border-r border-[var(--border)]">

        <div>
          <div className="flex flex-col p-3 gap-0.5 overflow-y-auto mt-1">

            {/* Dashboard */}
            <Link
              href="/dashboard"
              className={`flex items-center gap-2.5 px-3 py-2 rounded-[var(--radius-component)] text-sm font-medium transition-all
                ${pathname === "/dashboard"
                  ? "bg-[var(--primary)] text-white shadow-sm"
                  : "text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)] hover:text-[var(--foreground)]"}`}
            >
              <LayoutDashboard size={15} />
              Dashboard
            </Link>

            {/* Projects label */}
            <div className="flex items-center justify-between px-3 mt-5 mb-2">
              <span className="text-[10px] font-semibold text-[var(--text-3)] uppercase tracking-widest">
                Projects
              </span>
              <span className="text-[10px] text-[var(--text-3)] bg-[var(--bg-3)] px-1.5 py-0.5 rounded-full font-medium">
                {projects.length}
              </span>
            </div>

            {/* Empty state */}
            {projects.length === 0 && (
              <p className="text-xs text-[var(--text-3)] px-3 py-2 italic">No projects yet</p>
            )}

            {/* Project list */}
            {projects.map((project) => {
              const isOpen   = openProject === project.id;
              const isActive = pathname.startsWith(`/projects/${project.id}`);
              const envs     = envsByProject[project.id] ?? [];

              return (
                <div key={project.id}>
                  <button
                    onClick={() => toggleProject(project.id)}
                    className={`group flex items-center gap-2 px-3 py-2.5 rounded-[var(--radius-component)] text-sm w-full transition-all
                      ${isActive
                        ? "bg-[var(--sidebar-accent)] text-[var(--foreground)] font-medium"
                        : "text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)] hover:text-[var(--foreground)]"}`}
                  >
                    <span className="text-[var(--text-3)]">
                      {isOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                    </span>
                    <div className="w-5 h-5 rounded-md bg-[var(--primary)]/10 flex items-center justify-center shrink-0">
                      <Folder size={12} className="text-[var(--primary)]" />
                    </div>
                    <span className="truncate flex-1 text-left text-[14px]">{project.name}</span>
                  </button>

                  {isOpen && (
                    <div className="flex flex-col ml-4 mt-0.5 mb-1 gap-0.5 border-l-2 border-[var(--border)] pl-3">
                      {envs.map((env) => {
                        const isEnvActive = pathname.includes(env.id);
                        return (
                          <Link
                            key={env.id}
                            href={`/projects/${project.id}/environments/${env.id}`}
                            className={`flex items-center gap-2 px-2.5 py-2 rounded-[var(--radius-component)] text-[13px] transition-all
                              ${isEnvActive
                                ? "text-[var(--primary)] bg-[var(--primary)]/8 font-medium"
                                : "text-[var(--text-3)] hover:text-[var(--foreground)] hover:bg-[var(--sidebar-accent)]"}`}
                          >
                            <Box size={12} className={isEnvActive ? "text-[var(--primary)]" : "text-[var(--text-3)]"} />
                            <span className="truncate flex-1">{env.name}</span>
                            <span className={`shrink-0 w-1.5 h-1.5 rounded-full transition-colors
                              ${env.status === "running" ? "bg-emerald-400" : "bg-[var(--border)]"}`}
                            />
                          </Link>
                        );
                      })}

                      <button
                        onClick={() => setEnvModal({ open: true, projectId: project.id })}
                        className="flex items-center gap-2 px-2.5 py-1.5 text-[12px] text-[var(--text-3)]
                          hover:text-[var(--primary)] hover:bg-[var(--primary)]/5 transition-all
                          rounded-[var(--radius-component)] group"
                      >
                        <Plus size={12} className="group-hover:rotate-90 transition-transform duration-150" />
                        Add Environment
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Bottom ── */}
        <div className="flex flex-col gap-0.5 p-3 border-t border-[var(--border)]">
          <Link
            href={`/profile/${CURRENT_USER_ID}`}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-[var(--radius-component)] text-sm font-medium transition-all
              ${pathname.startsWith("/profile")
                ? "bg-[var(--primary)] text-white shadow-sm"
                : "text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)] hover:text-[var(--foreground)]"}`}
          >
            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0
              ${pathname.startsWith("/profile") ? "bg-white/20" : "bg-[var(--bg-3)]"}`}>
              <User size={11} />
            </div>
            Profile
          </Link>

          <Link
            href="/settings"
            className={`flex items-center gap-2.5 px-3 py-2 rounded-[var(--radius-component)] text-sm font-medium transition-all
              ${pathname === "/settings"
                ? "bg-[var(--primary)] text-white shadow-sm"
                : "text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)] hover:text-[var(--foreground)]"}`}
          >
            <Settings size={15} />
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