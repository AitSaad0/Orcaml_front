"use client";

import {
  LayoutDashboard, Settings, User, Folder,
  ChevronDown, ChevronRight, Plus, Box,
  MoreVertical, Pencil, Info, Trash2
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/auth/AuthContext";
import { getProjects, getProject, updateProject, deleteProject, Project } from "@/lib/api/project/api";
import { getEnvironments, getEnvironment, updateEnvironment, deleteEnvironment, Environment } from "@/lib/api/environment/api";
import CreateEnvironmentModal from "@/components/ui/environment/CreateEnvironmentModal";
import useEnvStore from "@/store/useEnvStore";
import SidebarMenu from "@/components/ui/sidebar/SidebarMenu";
import ConfirmDeleteModal from "@/components/ui/sidebar/ConfirmDeleteModal";
import RenameProjectModal from "@/components/ui/sidebar/RenameProjectModal";
import EditEnvironmentModal from "@/components/ui/sidebar/EditEnvironmentModal";
import InfoModal from "@/components/ui/sidebar/InfoModal";

const CURRENT_USER_ID = "1";

type ModalState =
  | { type: "delete-project"; project: Project }
  | { type: "delete-env"; env: Environment; projectId: string }
  | { type: "rename-project"; project: Project }
  | { type: "edit-env"; env: Environment; projectId: string }
  | { type: "info-project"; project: Project }
  | { type: "info-env"; env: Environment }
  | null;

export default function SideBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { token } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [openProject, setOpenProject] = useState<string | null>(null);
  const [envsByProject, setEnvsByProject] = useState<Record<string, Environment[]>>({});
  const [envModal, setEnvModal] = useState<{ open: boolean; projectId: string } | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalState>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const menuBtnRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const refreshProjectId = useEnvStore((s) => s.refreshProjectId);
  const projectRefresh = useEnvStore((s) => s.projectRefresh);
  const clearProjectRefresh = useEnvStore((s) => s.clearProjectRefresh);
  const clearRefresh = useEnvStore((s) => s.clearRefresh);

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

  useEffect(() => {
    if (refreshProjectId) {
      refreshEnvs(refreshProjectId);
      clearRefresh();
    }
  }, [refreshProjectId]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-menu]")) {
        setOpenMenuId(null);
      }
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  function refreshEnvs(projectId: string) {
    if (!token) return;
    getEnvironments(token, projectId).then((envs) =>
      setEnvsByProject((prev) => ({ ...prev, [projectId]: envs }))
    );
  }

  async function toggleProject(projectId: string) {
    if (openProject === projectId) { setOpenProject(null); return; }
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

  async function handleDeleteProject() {
    if (modal?.type !== "delete-project" || !token) return;
    setActionLoading(true);
    try {
      await deleteProject(token, modal.project.id);
      setProjects((prev) => prev.filter((p) => p.id !== modal.project.id));
      if (openProject === modal.project.id) setOpenProject(null);
      setModal(null);
    } catch (e) { console.error(e); }
    finally { setActionLoading(false); }
  }

  async function handleRenameProject(name: string, description: string) {
    if (modal?.type !== "rename-project" || !token) return;
    setActionLoading(true);
    try {
      const updated = await updateProject(token, modal.project.id, { name, description });
      setProjects((prev) => prev.map((p) => p.id === updated.id ? updated : p));
      setModal(null);
    } catch (e) { console.error(e); }
    finally { setActionLoading(false); }
  }

  async function handleDeleteEnv() {
    if (modal?.type !== "delete-env" || !token) return;
    setActionLoading(true);
    try {
      await deleteEnvironment(token, modal.projectId, modal.env.id);
      setEnvsByProject((prev) => ({
        ...prev,
        [modal.projectId]: (prev[modal.projectId] ?? []).filter((e) => e.id !== modal.env.id),
      }));
      setModal(null);
    } catch (e) { console.error(e); }
    finally { setActionLoading(false); }
  }

  async function handleEditEnv(data: { name: string; target_column: string; task_type: string; status: string }) {
    if (modal?.type !== "edit-env" || !token) return;
    setActionLoading(true);
    try {
      const updated = await updateEnvironment(token, modal.projectId, modal.env.id, data);
      setEnvsByProject((prev) => ({
        ...prev,
        [modal.projectId]: (prev[modal.projectId] ?? []).map((e) => e.id === updated.id ? updated : e),
      }));
      setModal(null);
    } catch (e) { console.error(e); }
    finally { setActionLoading(false); }
  }

  async function openProjectInfo(project: Project) {
    if (!token) return;
    try {
      const full = await getProject(token, project.id);
      setModal({ type: "info-project", project: full });
    } catch { setModal({ type: "info-project", project }); }
  }

  async function openEnvInfo(env: Environment, projectId: string) {
    if (!token) return;
    try {
      const full = await getEnvironment(token, projectId, env.id);
      setModal({ type: "info-env", env: full });
    } catch { setModal({ type: "info-env", env }); }
  }

  return (
    <>
      <aside className="w-64 h-full border-r border-[var(--border)] bg-[var(--sidebar)] flex flex-col justify-between">

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

          <span className="text-xs text-[var(--text-3)] px-3 mt-4 mb-1 font-medium tracking-wider uppercase">
            Projects
          </span>

          {projects.map((project) => {
            const isOpen = openProject === project.id;
            const envs = envsByProject[project.id] ?? [];

            return (
              <div key={project.id}>

                {/* projet row */}
                <div
                  className={`group flex items-center rounded-[var(--radius-component)] transition-colors
                    ${pathname.startsWith(`/projects/${project.id}`)
                      ? "bg-[var(--sidebar-accent)]"
                      : "hover:bg-[var(--sidebar-accent)]"}`}
                >
                  <button
                    onClick={() => toggleProject(project.id)}
                    className="flex items-center gap-2 px-3 py-2 text-sm flex-1 min-w-0 text-[var(--sidebar-foreground)]"
                  >
                    {isOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                    <Folder size={14} />
                    <span className="truncate flex-1 text-left">{project.name}</span>
                  </button>

                  <div className="relative pr-1">
                    <button
                      data-menu
                      ref={(el) => { menuBtnRefs.current[`proj-${project.id}`] = el; }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === `proj-${project.id}` ? null : `proj-${project.id}`);
                      }}
                      className="opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center
                        rounded text-[var(--text-3)] hover:text-[var(--foreground)] hover:bg-[var(--border)]
                        transition-opacity"
                    >
                      <MoreVertical size={12} />
                    </button>

                    {openMenuId === `proj-${project.id}` && (
                      <SidebarMenu
                        anchorRef={{ current: menuBtnRefs.current[`proj-${project.id}`] } as React.RefObject<HTMLButtonElement>}
                        onClose={() => setOpenMenuId(null)}
                        items={[
                          {
                            label: "Rename",
                            icon: <Pencil size={13} />,
                            onClick: () => setModal({ type: "rename-project", project }),
                          },
                          {
                            label: "Info",
                            icon: <Info size={13} />,
                            onClick: () => openProjectInfo(project),
                          },
                          {
                            label: "Delete",
                            icon: <Trash2 size={13} />,
                            onClick: () => setModal({ type: "delete-project", project }),
                            danger: true,
                          },
                        ]}
                      />
                    )}
                  </div>
                </div>

                {/* envs */}
                {isOpen && (
                  <div className="flex flex-col ml-5 mt-0.5 gap-0.5 border-l border-[var(--border)] pl-2">
                    {envs.map((env) => (
                      <div
                        key={env.id}
                        className={`group flex items-center rounded-[var(--radius-component)] transition-colors
                          ${pathname.includes(env.id)
                            ? "bg-[var(--sidebar-accent)]"
                            : "hover:bg-[var(--sidebar-accent)]"}`}
                      >
                        <Link
                          href={`/projects/${project.id}/environments/${env.id}`}
                          className={`flex items-center gap-2 px-2 py-1.5 text-xs flex-1 min-w-0
                            ${pathname.includes(env.id)
                              ? "text-[var(--primary)]"
                              : "text-[var(--text-3)] hover:text-[var(--foreground)]"}`}
                        >
                          <Box size={12} />
                          <span className="truncate">{env.name}</span>
                          <span className={`ml-auto shrink-0 w-1.5 h-1.5 rounded-full
                            ${env.status === "running" ? "bg-[var(--success)]" : "bg-[var(--text-3)]"}`}
                          />
                        </Link>

                        <div className="relative pr-0.5">
                          <button
                            data-menu
                            ref={(el) => { menuBtnRefs.current[`env-${env.id}`] = el; }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(openMenuId === `env-${env.id}` ? null : `env-${env.id}`);
                            }}
                            className="opacity-0 group-hover:opacity-100 w-4 h-4 flex items-center justify-center
                              rounded text-[var(--text-3)] hover:text-[var(--foreground)] hover:bg-[var(--border)]
                              transition-opacity"
                          >
                            <MoreVertical size={11} />
                          </button>

                          {openMenuId === `env-${env.id}` && (
                            <SidebarMenu
                              anchorRef={{ current: menuBtnRefs.current[`env-${env.id}`] } as React.RefObject<HTMLButtonElement>}
                              onClose={() => setOpenMenuId(null)}
                              items={[
                                {
                                  label: "Edit",
                                  icon: <Pencil size={13} />,
                                  onClick: () => setModal({ type: "edit-env", env, projectId: project.id }),
                                },
                                {
                                  label: "Info",
                                  icon: <Info size={13} />,
                                  onClick: () => openEnvInfo(env, project.id),
                                },
                                {
                                  label: "Delete",
                                  icon: <Trash2 size={13} />,
                                  onClick: () => setModal({ type: "delete-env", env, projectId: project.id }),
                                  danger: true,
                                },
                              ]}
                            />
                          )}
                        </div>
                      </div>
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

      {modal?.type === "delete-project" && (
        <ConfirmDeleteModal
          open
          name={modal.project.name}
          loading={actionLoading}
          onConfirm={handleDeleteProject}
          onClose={() => setModal(null)}
        />
      )}

      {modal?.type === "delete-env" && (
        <ConfirmDeleteModal
          open
          name={modal.env.name}
          loading={actionLoading}
          onConfirm={handleDeleteEnv}
          onClose={() => setModal(null)}
        />
      )}

      {modal?.type === "rename-project" && (
        <RenameProjectModal
          open
          project={modal.project}
          loading={actionLoading}
          onConfirm={handleRenameProject}
          onClose={() => setModal(null)}
        />
      )}

      {modal?.type === "edit-env" && (
        <EditEnvironmentModal
          open
          env={modal.env}
          loading={actionLoading}
          onConfirm={handleEditEnv}
          onClose={() => setModal(null)}
        />
      )}

      {modal?.type === "info-project" && (
        <InfoModal
          open
          title={modal.project.name}
          onClose={() => setModal(null)}
          fields={[
            { label: "ID", value: modal.project.id },
            { label: "Description", value: modal.project.description },
            { label: "Owner", value: modal.project.user_id },
            { label: "Created", value: new Date(modal.project.created_at).toLocaleString() },
          ]}
        />
      )}

      {modal?.type === "info-env" && (
        <InfoModal
          open
          title={modal.env.name}
          onClose={() => setModal(null)}
          fields={[
            { label: "ID", value: modal.env.id },
            { label: "Project", value: modal.env.project_id },
            { label: "Target column", value: modal.env.target_column },
            { label: "Task type", value: modal.env.task_type },
            { label: "Status", value: modal.env.status },
            { label: "Runs", value: modal.env.total_runs },
            { label: "Deployments", value: modal.env.total_deployments },
            { label: "Created", value: new Date(modal.env.created_at).toLocaleString() },
          ]}
        />
      )}

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