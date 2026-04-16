"use client";

import React, { useState } from "react";
import type { LiveStream } from "@prisma/client";
import { Play, Pin, Radio, Plus, X } from "lucide-react";

function getYoutubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return u.pathname.slice(1);
    return u.searchParams.get("v");
  } catch { return null; }
}

type FormData = {
  titre: string;
  urlYoutube: string;
  description: string;
  dateStream: string;
  estEnDirect: boolean;
  epingle: boolean;
  publie: boolean;
};

const emptyForm: FormData = {
  titre: "", urlYoutube: "", description: "", dateStream: "",
  estEnDirect: false, epingle: false, publie: true,
};

export default function GestionVideosClient({ initialVideos }: { initialVideos: LiveStream[] }) {
  const [videos, setVideos] = useState<LiveStream[]>(initialVideos);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<LiveStream | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toDateInput(d: Date | string | null | undefined): string {
    if (!d) return "";
    return new Date(d).toISOString().slice(0, 16);
  }

  function openCreate() {
    setEditing(null); setForm(emptyForm); setShowForm(true); setError(null);
  }

  function openEdit(v: LiveStream) {
    setEditing(v);
    setForm({
      titre: v.titre,
      urlYoutube: v.urlYoutube,
      description: v.description ?? "",
      dateStream: toDateInput(v.dateStream),
      estEnDirect: v.estEnDirect,
      epingle: v.epingle,
      publie: v.publie,
    });
    setShowForm(true); setError(null);
  }

  function updateField<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const body = {
        ...form,
        description: form.description || null,
        dateStream: form.dateStream || null,
      };
      let res;
      if (editing) {
        res = await fetch(`/api/gestion/videos/${editing.id}`, {
          method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
        });
      } else {
        res = await fetch("/api/gestion/videos", {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
        });
      }
      if (!res.ok) { const d = await res.json(); setError(d.error ?? "Erreur"); return; }
      const saved = await res.json();
      if (editing) {
        setVideos((vs) => vs.map((v) => (v.id === saved.id ? saved : v)));
      } else {
        setVideos((vs) => [saved, ...vs]);
      }
      setShowForm(false);
    } finally { setLoading(false); }
  }

  async function handleDelete(id: number) {
    if (!confirm("Supprimer cette vidéo ?")) return;
    const res = await fetch(`/api/gestion/videos/${id}`, { method: "DELETE" });
    if (res.ok) setVideos((vs) => vs.filter((v) => v.id !== id));
  }

  async function togglePin(v: LiveStream) {
    const res = await fetch(`/api/gestion/videos/${v.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ epingle: !v.epingle }),
    });
    if (res.ok) {
      const updated = await res.json();
      setVideos((vs) => vs.map((x) => (x.id === v.id ? updated : x)));
    }
  }

  return (
    <>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20 }}>
        <button
          onClick={openCreate}
          style={{ padding: "9px 20px", borderRadius: 9, background: "#1e3a8a", color: "white", border: "none", fontWeight: 700, fontSize: 14, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}
        >
          <Plus size={16} /> Ajouter une vidéo
        </button>
      </div>

      {showForm && (
        <div style={{ background: "white", borderRadius: 14, padding: "1.5rem", border: "1px solid #e2e8f0", marginBottom: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}>
          <h3 style={{ fontWeight: 700, fontSize: 15, color: "#0f172a", marginBottom: 16 }}>
            {editing ? "Modifier la vidéo" : "Nouvelle vidéo YouTube"}
          </h3>
          {error && <div style={{ background: "#fee2e2", color: "#b91c1c", padding: "10px 14px", borderRadius: 8, marginBottom: 12, fontSize: 13 }}>{error}</div>}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4, color: "#374151" }}>Titre *</label>
              <input required value={form.titre} onChange={(e) => updateField("titre", e.target.value)}
                style={{ width: "100%", padding: "9px 12px", border: "1px solid #d1d5db", borderRadius: 7, fontSize: 14, boxSizing: "border-box" }}
                placeholder="Ex: Culte du dimanche 12 janvier" />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4, color: "#374151" }}>URL YouTube *</label>
              <input required value={form.urlYoutube} onChange={(e) => updateField("urlYoutube", e.target.value)}
                style={{ width: "100%", padding: "9px 12px", border: "1px solid #d1d5db", borderRadius: 7, fontSize: 14, boxSizing: "border-box" }}
                placeholder="https://youtube.com/watch?v=..." />
            </div>
            {form.urlYoutube && getYoutubeId(form.urlYoutube) && (
              <div style={{ borderRadius: 8, overflow: "hidden", maxWidth: 320 }}>
                <img
                  src={`https://img.youtube.com/vi/${getYoutubeId(form.urlYoutube)}/hqdefault.jpg`}
                  alt="Miniature YouTube"
                  style={{ width: "100%", display: "block" }}
                />
              </div>
            )}
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4, color: "#374151" }}>Description</label>
              <textarea value={form.description} onChange={(e) => updateField("description", e.target.value)} rows={2}
                style={{ width: "100%", padding: "9px 12px", border: "1px solid #d1d5db", borderRadius: 7, fontSize: 14, boxSizing: "border-box", resize: "vertical" }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4, color: "#374151" }}>Date du stream</label>
                <input type="datetime-local" value={form.dateStream} onChange={(e) => updateField("dateStream", e.target.value)}
                  style={{ width: "100%", padding: "9px 12px", border: "1px solid #d1d5db", borderRadius: 7, fontSize: 14, boxSizing: "border-box" }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingTop: 22 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, cursor: "pointer" }}>
                  <input type="checkbox" checked={form.estEnDirect} onChange={(e) => updateField("estEnDirect", e.target.checked)} />
                  <span style={{ color: "#b91c1c", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}><Radio size={13} color="#b91c1c" /> En direct</span>
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, cursor: "pointer" }}>
                  <input type="checkbox" checked={form.epingle} onChange={(e) => updateField("epingle", e.target.checked)} />
                  Épingler en haut
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, cursor: "pointer" }}>
                  <input type="checkbox" checked={form.publie} onChange={(e) => updateField("publie", e.target.checked)} />
                  Publié
                </label>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button type="button" onClick={() => setShowForm(false)}
                style={{ padding: "9px 18px", borderRadius: 7, border: "1px solid #d1d5db", background: "white", fontSize: 14, cursor: "pointer" }}>
                Annuler
              </button>
              <button type="submit" disabled={loading}
                style={{ padding: "9px 18px", borderRadius: 7, background: "#1e3a8a", color: "white", border: "none", fontSize: 14, fontWeight: 700, cursor: "pointer", opacity: loading ? 0.7 : 1 }}>
                {loading ? "Enregistrement…" : (editing ? "Mettre à jour" : "Ajouter")}
              </button>
            </div>
          </form>
        </div>
      )}

      {videos.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem", background: "white", borderRadius: 14, border: "1px dashed #e2e8f0" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
            <Play size={40} color="#e2e8f0" />
          </div>
          <h3 style={{ color: "#0f172a", fontWeight: 700, marginBottom: 8 }}>Aucune vidéo</h3>
          <p style={{ color: "#64748b", fontSize: 14 }}>Ajoutez vos lives et replays YouTube pour les afficher sur votre site.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
          {videos.map((v) => {
            const ytId = getYoutubeId(v.urlYoutube);
            return (
              <div key={v.id} style={{ background: "white", borderRadius: 12, border: "1px solid #e2e8f0", overflow: "hidden" }}>
                {ytId ? (
                  <div style={{ aspectRatio: "16/9", background: "#0f172a", overflow: "hidden" }}>
                    <img src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`} alt={v.titre} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                ) : (
                  <div style={{ aspectRatio: "16/9", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Play size={32} color="#94a3b8" />
                  </div>
                )}
                <div style={{ padding: "12px 14px" }}>
                  <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
                    {v.epingle && <span style={{ fontSize: 10, fontWeight: 700, background: "#fef3c7", color: "#b45309", padding: "2px 8px", borderRadius: 99, display: "inline-flex", alignItems: "center", gap: 3 }}><Pin size={9} color="#b45309" /> Épinglé</span>}
                    {v.estEnDirect && <span style={{ fontSize: 10, fontWeight: 700, background: "#fee2e2", color: "#b91c1c", padding: "2px 8px", borderRadius: 99, display: "inline-flex", alignItems: "center", gap: 3 }}><Radio size={9} color="#b91c1c" /> En direct</span>}
                    {!v.publie && <span style={{ fontSize: 10, fontWeight: 700, background: "#f1f5f9", color: "#64748b", padding: "2px 8px", borderRadius: 99 }}>Brouillon</span>}
                  </div>
                  <div style={{ fontWeight: 700, color: "#0f172a", fontSize: 14, marginBottom: 4, lineHeight: 1.3 }}>{v.titre}</div>
                  {v.description && <div style={{ fontSize: 12, color: "#64748b", marginBottom: 10, lineHeight: 1.4 }}>{v.description.slice(0, 100)}{v.description.length > 100 ? "…" : ""}</div>}
                  {v.dateStream && (
                    <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 10 }}>
                      {new Date(v.dateStream).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </div>
                  )}
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <button onClick={() => openEdit(v)}
                      style={{ flex: 1, padding: "6px 10px", borderRadius: 6, border: "1px solid #e2e8f0", background: "white", fontSize: 12, fontWeight: 600, color: "#374151", cursor: "pointer" }}>
                      Modifier
                    </button>
                    <button onClick={() => togglePin(v)}
                      style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #e2e8f0", background: v.epingle ? "#fef3c7" : "white", fontSize: 12, cursor: "pointer", color: "#b45309" }}>
                      {v.epingle ? "Désépingler" : "Épingler"}
                    </button>
                    <button onClick={() => handleDelete(v.id)}
                      title="Supprimer"
                      style={{ padding: "6px 8px", borderRadius: 6, border: "1px solid #fca5a5", background: "#fee2e2", color: "#b91c1c", cursor: "pointer", display: "flex", alignItems: "center" }}>
                      <X size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
