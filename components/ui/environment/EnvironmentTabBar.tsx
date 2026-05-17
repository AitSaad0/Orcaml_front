"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

interface Props {
  projectId: string;
  environmentId: string;
}

const TABS = [
  { label: "Dataset",     href: "dataset" },
  { label: "Cleaning",    href: "cleaning" },
  { label: "Runs",        href: "runs" },
  { label: "Deployments", href: "deployments" },
];

export default function EnvironmentTabBar({ projectId, environmentId }: Props) {
  const pathname = usePathname();
  const base = `/projects/${projectId}/environments/${environmentId}`;

  return (
    <div className="border-b border-border px-8 flex gap-1">
      {TABS.map((tab) => {
        const href = `${base}/${tab.href}`;
        const isActive = pathname.startsWith(href);
        return (
          <Link
            key={tab.href}
            href={href}
            className={`relative px-4 py-3 text-sm font-medium transition-colors duration-200
              ${isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            {tab.label}
            {isActive && (
              <motion.span
                layoutId="tab-underline"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
              />
            )}
          </Link>
        );
      })}
    </div>
  );
}