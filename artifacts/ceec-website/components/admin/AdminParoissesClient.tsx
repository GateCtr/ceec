"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Eglise } from "@prisma/client";

interface Props {
  initialParoisses: Eglise[];
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
  nom: string;
  ville: string;
  adresse: string;
  pasteur: string;
  telephone: string;
  email: string;
  description: string;
};

export default function AdminParoissesClient({ initialParoisses }: Props) {
  const router = useRouter();
  const [paroisses, setParoisses] = useState(initialParoisses);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<FormData>({
    nom: "", ville: "", adresse: "", pasteur: "",
    telephone: "", email: "", description: ""
  });

  const resetForm = () => {
    setForm({ nom: "", ville: "", adresse: "", pasteur: "", telephone: "", email: "", description: "" });
    setEditId(null);
    setError("");
  };

  const handleEdit = (p: Eglise) => {
    setForm({
      nom: p.nom, ville: p.ville, adresse: p.adresse || "",
      pasteur: p.pasteur || "", telephone: p.telephone || "",
      email: p.email || "", description: p.description || ""
    });
    setEditId(p.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer cette eglise ?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/paroisses/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erreur lors de la suppression");
      setParoisses(prev => prev.filter(p => p.id !== id));
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
      const response = await fetch(editId ? `/api/paroisses/${editId}` : "/api/paroisses", {
        method: editId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!response.ok) {
        const d = await response.json();
        throw new Error(d.error || "Erreur serveur");
      }
      const saved = await response.json();
      if (editId) {
        setParoisses(prev => prev.map(p => p.id === editId ? saved : p));
      } else {
        setParoisses(prev => [...prev, saved]);
      }
      resetForm();
      setShowForm(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    }
    setLoading(false);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2 style={{ fontWeight: 700, color: "#1e3a8a", fontSize: 20 }}>
          {paroisses.length} eglise{paroisses.length > 1 ? "s" : ""}
        </h2>
        <button
          onClick={() => { resetForm(); setShowForm(!showForm); }}
          style={{ padding: "10px 24px", borderRadius: 8, background: "#1e3a8a", color: "white", fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer" }}
        >
          {showForm ? "Annuler" : "+ Nouvelle eglise"}
        </button>
      </div>

      {showForm && (
        <div style={{ background: "white", borderRadius: 14, padding: "2rem", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", marginBottom: 24 }}>
          <h3 style={{ fontWeight: 700, color: "#0f172a", marginBottom: 20 }}>
            {editId ? "Modifier l'eglise" : "Nouvelle eglise"}
          </h3>
          {error && <div style={{ padding: "1rem", borderRadius: 10, background: "#fee2e2", color: "#dc2626", marginBottom: 16 }}>{error}</div>}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={labelStyle}>Nom de l&apos;eglise *</label>
                <input type="text" required value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} style={inputStyle} placeholder="Ex: Eglise Centrale CEEC" />
              </div>
              <div>
                <label style={labelStyle}>Ville *</label>
                <input type="text" required value={form.ville} onChange={e => setForm(f => ({ ...f, ville: e.target.value }))} style={inputStyle} placeholder="Ex: Kinshasa" />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={labelStyle}>Pasteur</label>
                <input type="text" value={form.pasteur} onChange={e => setForm(f => ({ ...f, pasteur: e.target.value }))} style={inputStyle} placeholder="Nom du pasteur" />
              </div>
              <div>
                <label style={labelStyle}>Telephone</label>
                <input type="tel" value={form.telephone} onChange={e => setForm(f => ({ ...f, telephone: e.target.value }))} style={inputStyle} placeholder="+243..." />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Email</label>
              <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Adresse</label>
              <input type="text" value={form.adresse} onChange={e => setForm(f => ({ ...f, adresse: e.target.value }))} style={inputStyle} placeholder="Adresse complete" />
            </div>
            <div>
              <label style={labelStyle}>Description</label>
              <textarea rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={{ ...inputStyle, resize: "vertical" }} placeholder="Breve description de l'eglise" />
            </div>
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button type="button" onClick={() => { setShowForm(false); resetForm(); }} style={{ padding: "10px 24px", borderRadius: 8, border: "1px solid #e2e8f0", background: "white", cursor: "pointer", fontWeight: 600 }}>
                Annuler
              </button>
              <button type="submit" disabled={loading} style={{ padding: "10px 24px", borderRadius: 8, background: loading ? "#94a3b8" : "#1e3a8a", color: "white", fontWeight: 700, border: "none", cursor: loading ? "not-allowed" : "pointer" }}>
                {loading ? "Sauvegarde..." : editId ? "Modifier" : "Creer l'eglise"}
              </button>
            </div>
          </form>
        </div>
      )}

      {paroisses.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem", background: "white", borderRadius: 14, border: "1px dashed #e2e8f0" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⛪</div>
          <h3 style={{ color: "#1e3a8a", fontWeight: 700, marginBottom: 8 }}>Aucune eglise enregistree</h3>
          <p style={{ color: "#64748b" }}>Ajoutez la premiere eglise de la plateforme.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {paroisses.map((p) => (
            <div key={p.id} style={{ background: "white", borderRadius: 14, padding: "1.25rem 1.5rem", border: "1px solid #e2e8f0", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: "linear-gradient(135deg, #1e3a8a, #1e2d6b)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 800, fontSize: 18, flexShrink: 0 }}>
                  {p.nom.charAt(0)}
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: "#0f172a", fontSize: 15 }}>{p.nom}</div>
                  <div style={{ color: "#64748b", fontSize: 13 }}>{p.ville}{p.pasteur ? ` \u00b7 ${p.pasteur}` : ""}</div>
                  {p.slug && <div style={{ color: "#c59b2e", fontSize: 12, fontWeight: 600 }}>{p.slug}.ceec.cd</div>}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 100, background: p.statut === "actif" ? "#dcfce7" : "#fee2e2", color: p.statut === "actif" ? "#16a34a" : "#dc2626" }}>
                  {p.statut === "actif" ? "Active" : "Suspendue"}
                </span>
                <button onClick={() => handleEdit(p)} style={{ padding: "6px 14px", borderRadius: 6, border: "1px solid #e2e8f0", background: "white", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#1e3a8a" }}>
                  Modifier
                </button>
                <button onClick={() => handleDelete(p.id)} style={{ padding: "6px 14px", borderRadius: 6, border: "1px solid #fee2e2", background: "#fee2e2", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#dc2626" }}>
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
