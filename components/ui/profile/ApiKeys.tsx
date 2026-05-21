"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth/AuthContext";
import { Copy, Trash2, Plus, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ApiKey {
  id:           string;
  name:         string;
  prefix:       string;
  created_at:   string;
  last_used_at: string | null;
}

interface ApiKeyCreated extends ApiKey {
  raw_key: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ApiKeys() {
  const { token } = useAuth();

  const [keys,       setKeys]       = useState<ApiKey[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);
  const [newKeyName, setNewKeyName] = useState("");
  const [creating,   setCreating]   = useState(false);
  const [createdKey, setCreatedKey] = useState<ApiKeyCreated | null>(null);
  const [copied,     setCopied]     = useState(false);
  const [showForm,   setShowForm]   = useState(false);

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const fetchKeys = () => {
    if (!token) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me/api-keys`, { headers })
      .then((r) => r.json())
      .then(setKeys)
      .catch(() => setError("Unable to load API keys"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchKeys(); }, [token]);

  const handleCreate = async () => {
    if (!token || !newKeyName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me/api-keys`, {
        method:  "POST",
        headers,
        body:    JSON.stringify({ name: newKeyName.trim() }),
      });
      if (!res.ok) throw new Error("Failed to create key");
      const data: ApiKeyCreated = await res.json();
      setCreatedKey(data);
      setNewKeyName("");
      setShowForm(false);
      fetchKeys();
    } catch {
      setError("Failed to create API key");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me/api-keys/${id}`, {
        method: "DELETE",
        headers,
      });
      setKeys((prev) => prev.filter((k) => k.id !== id));
    } catch {
      setError("Failed to delete API key");
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-4 w-full">

      {/* Header */}
      <div className="bg-[var(--card)] rounded-[var(--radius-card)] p-8">
        <div className="flex items-center justify-between mb-7">
          <div>
            <h2 className="text-lg font-semibold text-[var(--card-foreground)] tracking-tight">API Keys</h2>
            <p className="text-xs text-[var(--text-3)] mt-1">
              Use these keys to access the OrcaML API from external tools
            </p>
          </div>
          <button
            onClick={() => { setShowForm((v) => !v); setCreatedKey(null); }}
            className="flex items-center gap-2 px-4 py-2 rounded-[var(--radius-component)]
              bg-[var(--primary)] hover:bg-[var(--accent-3)]
              text-sm font-semibold text-[var(--primary-foreground)]
              transition-colors duration-150"
          >
            <Plus size={14} />
            New Key
          </button>
        </div>

        {/* Create form */}
        {showForm && (
          <div className="flex gap-3 mb-6 p-4 rounded-[var(--radius-component)] bg-[var(--bg-2)] border border-[var(--border)]">
            <input
              type="text"
              placeholder="Key name (e.g. Production, Notebook...)"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              className="flex-1 px-3.5 py-2 bg-[var(--input-background)] border border-[var(--border)]
                rounded-[var(--radius-component)] text-sm text-[var(--foreground)] outline-none
                focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--ring)]/20"
            />
            <button
              onClick={handleCreate}
              disabled={creating || !newKeyName.trim()}
              className="px-4 py-2 rounded-[var(--radius-component)] text-sm font-semibold
                bg-[var(--primary)] text-[var(--primary-foreground)]
                hover:bg-[var(--accent-3)] transition-colors disabled:opacity-50"
            >
              {creating ? <Loader2 size={14} className="animate-spin" /> : "Create"}
            </button>
          </div>
        )}

        {/* New key banner — shown once */}
        {createdKey && (
          <div className="mb-6 p-4 rounded-[var(--radius-component)] bg-[#f0fdf4] border border-[#bbf7d0]">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 size={15} className="text-[#15803d]" />
              <p className="text-sm font-semibold text-[#15803d]">
                Key created — copy it now, it won't be shown again
              </p>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <code className="flex-1 text-xs font-mono bg-white border border-[#bbf7d0] px-3 py-2 rounded-[var(--radius-component)] text-[#15803d] truncate">
                {createdKey.raw_key}
              </code>
              <button
                onClick={() => handleCopy(createdKey.raw_key)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-[var(--radius-component)]
                  text-xs font-medium border border-[#bbf7d0] text-[#15803d]
                  hover:bg-[#dcfce7] transition-colors"
              >
                {copied ? <CheckCircle2 size={13} /> : <Copy size={13} />}
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 p-3 mb-4 rounded-[var(--radius-component)] bg-[#fef2f2] border border-[#fecaca]">
            <AlertCircle size={14} className="text-red-500 shrink-0" />
            <p className="text-xs text-red-600">{error}</p>
          </div>
        )}

        {/* Keys list */}
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 size={18} className="animate-spin text-[var(--text-3)]" />
          </div>
        ) : keys.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 border border-dashed border-[var(--border-2)] rounded-[var(--radius-component)]">
            <p className="text-sm text-[var(--text-3)]">No API keys yet</p>
            <p className="text-xs text-[var(--text-3)] mt-1 opacity-60">Create one to get started</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {keys.map((k) => (
              <div
                key={k.id}
                className="flex items-center justify-between p-4 rounded-[var(--radius-component)] bg-[var(--bg-2)] border border-[var(--border)]"
              >
                <div>
                  <p className="text-sm font-semibold text-[var(--foreground)]">{k.name}</p>
                  <p className="text-xs font-mono text-[var(--text-3)] mt-1">{k.prefix}••••••••••••</p>
                  <p className="text-xs text-[var(--text-3)] mt-0.5">
                    Created {new Date(k.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                    {k.last_used_at && ` · Last used ${new Date(k.last_used_at).toLocaleDateString()}`}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(k.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-component)] text-xs font-medium
                    border border-[var(--border)] text-[var(--text-2)]
                    hover:border-red-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={12} />
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}