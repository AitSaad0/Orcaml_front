"use client";

import { LayoutDashboard, Settings, User, Folder, ChevronDown, ChevronRight, Plus } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const projects = [
  {
    id: "1",
    label: "Churn Prediction",
    environments: ["ChurnV1", "ChurnV2"],
  },
  {
    id: "2",
    label: "Fraud Detection",
    environments: ["FraudProd"],
  },
];

export default function SideBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [openProject, setOpenProject] = useState<string | null>(null);

  return (
    <aside className="w-64 h-full border-r border-gray-200 dark:border-gray-700 flex flex-col justify-between">
      
      {/* Top */}
      <div className="flex flex-col p-4 gap-1">
        <Link
          href="/dashboard"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
            pathname === "/dashboard" ? "bg-gray-800 text-white" : ""
          }`}
        >
          <LayoutDashboard size={16} />
          Dashboard
        </Link>

        <p className="text-xs text-gray-400 px-3 mt-4 mb-1">PROJECTS</p>

        {projects.map((project) => (
          <div key={project.id}>
            {/* Project Row */}
            <button
              onClick={() => {
                setOpenProject(openProject === project.id ? null : project.id);
                router.push(`/projects/${project.id}`);
              }}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm w-full hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {openProject === project.id ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              <Folder size={16} />
              {project.label}
            </button>

            {/* Environments */}
            {openProject === project.id && (
              <div className="flex flex-col ml-6 gap-1">
                {project.environments.map((env) => (
                  <Link
                    key={env}
                    href={`/projects/${project.id}/${env}`}
                    className="flex items-center gap-2 px-3 py-1 rounded-lg text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    • {env}
                  </Link>
                ))}
                <button className="flex items-center gap-2 px-3 py-1 text-sm text-gray-400 hover:text-gray-600">
                  <Plus size={14} />
                  Add Environment
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bottom */}
      <div className="flex flex-col gap-1 p-4 border-t border-gray-200 dark:border-gray-700">
        <Link
          href="/profile"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
            pathname === "/profile" ? "bg-gray-800 text-white" : ""
          }`}
        >
          <User size={16} />
          Profile
        </Link>
        <Link
          href="/settings"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
            pathname === "/settings" ? "bg-gray-800 text-white" : ""
          }`}
        >
          <Settings size={16} />
          Settings
        </Link>
      </div>

    </aside>
  );
}