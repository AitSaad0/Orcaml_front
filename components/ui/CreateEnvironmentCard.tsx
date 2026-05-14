"use client"

import { Plus } from "lucide-react";


export default function CreateEnvironmentCard() {
  return (
    <button
       onClick={() => console.log("create")}
      className="w-full border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-colors rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer group"
    >
        <div className="w-12 h-12 rounded-full bg-primary/30 border border-primary/40 group-hover:bg-primary/40 transition-colors flex items-center justify-center">    
          <Plus size={22} className="text-primary" />
        </div>
        <div className="text-center">
            <p className="text-base font-semibold text-foreground">Create Environment</p>
            <p className="text-sm text-muted-foreground mt-0.5">Set up a new ML workspace</p>
        </div>
    </button>
  );
}