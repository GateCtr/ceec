"use client";

import React, { useState } from "react";
import type { Annonce } from "@prisma/client";

interface Props {
  initialAnnonces: Annonce[];
}

const prioriteLabels: Record<string, { label: string; bg: string; color: string }> = {
  haute: { label: "Haute", bg: "#fee2e2", color: "#b91c1c" },
  normale: { label: "Normale", bg: "#e0e7ff", color: "#3730a3" },
  basse: { label: "Basse", bg: "#f1f5f9", color: "#64748b" },
};

const CATEGORIES = ["", "Culte", "Formation", "Prière", "Mission", "Social", "Jeunesse", "Femmes", "Hommes", "Autre"];

type FormData = {
  titre: string;
  contenu: string;
  priorite: string;
  publie: boolean;
  dateExpiration: string;
  imageUrl: string;
  categorie: string;
};

const emptyForm: FormData = { titre: "", contenu: "", priorite: "normale", publie: true, dateExpiration: "", imageUrl: "", categorie: "" };

export default function GestionAnnoncesClient({ initialAnnonces }: Props) {
  const [annonces, setAnnonces] = useState<Annonce[]>(initialAnnonces);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Annonce | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
    setError(null);
  }

  function openEdit(a: Annonce) {
    setEditing(a);
    setForm({
      titre: a.titre,
      contenu: a.contenu,
      priorite: a.priorite,
      publie: a.publie,
      dateExpiration: a.dateExpiration ? new Date(a.dateExpiration).toISOString().slice(0, 10) : "",
      imageUrl: a.imageUrl ?? "",
      categorie: a.categorie ?? "",
    });
    setShowForm(true);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const body = {
        ...form,
        dateExpiration: form.dateExpiration || null,
        imageUrl: form.imageUrl || null,
        categorie: form.categorie || null,
      };
      let res;
      if (editing) {
        res = await fetch(`/api/gestion/annonces/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } else {
        res = await fetch("/api/gestion/annonces", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Erreur");
        return;
      }
      const updated = await res.json();
      if (editing) {
        setAnnonces((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      } else {
        setAnnonces((prev) => [updated, ...prev]);
      }
      setShowForm(false);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Supprimer cette annonce ?")) return;
    const res = await fetch(`/api/gestion/annonces/${id}`, { method: "DELETE" });
    if (res.ok) {
      setAnnonces((prev) => prev.filter((a) => a.id !== id));
    }
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20 }}>
        <button onClick={openCreate} style={{
          background: "#1e3a8a", color: "white", border: "none", borderRadius: 8,
          padding: "10px 20px", fontWeight: 700, fontSize: 14, cursor: "pointer",
        }}>
          + Nouvelle annonce
        </button>
      </div>

      {showForm && (
        <div style={{ background: "white", borderRadius: 14, padding: "1.5rem", border: "1px solid #e2e8f0", marginBottom: 24, boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}>
          <h2 style={{ margin: "0 0 16px", fontSize: 17, fontWeight: 700, color: "#0f172a" }}>
            {editing ? "Modifier l&apos;annonce" : "Nouvelle annonce"}
          </h2>
          {error && <div style={{ background: "#fee2e2", color: "#b91c1c", padding: "8px 12px", borderRadius: 6, marginBottom: 12, fontSize: 13 }}>{error}</div>}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={s.label}>Titre *</label>
              <input style={s.input} value={form.titre} onChange={(e) => setForm({ ...form, titre: e.target.value })} required />
            </div>
            <div>
              <label style={s.label}>Contenu *</label>
              <textarea style={{ ...s.input, minHeight: 120, resize: "vertical" }} value={form.contenu} onChange={(e) => setForm({ ...form, contenu: e.target.value })} required />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label style={s.label}>Catégorie</label>
                <select style={s.input} value={form.categorie} onChange={(e) => setForm({ ...form, categorie: e.target.value })}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c || "— Aucune —"}</option>)}
                </select>
              </div>
              <div>
                <label style={s.label}>Priorité</label>
                <select style={s.input} value={form.priorite} onChange={(e) => setForm({ ...form, priorite: e.target.value })}>
                  <option value="basse">Basse</option>
                  <option value="normale">Normale</option>
                  <option value="haute">Haute</option>
                </select>
              </div>
            </div>
            <div>
              <label style={s.label}>Image (URL)</label>
              <input style={s.input} value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://..." />
              {form.imageUrl && (
                <div style={{ marginTop: 8, borderRadius: 8, overflow: "hidden", maxWidth: 240, maxHeight: 120, background: "#f1f5f9" }}>
                  <img src={form.imageUrl} alt="Aperçu" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: 16 }}>
              <div style={{ flex: 1 }}>
                <label style={s.label}>Date d&apos;expiration</label>
                <input type="date" style={s.input} value={form.dateExpiration} onChange={(e) => setForm({ ...form, dateExpiration: e.target.value })} />
              </div>
              <div style={{ display: "flex", alignItems: "flex-end", paddingBottom: 4 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, cursor: "pointer" }}>
                  <input type="checkbox" checked={form.publie} onChange={(e) => setForm({ ...form, publie: e.target.checked })} />
                  Publier immédiatement
                </label>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button type="button" onClick={() => setShowForm(false)} style={s.cancelBtn}>Annuler</button>
              <button type="submit" style={s.submitBtn} disabled={loading}>
                {loading ? "Enregistrement…" : (editing ? "Mettre à jour" : "Créer")}
              </button>
            </div>
          </form>
        </div>
      )}

      {annonces.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", background: "white", borderRadius: 14, border: "1px dashed #cbd5e1" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📢</div>
          <p style={{ color: "#64748b" }}>Aucune annonce pour l&apos;instant.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {annonces.map((a) => {
            const pr = prioriteLabels[a.priorite] ?? prioriteLabels.normale;
            const imageUrl = a.imageUrl;
            const categorie = a.categorie;
            return (
              <div key={a.id} style={{ background: "white", borderRadius: 12, border: "1px solid #e2e8f0", display: "flex", overflow: "hidden" }}>
                {imageUrl && (
                  <div style={{ width: 100, flexShrink: 0, background: "#f1f5f9" }}>
                    <img src={imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  </div>
                )}
                <div style={{ flex: 1, padding: "1rem 1.25rem", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 700, fontSize: 15, color: "#0f172a" }}>{a.titre}</span>
                      <span style={{ ...s.badge, background: pr.bg, color: pr.color }}>{pr.label}</span>
                      {categorie && <span style={{ ...s.badge, background: "#f0fdf4", color: "#15803d" }}>{categorie}</span>}
                      {!a.publie && <span style={{ ...s.badge, background: "#f1f5f9", color: "#64748b" }}>Brouillon</span>}
                    </div>
                    <p style={{ color: "#64748b", fontSize: 13, margin: 0, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const }}>{a.contenu}</p>
                    <div style={{ marginTop: 6, fontSize: 12, color: "#94a3b8" }}>
                      {new Date(a.datePublication).toLocaleDateString("fr-FR")}
                      {a.dateExpiration && <> — expire le {new Date(a.dateExpiration).toLocaleDateString("fr-FR")}</>}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                    <button onClick={() => openEdit(a)} style={s.editBtn}>Modifier</button>
                    <button onClick={() => handleDelete(a.id)} style={s.deleteBtn}>Supprimer</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const s = {
  label: { fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 } as React.CSSProperties,
  input: { width: "100%", padding: "9px 12px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 14, outline: "none", boxSizing: "border-box" as const } as React.CSSProperties,
  badge: { padding: "2px 10px", borderRadius: 100, fontSize: 11, fontWeight: 600 } as React.CSSProperties,
  editBtn: { padding: "7px 14px", borderRadius: 7, border: "1.5px solid #e2e8f0", background: "white", color: "#1e3a8a", fontWeight: 600, fontSize: 13, cursor: "pointer" } as React.CSSProperties,
  deleteBtn: { padding: "7px 14px", borderRadius: 7, border: "none", background: "#fee2e2", color: "#b91c1c", fontWeight: 600, fontSize: 13, cursor: "pointer" } as React.CSSProperties,
  cancelBtn: { padding: "9px 20px", borderRadius: 8, border: "1.5px solid #e2e8f0", background: "white", color: "#374151", fontWeight: 600, fontSize: 14, cursor: "pointer" } as React.CSSProperties,
  submitBtn: { padding: "9px 24px", borderRadius: 8, border: "none", background: "#1e3a8a", color: "white", fontWeight: 700, fontSize: 14, cursor: "pointer" } as React.CSSProperties,
};
