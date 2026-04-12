"use client";

import React, { useState } from "react";
import type { Annonce } from "@prisma/client";
import ImagePicker from "@/components/gestion/ImagePicker";

interface Props {
  initialAnnonces: Annonce[];
  canAutoPublish: boolean;
  egliseId: number;
}

const prioriteLabels: Record<string, { label: string; bg: string; color: string }> = {
  haute:   { label: "Haute",   bg: "#fee2e2", color: "#b91c1c" },
  normale: { label: "Normale", bg: "#e0e7ff", color: "#3730a3" },
  basse:   { label: "Basse",   bg: "#f1f5f9", color: "#64748b" },
};

const statutLabels: Record<string, { label: string; bg: string; color: string }> = {
  publie:     { label: "Publié",      bg: "#dcfce7", color: "#15803d" },
  brouillon:  { label: "Brouillon",   bg: "#f1f5f9", color: "#64748b" },
  en_attente: { label: "En attente",  bg: "#fef9c3", color: "#a16207" },
  rejete:     { label: "Rejeté",      bg: "#fee2e2", color: "#b91c1c" },
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

export default function GestionAnnoncesClient({ initialAnnonces, canAutoPublish, egliseId }: Props) {
  const [annonces, setAnnonces] = useState<Annonce[]>(initialAnnonces);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Annonce | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

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

  async function handleStatut(id: number, action: "soumettre" | "depublier" | "publier") {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/gestion/annonces/${id}/statut`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error ?? "Erreur");
        return;
      }
      const updated = await res.json();
      setAnnonces((prev) => prev.map((a) => (a.id === id ? updated : a)));
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        {!canAutoPublish && (
          <div style={{ fontSize: 13, color: "#64748b", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "6px 12px" }}>
            Votre contenu sera soumis pour validation avant publication.
          </div>
        )}
        <div style={{ marginLeft: "auto" }}>
          <button onClick={openCreate} style={{
            background: "#1e3a8a", color: "white", border: "none", borderRadius: 8,
            padding: "10px 20px", fontWeight: 700, fontSize: 14, cursor: "pointer",
          }}>
            + Nouvelle annonce
          </button>
        </div>
      </div>

      {showForm && (
        <div style={{ background: "white", borderRadius: 14, padding: "1.5rem", border: "1px solid #e2e8f0", marginBottom: 24, boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}>
          <h2 style={{ margin: "0 0 16px", fontSize: 17, fontWeight: 700, color: "#0f172a" }}>
            {editing ? "Modifier l\u2019annonce" : "Nouvelle annonce"}
          </h2>
          {!canAutoPublish && !editing && (
            <div style={{ background: "#fef9c3", border: "1px solid #fcd34d", borderRadius: 8, padding: "8px 12px", marginBottom: 12, fontSize: 13, color: "#a16207" }}>
              Cette annonce sera créée en brouillon. Soumettez-la pour qu&apos;elle soit examinée et publiée.
            </div>
          )}
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
            <ImagePicker
              label="Image"
              value={form.imageUrl}
              egliseId={egliseId}
              onChange={(url) => setForm({ ...form, imageUrl: url })}
            />
            <div style={{ display: "flex", gap: 16 }}>
              <div style={{ flex: 1 }}>
                <label style={s.label}>Date d&apos;expiration</label>
                <input type="date" style={s.input} value={form.dateExpiration} onChange={(e) => setForm({ ...form, dateExpiration: e.target.value })} />
              </div>
              {canAutoPublish && (
                <div style={{ display: "flex", alignItems: "flex-end", paddingBottom: 4 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, cursor: "pointer" }}>
                    <input type="checkbox" checked={form.publie} onChange={(e) => setForm({ ...form, publie: e.target.checked })} />
                    Publier immédiatement
                  </label>
                </div>
              )}
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
            const statut = statutLabels[a.statutContenu as string] ?? statutLabels.brouillon;
            const isLoading = actionLoading === a.id;
            return (
              <div key={a.id} style={{ background: "white", borderRadius: 12, border: "1px solid #e2e8f0", display: "flex", overflow: "hidden" }}>
                {a.imageUrl && (
                  <div style={{ width: 100, flexShrink: 0, background: "#f1f5f9" }}>
                    <img src={a.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  </div>
                )}
                <div style={{ flex: 1, padding: "1rem 1.25rem" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                        <span style={{ fontWeight: 700, fontSize: 15, color: "#0f172a" }}>{a.titre}</span>
                        <span style={{ ...s.badge, background: pr.bg, color: pr.color }}>{pr.label}</span>
                        <span style={{ ...s.badge, background: statut.bg, color: statut.color }}>{statut.label}</span>
                        {a.categorie && <span style={{ ...s.badge, background: "#f0fdf4", color: "#15803d" }}>{a.categorie}</span>}
                      </div>
                      <p style={{ color: "#64748b", fontSize: 13, margin: 0, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const }}>{a.contenu}</p>
                      <div style={{ marginTop: 6, fontSize: 12, color: "#94a3b8" }}>
                        {new Date(a.datePublication).toLocaleDateString("fr-FR")}
                        {a.dateExpiration && <> — expire le {new Date(a.dateExpiration).toLocaleDateString("fr-FR")}</>}
                      </div>
                      {(a.statutContenu as string) === "rejete" && (a as Annonce & { commentaireRejet?: string | null }).commentaireRejet && (
                        <div style={{ marginTop: 6, background: "#fee2e2", borderRadius: 6, padding: "4px 10px", fontSize: 12, color: "#b91c1c" }}>
                          Motif : {(a as Annonce & { commentaireRejet?: string | null }).commentaireRejet}
                        </div>
                      )}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0, alignItems: "flex-end" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => openEdit(a)} style={s.editBtn} disabled={isLoading}>Modifier</button>
                        <button onClick={() => handleDelete(a.id)} style={s.deleteBtn} disabled={isLoading}>Supprimer</button>
                      </div>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
                        {(a.statutContenu as string) !== "en_attente" && (a.statutContenu as string) !== "publie" && (
                          <button
                            onClick={() => handleStatut(a.id, "soumettre")}
                            disabled={isLoading}
                            style={{ ...s.actionBtn, background: "#fef9c3", color: "#a16207", border: "1px solid #fde68a" }}
                          >
                            {isLoading ? "…" : "Soumettre"}
                          </button>
                        )}
                        {(a.statutContenu as string) === "publie" && (
                          <button
                            onClick={() => handleStatut(a.id, "depublier")}
                            disabled={isLoading}
                            style={{ ...s.actionBtn, background: "#f1f5f9", color: "#64748b", border: "1px solid #e2e8f0" }}
                          >
                            {isLoading ? "…" : "Dépublier"}
                          </button>
                        )}
                        {(a.statutContenu as string) === "en_attente" && (
                          <button
                            onClick={() => handleStatut(a.id, "depublier")}
                            disabled={isLoading}
                            style={{ ...s.actionBtn, background: "#f1f5f9", color: "#64748b", border: "1px solid #e2e8f0" }}
                          >
                            {isLoading ? "…" : "Retirer"}
                          </button>
                        )}
                        {canAutoPublish && (a.statutContenu as string) !== "publie" && (
                          <button
                            onClick={() => handleStatut(a.id, "publier")}
                            disabled={isLoading}
                            style={{ ...s.actionBtn, background: "#dcfce7", color: "#15803d", border: "1px solid #bbf7d0" }}
                          >
                            {isLoading ? "…" : "Publier"}
                          </button>
                        )}
                      </div>
                    </div>
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
  label:     { fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 } as React.CSSProperties,
  input:     { width: "100%", padding: "9px 12px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 14, outline: "none", boxSizing: "border-box" as const } as React.CSSProperties,
  badge:     { padding: "2px 10px", borderRadius: 100, fontSize: 11, fontWeight: 600 } as React.CSSProperties,
  actionBtn: { padding: "5px 10px", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer" } as React.CSSProperties,
  editBtn:   { padding: "7px 14px", borderRadius: 7, border: "1.5px solid #e2e8f0", background: "white", color: "#1e3a8a", fontWeight: 600, fontSize: 13, cursor: "pointer" } as React.CSSProperties,
  deleteBtn: { padding: "7px 14px", borderRadius: 7, border: "none", background: "#fee2e2", color: "#b91c1c", fontWeight: 600, fontSize: 13, cursor: "pointer" } as React.CSSProperties,
  cancelBtn: { padding: "9px 20px", borderRadius: 8, border: "1.5px solid #e2e8f0", background: "white", color: "#374151", fontWeight: 600, fontSize: 14, cursor: "pointer" } as React.CSSProperties,
  submitBtn: { padding: "9px 24px", borderRadius: 8, border: "none", background: "#1e3a8a", color: "white", fontWeight: 700, fontSize: 14, cursor: "pointer" } as React.CSSProperties,
};
