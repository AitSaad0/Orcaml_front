"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/auth/AuthContext";
import DatasetUpload from "@/components/sections/dataset/DatasetUpload";
import DataPreview from "@/components/sections/dataset/DataPreview";
import DataStats from "@/components/sections/dataset/Datastats";

type Tab = "preview" | "stats";

export default function DatasetPage() {
  const params = useParams();
  const envId = params.environmentId as string;
  const { token } = useAuth(); // ✅ get token from context, not localStorage

  const [datasetId, setDatasetId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("preview");

  function handleUploaded(id: string) {
    setDatasetId(id);
    setActiveTab("preview");
  }

  return (
    <div className="dataset-page">
      <div className="upload-section">
        <DatasetUpload
          envId={envId}
          token={token ?? ""}
          onUploaded={handleUploaded}
        />
      </div>

      {datasetId && (
        <div className="results-section">
          <div className="tabs">
            <button
              className={`tab ${activeTab === "preview" ? "active" : ""}`}
              onClick={() => setActiveTab("preview")}
            >
              Preview
            </button>
            <button
              className={`tab ${activeTab === "stats" ? "active" : ""}`}
              onClick={() => setActiveTab("stats")}
            >
              Statistics
            </button>
          </div>

          <div className="tab-content">
            {activeTab === "preview" && (
              <DataPreview datasetId={datasetId} token={token ?? ""} />
            )}
            {activeTab === "stats" && (
              <DataStats datasetId={datasetId} token={token ?? ""} />
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .dataset-page {
          max-width: 860px;
          margin: 0 auto;
          padding: 2rem 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        .upload-section {}
        .results-section { display: flex; flex-direction: column; gap: 1.25rem; }
        .tabs {
          display: flex;
          border-bottom: 1px solid #ededf5;
          gap: 0;
        }
        .tab {
          padding: 10px 20px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          background: none;
          border: none;
          border-bottom: 2px solid transparent;
          color: #888;
          transition: color 0.15s, border-color 0.15s;
          margin-bottom: -1px;
        }
        .tab:hover { color: #534ab7; }
        .tab.active { color: #534ab7; border-bottom-color: #534ab7; }
        .tab-content {}
      `}</style>
    </div>
  );
}