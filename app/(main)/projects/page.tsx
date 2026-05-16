import Link from "next/link";
import NavBar from "@/components/ui/NavBar";
import Sidebar from "@/components/ui/SideBar";

const projects = [
  { id: "1", name: "Churn Prediction" },
  { id: "2", name: "Fraud Detection"  },
];

export default function ProjectsPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Mes projets</h1>
      <div className="flex flex-col gap-4">
        {projects.map((p) => (
          <Link
            key={p.id}
            href={`/projects/${p.id}`}
            className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            {p.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
