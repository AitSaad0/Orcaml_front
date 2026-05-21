"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Folder, Clock, Activity, Plus, Search, ArrowUpRight, MoreVertical, Filter } from "lucide-react";
import StatsCard from "../../ui/StatsCard";
import CreateProjectModal from "../../ui/project/CreateProjectModal";

interface Project {
  id: string;
  name: string;
  description: string;
  status: "active" | "inactive" | "deploying";
  lastUpdated: string;
  environments: number;
  deployments: number;
}

const mockProjects: Project[] = [
  {
    id: "1",
    name: "Production API",
    description: "Main production environment for customer-facing API",
    status: "active",
    lastUpdated: "2 hours ago",
    environments: 3,
    deployments: 12,
  },
  {
    id: "2",
    name: "ML Pipeline",
    description: "Machine learning data processing pipeline",
    status: "deploying",
    lastUpdated: "5 minutes ago",
    environments: 2,
    deployments: 8,
  },
  {
    id: "3",
    name: "Analytics Dashboard",
    description: "Internal analytics and reporting tool",
    status: "active",
    lastUpdated: "1 day ago",
    environments: 2,
    deployments: 5,
  },
  {
    id: "4",
    name: "Legacy Migration",
    description: "Migration from legacy monolith to microservices",
    status: "inactive",
    lastUpdated: "3 days ago",
    environments: 1,
    deployments: 3,
  },
];

export default function Dashboard() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>(mockProjects);

  const filteredProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleProjectCreated = () => {
    // TODO: refresh project list from API when available.
  };

  const getStatusColor = (status: Project["status"]) => {
    switch (status) {
      case "active":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "deploying":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "inactive":
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  return (
    <div className="flex flex-col gap-2 p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <h5 className="text-sm text-muted-foreground">
            Manage your projects and deployments
          </h5>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-accent-3 text-white rounded-[10px] text-sm font-semibold transition-colors"
        >
          <Plus size={16} />
          New Project
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 w-full">
        <StatsCard title="Total Projects" value={projects.length.toString()} icon={<Folder size={32} />} />
        <StatsCard title="Active Deployments" value="23" icon={<Activity size={32} />} />
        <StatsCard title="Last Activity" value="2m ago" icon={<Clock size={32} />} />
      </div>

      {/* Search */}
      <div className="flex items-center gap-4 mt-6 mb-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-[var(--bg-2)] border border-[var(--border-2)] rounded-[10px] text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-3 bg-[var(--bg-2)] border border-[var(--border-2)] rounded-[10px] text-sm text-muted-foreground hover:text-foreground transition-colors">
          <Filter size={16} />
          Filter
        </button>
      </div>

      <h3 className="py-2 text-lg font-semibold">Projects</h3>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProjects.map((project) => (
          <div
            key={project.id}
            onClick={() => router.push(`/projects/${project.id}`)}
            className="group relative bg-[var(--bg-2)] border border-[var(--border-2)] rounded-[10px] p-5 hover:border-primary/50 transition-all cursor-pointer"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
                {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
              </div>
              <button
                onClick={(e) => e.stopPropagation()}
                className="p-1 rounded-lg hover:bg-white/5 text-muted-foreground transition-colors"
              >
                <MoreVertical size={14} />
              </button>
            </div>

            <h3 className="text-base font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
              {project.name}
            </h3>
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {project.description}
            </p>

            <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
              <div className="flex items-center gap-1">
                <Folder size={12} />
                <span>{project.environments} envs</span>
              </div>
              <div className="flex items-center gap-1">
                <Activity size={12} />
                <span>{project.deployments} deploys</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[var(--border-2)]">
              <span className="text-xs text-muted-foreground/60">{project.lastUpdated}</span>
              <div className="flex items-center gap-1 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                <span>View</span>
                <ArrowUpRight size={12} />
              </div>
            </div>
          </div>
        ))}

        {/* Create New Card */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="group relative bg-[var(--bg-2)] border border-dashed border-[var(--border-2)] rounded-[10px] p-5 hover:border-primary/50 transition-all flex flex-col items-center justify-center gap-3 min-h-[200px]"
        >
          <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
            <Plus size={20} className="text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
            Create New Project
          </span>
        </button>
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-16">
          <Folder className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-muted-foreground">No projects found</p>
        </div>
      )}

      <CreateProjectModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={handleProjectCreated}
      />
    </div>
  );
}