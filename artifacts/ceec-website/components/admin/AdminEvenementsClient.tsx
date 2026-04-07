"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Evenement, Eglise } from "@prisma/client";

interface Props {
  initialEvenements: Evenement[];
  paroissesList: Eglise[];
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 14px", borderRadius: 8,
  border: "1px solid #d1d5db", fontSize: 14, outline: "none",
  background: "white", boxSizing: "border-box"
};
const labelStyle: React.CSSProperties = {
  display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6
};

type FormData = {
  titre: string;
  description: string;
  dateDebut: string;
  dateFin: string;
  lieu: string;
  egliseId: string;
  publie: boolean;
};

export default function AdminEvenementsClient({ initialEvenements, paroissesList }: Props) {
  const router = useRouter();
  const [evenements, setEvenements] = useState(initialEvenements);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<FormData>({
    titre: "", description: "", dateDebut: "",
    dateFin: "", lieu: "", egliseId: "", publie: true,
  });

  const resetForm = () => {
    setForm({ titre: "", description: "", dateDebut: "", dateFin: "", lieu: "", egliseId: "", publie: true });
    setEditId(null);
    setError("");
  };

  const handleEdit = (e: Evenement) => {
    const toDatetimeLocal = (d: Date | string | null) => {
      if (!d) return "";
      const date = new Date(d);
      return date.toISOString().slice(0, 16);
    };
    setForm({
      titre: e.titre,
      description: e.description || "",
      dateDebut: toDatetimeLocal(e.dateDebut),
      dateFin: toDatetimeLocal(e.dateFin),
      lieu: e.lieu || "",
      egliseId: e.egliseId?.toString() || "",
      publie: e.publie,
    });
    setEditId(e.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer cet événement ?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/evenements/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erreur lors de la suppression");
      setEvenements(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la suppression");
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch(editId ? `/api/evenements/${editId}` : "/api/evenements", {
        method: editId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          dateDebut: new Date(form.dateDebut).toISOString(),
          dateFin: form.dateFin ? new Date(form.dateFin).toISOString() : null,
          egliseId: form.egliseId ? parseInt(form.egliseId) : null,
        }),
      });
      if (!response.ok) {
        const d = await response.json();
        throw new Error(d.error || "Erreur serveur");
      }
      const saved = await response.json();
      if (editId) {
        setEvenements(prev => prev.map(ev => ev.id === editId ? saved : ev));
      } else {
        setEvenements(prev => [...prev, saved]);
      }
      resetForm();
      setShowForm(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la création");
    }
    setLoading(false);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2 style={{ fontWeight: 700, color: "#1e3a8a", fontSize: 20 }}>
          {evenements.length} événement{evenements.length > 1 ? "s" : ""}
        </h2>
        <button onClick={() => { resetForm(); setShowForm(!showForm); }} style={{ padding: "10px 24px", borderRadius: 8, background: "#1e3a8a", color: "white", fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer" }}>
          {showForm ? "Annuler" : "+ Créer un événement"}
        </button>
      </div>

      {showForm && (
        <div style={{ background: "white", borderRadius: 14, padding: "2rem", border: "1px solid #e2e8f0", marginBottom: 24 }}>
          <h3 style={{ fontWeight: 700, color: "#0f172a", marginBottom: 20 }}>
            {editId ? "Modifier l'événement" : "Nouvel événement"}
          </h3>
          {error && <div style={{ padding: "1rem", borderRadius: 10, background: "#fee2e2", color: "#dc2626", marginBottom: 16 }}>{error}</div>}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={labelStyle}>Titre *</label>
              <input type="text" required value={form.titre} onChange={e => setForm(f => ({ ...f, titre: e.target.value }))} style={inputStyle} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={labelStyle}>Date de début *</label>
                <input type="datetime-local" required value={form.dateDebut} onChange={e => setForm(f => ({ ...f, dateDebut: e.target.value }))} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Date de fin</label>
                <input type="datetime-local" value={form.dateFin} onChange={e => setForm(f => ({ ...f, dateFin: e.target.value }))} style={inputStyle} />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={labelStyle}>Lieu</label>
                <input type="text" value={form.lieu} onChange={e => setForm(f => ({ ...f, lieu: e.target.value }))} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Église (optionnel)</label>
                <select value={form.egliseId} onChange={e => setForm(f => ({ ...f, egliseId: e.target.value }))} style={{ ...inputStyle, cursor: "pointer" }}>
                  <option value="">Toute la CEEC</option>
                  {paroissesList.map(p => <option key={p.id} value={p.id.toString()}>{p.nom}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label style={labelStyle}>Description</label>
              <textarea rows={4} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={{ ...inputStyle, resize: "vertical" }} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <input type="checkbox" id="publie-evt" checked={form.publie} onChange={e => setForm(f => ({ ...f, publie: e.target.checked }))} />
              <label htmlFor="publie-evt" style={{ fontSize: 14, fontWeight: 500, color: "#374151", cursor: "pointer" }}>Publier immédiatement</label>
            </div>
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button type="button" onClick={() => { setShowForm(false); resetForm(); }} style={{ padding: "10px 24px", borderRadius: 8, border: "1px solid #e2e8f0", background: "white", cursor: "pointer", fontWeight: 600 }}>
                Annuler
              </button>
              <button type="submit" disabled={loading} style={{ padding: "10px 24px", borderRadius: 8, background: loading ? "#94a3b8" : "#d97706", color: "white", fontWeight: 700, border: "none", cursor: loading ? "not-allowed" : "pointer" }}>
                {loading ? "Sauvegarde..." : editId ? "Modifier" : "Créer l'événement"}
              </button>
            </div>
          </form>
        </div>
      )}

      {evenements.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", background: "white", borderRadius: 14, border: "1px dashed #e2e8f0" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🗓️</div>
          <p style={{ color: "#64748b" }}>Aucun événement créé. Ajoutez le premier événement.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {evenements.map(e => (
            <div key={e.id} style={{ background: "white", borderRadius: 14, padding: "1.5rem", border: "1px solid #e2e8f0", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", display: "flex", gap: 16, alignItems: "flex-start" }}>
              <div style={{ flexShrink: 0, width: 60, height: 60, background: "linear-gradient(135deg, #1e3a8a, #1e2d6b)", borderRadius: 10, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "white" }}>
                <div style={{ fontSize: 20, fontWeight: 800 }}>{new Date(e.dateDebut).getDate()}</div>
                <div style={{ fontSize: 10 }}>{new Date(e.dateDebut).toLocaleString("fr-FR", { month: "short" }).toUpperCase()}</div>
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ fontWeight: 700, color: "#0f172a", marginBottom: 4, fontSize: 16 }}>{e.titre}</h4>
                {e.lieu && <p style={{ color: "#64748b", fontSize: 13 }}>📍 {e.lieu}</p>}
                {e.description && <p style={{ color: "#475569", fontSize: 13, marginTop: 4 }}>{e.description}</p>}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end", flexShrink: 0 }}>
                <span style={{ display: "inline-block", fontSize: 11, padding: "3px 10px", borderRadius: 100, background: e.publie ? "#dcfce7" : "#f1f5f9", color: e.publie ? "#16a34a" : "#64748b", fontWeight: 700 }}>
                  {e.publie ? "Publié" : "Brouillon"}
                </span>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => handleEdit(e)} style={{ padding: "5px 10px", borderRadius: 6, border: "1px solid #e2e8f0", background: "white", cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#1e3a8a" }}>
                    Modifier
                  </button>
                  <button onClick={() => handleDelete(e.id)} style={{ padding: "5px 10px", borderRadius: 6, border: "1px solid #fee2e2", background: "#fee2e2", cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#dc2626" }}>
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
