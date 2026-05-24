"use client";

interface Props {
  open: boolean;
  name: string;
  loading: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export default function ConfirmDeleteModal({ open, name, loading, onConfirm, onClose }: Props) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-[var(--background)] border border-[var(--border)] rounded-[var(--radius-component)]
          p-5 w-[340px] flex flex-col gap-4 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-[var(--foreground)]">Confirm deletion</p>
          <p className="text-xs text-[var(--text-3)]">
            Are you sure you want to delete <span className="font-medium text-[var(--foreground)]">"{name}"</span>? This action cannot be undone.
          </p>
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs rounded-[var(--radius-component)] border border-[var(--border)]
              text-[var(--foreground)] hover:bg-[var(--sidebar-accent)] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-3 py-1.5 text-xs rounded-[var(--radius-component)] bg-red-500 text-white
              hover:bg-red-600 transition-colors disabled:opacity-50"
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}