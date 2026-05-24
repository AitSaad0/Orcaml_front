"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface MenuItem {
  label: string;
  icon: ReactNode;
  onClick: () => void;
  danger?: boolean;
  loading?: boolean;
}

interface Props {
  items: MenuItem[];
  onClose: () => void;
  anchorRef: React.RefObject<HTMLButtonElement>;
}

export default function SidebarMenu({ items, onClose, anchorRef }: Props) {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    if (anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 4, left: rect.left });
    }
  }, [anchorRef]);

  if (!pos) return null;

  return createPortal(
    <div
      data-menu
      style={{ position: "fixed", top: pos.top, left: pos.left, zIndex: 9999 }}
      className="min-w-[152px] rounded-[var(--radius-component)] border border-[var(--border)] bg-[var(--background)] shadow-md py-1"
      onClick={(e) => e.stopPropagation()}
    >
      {items.map((item, i) => (
        <button
          key={i}
          data-menu
          disabled={item.loading}
          onClick={() => {
            onClose();
            item.onClick();
          }}
          className={`flex items-center gap-2 w-full px-3 py-1.5 text-xs transition-colors disabled:opacity-50
            ${item.danger
              ? "text-red-500 hover:bg-red-500/10"
              : "text-[var(--foreground)] hover:bg-[var(--sidebar-accent)]"
            }`}
        >
          {item.icon}
          {item.label}
        </button>
      ))}
    </div>,
    document.body
  );
}