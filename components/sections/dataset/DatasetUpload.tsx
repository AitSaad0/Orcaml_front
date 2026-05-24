"use client";

import { useRef, useState } from "react";
import { Upload, FileText, CloudUpload, AlertCircle, CheckCircle, X } from "lucide-react";
import { uploadDataset } from "@/lib/api/dataset/api";

interface Props {
  envId: string;
  token: string;
  onUploaded: (datasetId: string) => void;
}

export default function DatasetUpload({ envId, token, onUploaded }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function pickFile(f: File) {
    if (!f.name.endsWith(".csv")) {
      setError("Only CSV files are supported.");
      return;
    }
    setFile(f);
    setError(null);
    setSuccess(false);
  }

  function reset() {
    setFile(null);
    setError(null);
    setSuccess(false);
  }

  async function handleUpload() {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      // uses your existing: uploadDataset(token, file, envId)
      const data = await uploadDataset(token, file, envId);
      setSuccess(true);
      onUploaded(data.id);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="upload-wrapper">
      <div
        className={`drop-zone${dragging ? " drag-over" : ""}${file ? " has-file" : ""}`}
        onClick={() => !file && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (e.dataTransfer.files[0]) pickFile(e.dataTransfer.files[0]);
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          style={{ display: "none" }}
          onChange={(e) => { if (e.target.files?.[0]) pickFile(e.target.files[0]); }}
        />

        {!file ? (
          <div className="drop-idle">
            <div className="upload-icon-ring">
              <Upload size={26} strokeWidth={1.5} />
            </div>
            <p className="drop-title">Upload dataset</p>
            <p className="drop-sub">Drag and drop your CSV file here, or click to browse</p>
            <div className="drop-inner-zone">
              <FileText size={32} strokeWidth={1} className="inner-icon" />
              <p className="inner-label">Drop CSV file here</p>
              <p className="inner-sub">Max file size: 100MB</p>
            </div>
            <button
              className="btn btn-primary"
              onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
            >
              <Upload size={15} /> Select file
            </button>
          </div>
        ) : (
          <div className="file-chosen">
            <div className="file-info">
              <div className="file-icon">
                <FileText size={20} strokeWidth={1.5} />
              </div>
              <div>
                <p className="file-name">{file.name}</p>
                <p className="file-size">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            </div>
            <div className="file-actions">
              <button
                className="btn btn-ghost"
                onClick={(e) => { e.stopPropagation(); reset(); }}
                disabled={loading}
              >
                <X size={14} /> Change
              </button>
              <button
                className="btn btn-primary"
                onClick={(e) => { e.stopPropagation(); handleUpload(); }}
                disabled={loading || success}
              >
                {loading ? <span className="spinner" /> : <CloudUpload size={15} />}
                {loading ? "Uploading..." : success ? "Uploaded" : "Upload"}
              </button>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="status-box status-error">
          <AlertCircle size={14} /> {error}
        </div>
      )}
      {success && (
        <div className="status-box status-success">
          <CheckCircle size={14} /> Dataset uploaded — preview and stats loaded below.
        </div>
      )}

      <style jsx>{`
        .upload-wrapper { width: 100%; }

        .drop-zone {
          border: 1.5px dashed #d1cff8;
          border-radius: 14px;
          padding: 2.5rem 2rem;
          text-align: center;
          cursor: pointer;
          transition: background 0.15s, border-color 0.15s;
          background: #fafafe;
        }
        .drop-zone.drag-over { background: #f0effe; border-color: #7f77dd; }
        .drop-zone.has-file  { cursor: default; padding: 1.25rem 1.5rem; }

        .drop-idle { display: flex; flex-direction: column; align-items: center; gap: 0.4rem; }

        .upload-icon-ring {
          width: 56px; height: 56px; border-radius: 50%;
          background: #eeedfe; color: #534ab7;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 0.25rem;
        }
        .drop-title { font-size: 15px; font-weight: 600; color: #1a1a2e; margin: 0; }
        .drop-sub   { font-size: 13px; color: #999; margin: 0 0 0.75rem; }

        .drop-inner-zone {
          border: 1.5px dashed #e0dff5;
          border-radius: 10px;
          padding: 1.25rem 3rem;
          margin-bottom: 1rem;
          display: flex; flex-direction: column; align-items: center; gap: 4px;
          background: #fff;
        }
        .inner-icon  { color: #ccc; }
        .inner-label { font-size: 13px; color: #777; margin: 0; }
        .inner-sub   { font-size: 11px; color: #bbb; margin: 0; }

        .file-chosen {
          display: flex; align-items: center;
          justify-content: space-between; flex-wrap: wrap; gap: 1rem;
        }
        .file-info { display: flex; align-items: center; gap: 12px; }
        .file-icon {
          width: 40px; height: 40px; border-radius: 8px;
          background: #eeedfe; color: #534ab7;
          display: flex; align-items: center; justify-content: center;
        }
        .file-name { font-size: 14px; font-weight: 600; color: #1a1a2e; margin: 0; }
        .file-size { font-size: 12px; color: #999; margin: 0; }
        .file-actions { display: flex; gap: 8px; }

        .btn {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 8px 16px; border-radius: 8px;
          font-size: 13px; font-weight: 500; cursor: pointer;
          transition: background 0.15s; border: none;
        }
        .btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .btn-primary { background: #534ab7; color: #fff; }
        .btn-primary:hover:not(:disabled) { background: #3c3489; }
        .btn-ghost { background: transparent; color: #534ab7; border: 1px solid #d1cff8; }
        .btn-ghost:hover:not(:disabled) { background: #f0effe; }

        .spinner {
          width: 14px; height: 14px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff; border-radius: 50%;
          animation: spin 0.6s linear infinite; display: inline-block;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .status-box {
          margin-top: 10px; display: flex; align-items: center; gap: 8px;
          padding: 10px 14px; border-radius: 8px; font-size: 13px; font-weight: 500;
        }
        .status-error   { background: #fff0f0; color: #a32d2d; border: 1px solid #f09595; }
        .status-success { background: #eaf3de; color: #27500a; border: 1px solid #97c459; }
      `}</style>
    </div>
  );
}