"use client";

import { useState } from "react";

type ApiKey = {
  id: string;
  name: string;
  key: string;
  createdAt: string;
};

const MOCK_KEYS: ApiKey[] = [
  { id: "1", name: "Production API Key",  key: "sk_live_abc123...xyz789", createdAt: "Created 2 weeks ago" },
  { id: "2", name: "Development API Key", key: "sk_test_def456...uvw012", createdAt: "Created 1 month ago" },
];

export default function ApiKeys() {
  const [keys, setKeys] = useState<ApiKey[]>(MOCK_KEYS);

  const deleteKey = (id: string) =>
    setKeys((prev) => prev.filter((k) => k.id !== id));

  const generateKey = () => {
    const newKey: ApiKey = {
      id: Date.now().toString(),
      name: "New API Key",
      key: `sk_new_${Math.random().toString(36).slice(2, 10)}...${Math.random().toString(36).slice(2, 8)}`,
      createdAt: "Created just now",
    };
    setKeys((prev) => [...prev, newKey]);
  };

  return (
    <div className="bg-[var(--card)] rounded-[var(--radius-card)] p-8 w-full">
      <div className="flex items-center justify-between mb-7">
        <h2 className="text-lg font-semibold text-[var(--card-foreground)] tracking-tight">API Keys</h2>
        <button
          onClick={generateKey}
          className="px-4 py-2 rounded-[var(--radius-component)]
            bg-[var(--primary)] hover:bg-[var(--accent-3)]
            text-sm font-semibold text-[var(--primary-foreground)]
            transition-colors duration-150"
        >
          Generate New Key
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {keys.map((k) => (
          <div key={k.id}
            className="flex items-center justify-between p-4 rounded-[var(--radius-component)] bg-[var(--bg-2)] border border-[var(--border)]"
          >
            <div>
              <p className="text-sm font-semibold text-[var(--foreground)]">{k.name}</p>
              <p className="text-xs text-[var(--text-3)] mt-1 font-mono">{k.key}</p>
              <p className="text-xs text-[var(--text-3)] mt-0.5">{k.createdAt}</p>
            </div>
            <button
              onClick={() => deleteKey(k.id)}
              className="px-3 py-1.5 rounded-[var(--radius-component)] text-xs font-medium
                border border-[var(--border)] text-[var(--text-2)]
                hover:border-[var(--destructive)] hover:text-[var(--destructive)] transition-colors"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}