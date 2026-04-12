"use client";

import React, { useRef, useState } from "react";

interface ImagePickerProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export default function ImagePicker({ value, onChange, label = "Image" }: ImagePickerProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [err, setErr] = useState<string | null>(null);

  async function handleFile(file: File) {
    const MAX = 5 * 1024 * 1024;
    const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

    if (!ALLOWED.includes(file.type)) {
      setErr("Format non accepté (JPG, PNG, WebP uniquement)");
      return;
    }
    if (file.size > MAX) {
      setErr("Fichier trop grand (max 5 Mo)");
      return;
    }

    setErr(null);
    setUploading(true);
    setProgress(10);

    try {
      const fd = new FormData();
      fd.append("file", file);

      setProgress(30);
      const res = await fetch("/api/gestion/upload-image", {
        method: "POST",
        body: fd,
      });
      setProgress(90);

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErr(data.error ?? "Erreur lors du téléversement");
        return;
      }

      const { imageUrl } = await res.json();
      setProgress(100);
      onChange(imageUrl);
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
        <div style={{ position: "relative", display: "inline-block", marginBottom: 8 }}>
          <img
            src={value}
            alt="Aperçu"
            style={{
              maxWidth: 240, maxHeight: 140, borderRadius: 8, display: "block",
              objectFit: "cover", border: "1.5px solid #e2e8f0",
            }}
          />
          <button
            type="button"
            onClick={() => onChange("")}
            title="Supprimer l'image"
            style={{
              position: "absolute", top: -8, right: -8,
              width: 22, height: 22, borderRadius: "50%",
              background: "#ef4444", border: "2px solid white",
              color: "white", fontSize: 12, fontWeight: 700,
              cursor: "pointer", display: "flex", alignItems: "center",
              justifyContent: "center", lineHeight: 1, padding: 0,
            }}
          >
            ×
          </button>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            style={{
              display: "block", marginTop: 6, fontSize: 12, color: "#1e3a8a",
              background: "none", border: "none", cursor: "pointer",
              padding: 0, textDecoration: "underline",
            }}
          >
            Changer l&apos;image
          </button>
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
                Téléversement en cours…
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
              <div style={{ fontSize: 28, marginBottom: 6 }}>🖼️</div>
              <div style={{ fontSize: 13, color: "#475569", fontWeight: 500 }}>
                Cliquez ou déposez une image
              </div>
              <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>
                JPG, PNG, WebP — max 5 Mo
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
        accept="image/jpeg,image/png,image/webp"
        style={{ display: "none" }}
        onChange={handleChange}
      />
    </div>
  );
}
