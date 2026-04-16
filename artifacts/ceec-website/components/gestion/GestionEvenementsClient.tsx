"use client";

import React, { useState } from "react";
import type { Evenement } from "@prisma/client";
import { Calendar as CalendarIcon, MapPin } from "lucide-react";
import ImagePicker from "@/components/gestion/ImagePicker";

interface Props {
  initialEvenements: Evenement[];
  canAutoPublish: boolean;
  egliseId: number;
}

const statutLabels: Record<string, { label: string; bg: string; color: string }> = {
  publie:     { label: "Publié",     bg: "#dcfce7", color: "#15803d" },
  brouillon:  { label: "Brouillon",  bg: "#f1f5f9", color: "#64748b" },
  en_attente: { label: "En attente", bg: "#fef9c3", color: "#a16207" },
  rejete:     { label: "Rejeté",     bg: "#fee2e2", color: "#b91c1c" },
};

const CATEGORIES_EVT = ["", "Culte", "Conférence", "Retraite", "Formation", "Mission", "Social", "Jeunesse", "Femmes", "Hommes", "Concert", "Autre"];

type FormData = {
  titre: string;
  description: string;
  dateDebut: string;
  dateFin: string;
  lieu: string;
  publie: boolean;
  imageUrl: string;
  categorie: string;
  lienInscription: string;
};

const emptyForm: FormData = {
  titre: "", description: "", dateDebut: "", dateFin: "", lieu: "", publie: true,
  imageUrl: "", categorie: "", lienInscription: "",
};

