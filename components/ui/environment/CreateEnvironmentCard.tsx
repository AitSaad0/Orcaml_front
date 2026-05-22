"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import CreateEnvironmentModal from "@/components/ui/environment/CreateEnvironmentModal";

interface Props {
  projectId: string;
  onCreated: () => void;
}

export default function CreateEnvironmentCard({
  projectId,
  onCreated,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-colors rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer group"
      >
        <div className="w-12 h-12 rounded-full bg-primary/30 border border-primary/40 group-hover:bg-primary/40 transition-colors flex items-center justify-center">
          <Plus size={22} className="text-primary" />
        </div>

        <div className="text-center">
          <p className="text-base font-semibold text-foreground">
            Create Environment
          </p>

          <p className="text-sm text-muted-foreground mt-0.5">
            Set up a new ML workspace
          </p>
        </div>
      </button>

      <CreateEnvironmentModal
        open={open}
        projectId={projectId}
        onClose={() => setOpen(false)}
        onCreated={() => {
          setOpen(false);
          onCreated();
        }}
      />
    </>
  );
}