"use client";

import React, { useRef, useState } from "react";
import { VideoIcon } from "lucide-react";

interface VideoPickerProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  egliseId?: number;
}

export default function VideoPicker({ value, onChange, label = "Vidéo", egliseId }: VideoPickerProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [err, setErr] = useState<string | null>(null);

  async function handleFile(file: File) {
    const MAX = 100 * 1024 * 1024;
    const ALLOWED = ["video/mp4", "video/quicktime", "video/webm"];

    if (!ALLOWED.includes(file.type)) {
      setErr("Format non accepté (MP4, MOV, WebM uniquement)");
      return;
    }
    if (file.size > MAX) {
      setErr("Fichier trop grand (max 100 Mo)");
      return;
    }

    setErr(null);
    setUploading(true);
    setProgress(10);

    try {
      const fd = new FormData();
      fd.append("file", file);

      setProgress(20);
      const headers: Record<string, string> = {};
      if (egliseId) headers["x-eglise-id"] = String(egliseId);

      const res = await fetch("/api/gestion/upload-video", {
        method: "POST",
        headers,
        body: fd,
      });
      setProgress(90);

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErr(data.error ?? "Erreur lors du téléversement");
        return;
      }

      const { videoUrl } = await res.json();
      setProgress(100);
      onChange(videoUrl);
    } catch {
      setErr("Erreur réseau — réessayez");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
  }

  return (
    <div>
      <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>
        {label}
      </label>

      {value ? (
        <div style={{ marginBottom: 8 }}>
          <video
            src={value}
            controls
            style={{
              width: "100%", maxWidth: 400, maxHeight: 220, borderRadius: 8,
              display: "block", border: "1.5px solid #e2e8f0", background: "#000",
            }}
          />
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              style={{
                fontSize: 12, color: "#1e3a8a", background: "none", border: "none",
                cursor: "pointer", padding: 0, textDecoration: "underline",
              }}
            >
              Changer la vidéo
            </button>
            <button
              type="button"
              onClick={() => onChange("")}
              style={{
                fontSize: 12, color: "#b91c1c", background: "none", border: "none",
                cursor: "pointer", padding: 0, textDecoration: "underline",
              }}
            >
              Supprimer
            </button>
          </div>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => !uploading && fileRef.current?.click()}
          style={{
            border: "2px dashed #cbd5e1", borderRadius: 10,
            padding: "1.25rem", textAlign: "center",
            cursor: uploading ? "not-allowed" : "pointer",
            background: "#f8fafc", transition: "border-color 0.15s",
            marginBottom: 4,
          }}
        >
          {uploading ? (
            <div>
              <div style={{ fontSize: 13, color: "#64748b", marginBottom: 8 }}>
                Téléversement en cours… (peut prendre quelques secondes)
              </div>
              <div style={{ background: "#e2e8f0", borderRadius: 99, height: 6, overflow: "hidden" }}>
                <div
                  style={{
                    background: "#1e3a8a", height: "100%",
                    borderRadius: 99, width: `${progress}%`,
                    transition: "width 0.3s ease",
                  }}
                />
              </div>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: 8 }}><VideoIcon size={28} color="#94a3b8" /></div>
              <div style={{ fontSize: 13, color: "#475569", fontWeight: 500 }}>
                Cliquez ou déposez une vidéo
              </div>
              <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>
                MP4, MOV, WebM — max 100 Mo
              </div>
            </>
          )}
        </div>
      )}

      {err && (
        <div style={{ fontSize: 12, color: "#b91c1c", background: "#fee2e2", borderRadius: 6, padding: "5px 10px", marginTop: 4 }}>
          {err}
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="video/mp4,video/quicktime,video/webm"
        style={{ display: "none" }}
        onChange={handleChange}
      />
    </div>
  );
}