export default function GestionEvenementsClient({ initialEvenements, canAutoPublish, egliseId }: Props) {
  const [evenements, setEvenements] = useState<Evenement[]>(initialEvenements);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Evenement | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  function toDateInput(d: Date | string | null | undefined): string {
    if (!d) return "";
    return new Date(d).toISOString().slice(0, 16);
  }

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
    setError(null);
  }

  function openEdit(e: Evenement) {
    setEditing(e);
    setForm({
      titre: e.titre,
      description: e.description ?? "",
      dateDebut: toDateInput(e.dateDebut),
      dateFin: toDateInput(e.dateFin),
      lieu: e.lieu ?? "",
      publie: e.publie,
      imageUrl: e.imageUrl ?? "",
      categorie: e.categorie ?? "",
      lienInscription: e.lienInscription ?? "",
    });
    setShowForm(true);
    setError(null);
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const body = {
        ...form,
        dateFin: form.dateFin || null,
        description: form.description || null,
        lieu: form.lieu || null,
        imageUrl: form.imageUrl || null,
        categorie: form.categorie || null,
        lienInscription: form.lienInscription || null,
      };
      let res;
      if (editing) {
        res = await fetch(`/api/gestion/evenements/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } else {
        res = await fetch("/api/gestion/evenements", {
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
        setEvenements((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
      } else {
        setEvenements((prev) => [...prev, updated].sort((a, b) => new Date(a.dateDebut).getTime() - new Date(b.dateDebut).getTime()));
      }
      setShowForm(false);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Supprimer cet événement ?")) return;
    const res = await fetch(`/api/gestion/evenements/${id}`, { method: "DELETE" });
    if (res.ok) setEvenements((prev) => prev.filter((e) => e.id !== id));
  }

  async function handleStatut(id: number, action: "soumettre" | "depublier" | "publier") {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/gestion/evenements/${id}/statut`, {
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
      setEvenements((prev) => prev.map((e) => (e.id === id ? updated : e)));
    } finally {
      setActionLoading(null);
    }
  }

  const isPast = (d: Date | string) => new Date(d) < new Date();

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
        {!canAutoPublish && (
          <div style={{ fontSize: 13, color: "#64748b", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "6px 12px" }}>
            Votre contenu sera soumis pour validation avant publication.
          </div>
        )}
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <a
            href="/api/gestion/evenements/export"
            download
            style={{ padding: "9px 16px", borderRadius: 8, border: "1.5px solid #e2e8f0", background: "white", color: "#374151", fontSize: 13, fontWeight: 600, cursor: "pointer", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 5 }}
          >
            ↓ Exporter CSV
          </a>
          <button onClick={openCreate} style={{ background: "#1e3a8a", color: "white", border: "none", borderRadius: 8, padding: "10px 20px", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
            + Nouvel événement
          </button>
        </div>
      </div>

      {showForm && (
        <div style={{ background: "white", borderRadius: 14, padding: "1.5rem", border: "1px solid #e2e8f0", marginBottom: 24, boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}>
          <h2 style={{ margin: "0 0 16px", fontSize: 17, fontWeight: 700, color: "#0f172a" }}>
            {editing ? "Modifier l\u2019événement" : "Nouvel événement"}
          </h2>
          {!canAutoPublish && !editing && (
            <div style={{ background: "#fef9c3", border: "1px solid #fcd34d", borderRadius: 8, padding: "8px 12px", marginBottom: 12, fontSize: 13, color: "#a16207" }}>
              Cet événement sera créé en brouillon. Soumettez-le pour qu&apos;il soit examiné et publié.
            </div>
          )}
          {error && <div style={{ background: "#fee2e2", color: "#b91c1c", padding: "8px 12px", borderRadius: 6, marginBottom: 12, fontSize: 13 }}>{error}</div>}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={s.label}>Titre *</label>
              <input style={s.input} value={form.titre} onChange={(e) => setForm({ ...form, titre: e.target.value })} required />
            </div>
            <div>
              <label style={s.label}>Description</label>
              <textarea style={{ ...s.input, minHeight: 90, resize: "vertical" }} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label style={s.label}>Catégorie</label>
                <select style={s.input} value={form.categorie} onChange={(e) => setForm({ ...form, categorie: e.target.value })}>
                  {CATEGORIES_EVT.map((c) => <option key={c} value={c}>{c || "— Aucune —"}</option>)}
                </select>
              </div>
              <div>
                <label style={s.label}>Lieu</label>
                <input style={s.input} value={form.lieu} onChange={(e) => setForm({ ...form, lieu: e.target.value })} placeholder="Ex: Salle principale, Kinshasa" />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label style={s.label}>Date de début *</label>
                <input type="datetime-local" style={s.input} value={form.dateDebut} onChange={(e) => setForm({ ...form, dateDebut: e.target.value })} required />
              </div>
              <div>
                <label style={s.label}>Date de fin</label>
                <input type="datetime-local" style={s.input} value={form.dateFin} onChange={(e) => setForm({ ...form, dateFin: e.target.value })} />
              </div>
            </div>
            <ImagePicker
              label="Image"
              value={form.imageUrl}
              egliseId={egliseId}
              onChange={(url) => setForm({ ...form, imageUrl: url })}
            />
            <div>
              <label style={s.label}>Lien d&apos;inscription (URL externe)</label>
              <input style={s.input} value={form.lienInscription} onChange={(e) => setForm({ ...form, lienInscription: e.target.value })} placeholder="https://forms.google.com/..." />
            </div>
            {canAutoPublish && (
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <input type="checkbox" id="publie-evt" checked={form.publie} onChange={(e) => setForm({ ...form, publie: e.target.checked })} />
                <label htmlFor="publie-evt" style={{ fontSize: 14, color: "#374151" }}>Publier immédiatement</label>
              </div>
            )}
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button type="button" onClick={() => setShowForm(false)} style={s.cancelBtn}>Annuler</button>
              <button type="submit" style={s.submitBtn} disabled={loading}>
                {loading ? "Enregistrement…" : (editing ? "Mettre à jour" : "Créer")}
              </button>
            </div>
          </form>
        </div>
      )}

      {evenements.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", background: "white", borderRadius: 14, border: "1px dashed #cbd5e1" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
            <CalendarIcon size={40} color="#cbd5e1" />
          </div>
          <p style={{ color: "#64748b" }}>Aucun événement pour l&apos;instant.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {evenements.map((e) => {
            const past = isPast(e.dateDebut);
            const statut = statutLabels[e.statutContenu as string] ?? statutLabels.brouillon;
            const isLoading = actionLoading === e.id;
            return (
              <div key={e.id} style={{ background: "white", borderRadius: 12, border: "1px solid #e2e8f0", display: "flex", overflow: "hidden", opacity: past ? 0.85 : 1 }}>
                {e.imageUrl && (
                  <div style={{ width: 100, flexShrink: 0, background: "#f1f5f9" }}>
                    <img src={e.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  </div>
                )}
                <div style={{ flex: 1, padding: "1rem 1.25rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                        <span style={{ fontWeight: 700, fontSize: 15, color: "#0f172a" }}>{e.titre}</span>
                        <span style={{ ...s.badge, background: statut.bg, color: statut.color }}>{statut.label}</span>
                        {e.categorie && <span style={{ ...s.badge, background: "#eff6ff", color: "#1e40af" }}>{e.categorie}</span>}
                        {past && <span style={{ ...s.badge, background: "#f1f5f9", color: "#94a3b8" }}>Passé</span>}
                      </div>
                      <div style={{ fontSize: 13, color: "#64748b", display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                        <CalendarIcon size={13} color="#94a3b8" />
                        {new Date(e.dateDebut).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        {e.lieu && <><span style={{ color: "#cbd5e1" }}>—</span><MapPin size={13} color="#94a3b8" />{e.lieu}</>}
                      </div>
                      {e.description && <p style={{ color: "#64748b", fontSize: 13, margin: "4px 0 0", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const }}>{e.description}</p>}
                      {(e.statutContenu as string) === "rejete" && (e as Evenement & { commentaireRejet?: string | null }).commentaireRejet && (
                        <div style={{ marginTop: 6, background: "#fee2e2", borderRadius: 6, padding: "4px 10px", fontSize: 12, color: "#b91c1c" }}>
                          Motif : {(e as Evenement & { commentaireRejet?: string | null }).commentaireRejet}
                        </div>
                      )}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0, alignItems: "flex-end" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => openEdit(e)} style={s.editBtn} disabled={isLoading}>Modifier</button>
                        <button onClick={() => handleDelete(e.id)} style={s.deleteBtn} disabled={isLoading}>Supprimer</button>
                      </div>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
                        {(e.statutContenu as string) !== "en_attente" && (e.statutContenu as string) !== "publie" && (
                          <button
                            onClick={() => handleStatut(e.id, "soumettre")}
                            disabled={isLoading}
                            style={{ ...s.actionBtn, background: "#fef9c3", color: "#a16207", border: "1px solid #fde68a" }}
                          >
                            {isLoading ? "…" : "Soumettre"}
                          </button>
                        )}
                        {(e.statutContenu as string) === "publie" && (
                          <button
                            onClick={() => handleStatut(e.id, "depublier")}
                            disabled={isLoading}
                            style={{ ...s.actionBtn, background: "#f1f5f9", color: "#64748b", border: "1px solid #e2e8f0" }}
                          >
                            {isLoading ? "…" : "Dépublier"}
                          </button>
                        )}
                        {(e.statutContenu as string) === "en_attente" && (
                          <button
                            onClick={() => handleStatut(e.id, "depublier")}
                            disabled={isLoading}
                            style={{ ...s.actionBtn, background: "#f1f5f9", color: "#64748b", border: "1px solid #e2e8f0" }}
                          >
                            {isLoading ? "…" : "Retirer"}
                          </button>
                        )}
                        {canAutoPublish && (e.statutContenu as string) !== "publie" && (
                          <button
                            onClick={() => handleStatut(e.id, "publier")}
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
