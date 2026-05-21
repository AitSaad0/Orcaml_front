"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth/AuthContext";
import { getProjects, Project } from "@/lib/api/project/api";
import { Folder, Plus, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import CreateProjectModal from "@/components/ui/project/CreateProjectModal";
import { getMe, UserResponse } from "@/lib/api/auth/auth";
export default function ProjectsPage() {
  const { token } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);


  useEffect(() => {
    if (!token) return;
    getProjects(token)
      .then(setProjects)
      .catch(() => setError("Failed to load projects."))
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div className="flex-1 flex flex-col p-8 w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Projects</h1>
          <p className="text-sm text-[var(--text-3)] mt-1">
            Manage your ML projects and environments
          </p>
        </div>
        <button 
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-[var(--radius-component)] text-sm font-medium
            bg-[var(--primary)] text-[var(--primary-foreground)]
            hover:bg-[var(--accent-3)] transition-colors"
        >
          <Plus size={15} />
          New Project
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center gap-3 text-[var(--text-3)] py-16 justify-center">
          <Loader2 size={18} className="animate-spin" />
          <span className="text-sm">Loading projects...</span>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="flex items-center gap-3 p-4 rounded-[var(--radius-card)]
          bg-[var(--bg-2)] border border-[var(--destructive)] text-[var(--destructive)]">
          <AlertCircle size={16} />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && projects.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-4 flex-1 w-full
          border border-dashed border-[var(--border-2)] rounded-[var(--radius-card)]
          bg-[var(--bg-2)]">
          <div className="w-12 h-12 rounded-full bg-[var(--bg-3)] flex items-center justify-center">
            <Folder size={22} className="text-[var(--text-3)]" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-[var(--foreground)]">No projects yet</p>
            <p className="text-xs text-[var(--text-3)] mt-1">
              Create your first project to get started
            </p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 mt-2 rounded-[var(--radius-component)] text-sm font-medium
              bg-[var(--primary)] text-[var(--primary-foreground)]
              hover:bg-[var(--accent-3)] transition-colors"
          >
            <Plus size={15} />
            New Project
          </button>
        </div>
      )}

      {/* Project list */}
      {!loading && !error && projects.length > 0 && (
        <div className="flex flex-col gap-3">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="group flex items-center gap-4 p-4 rounded-[var(--radius-card)]
                bg-[var(--card)] border border-[var(--border)]
                hover:border-[var(--primary)] hover:bg-[var(--bg-2)]
                transition-all duration-150"
            >
              <div className="w-9 h-9 rounded-[var(--radius-component)] flex items-center justify-center
                bg-[var(--bg-3)] group-hover:bg-[var(--primary)] transition-colors">
                <Folder size={16} className="text-[var(--text-2)] group-hover:text-white transition-colors" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--foreground)] truncate">
                  {project.name}
                </p>
                {project.description && (
                  <p className="text-xs text-[var(--text-3)] truncate mt-0.5">
                    {project.description}
                  </p>
                )}
              </div>
              <span className="text-xs text-[var(--text-3)] shrink-0">
                {new Date(project.created_at).toLocaleDateString()}
              </span>
            </Link>
          ))}
        </div>
      )}
      <CreateProjectModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={() => getProjects(token!).then(setProjects)}
      />
    </div>
  );
}