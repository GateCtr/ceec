"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Evenement, Eglise } from "@prisma/client";
import { CalendarDays, MapPin, Globe, Users, Lock } from "lucide-react";
import ImagePicker from "@/components/gestion/ImagePicker";
import VideoPicker from "@/components/gestion/VideoPicker";

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
  imageUrl: string;
  videoUrl: string;
  visibilite: string;
  categorie: string;
  lienInscription: string;
};

const VISIBILITE_OPTIONS = [
  { value: "public", label: "Public", icon: Globe, color: "#16a34a", bg: "#dcfce7" },
  { value: "communaute", label: "Communauté", icon: Users, color: "#d97706", bg: "#fef3c7" },
  { value: "prive", label: "Privé", icon: Lock, color: "#dc2626", bg: "#fee2e2" },
];

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
    imageUrl: "", videoUrl: "", visibilite: "public",
    categorie: "", lienInscription: "",
  });

  const resetForm = () => {
    setForm({
      titre: "", description: "", dateDebut: "", dateFin: "",
      lieu: "", egliseId: "", publie: true, imageUrl: "",
      videoUrl: "", visibilite: "public", categorie: "", lienInscription: "",
    });
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
      imageUrl: e.imageUrl ?? "",
      videoUrl: e.videoUrl ?? "",
      visibilite: e.visibilite ?? "public",
      categorie: e.categorie ?? "",
      lienInscription: e.lienInscription ?? "",
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
          titre: form.titre,
          description: form.description || null,
          dateDebut: new Date(form.dateDebut).toISOString(),
          dateFin: form.dateFin ? new Date(form.dateFin).toISOString() : null,
          lieu: form.lieu || null,
          egliseId: form.egliseId ? parseInt(form.egliseId) : null,
          publie: form.publie,
          imageUrl: form.imageUrl || null,
          videoUrl: form.videoUrl || null,
          visibilite: form.visibilite,
          categorie: form.categorie || null,
          lienInscription: form.lienInscription || null,
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

  const selectedEgliseId = form.egliseId ? parseInt(form.egliseId) : undefined;

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

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={labelStyle}>Catégorie</label>
                <input type="text" value={form.categorie} onChange={e => setForm(f => ({ ...f, categorie: e.target.value }))} placeholder="Ex: culte, conférence…" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Lien d'inscription</label>
                <input type="url" value={form.lienInscription} onChange={e => setForm(f => ({ ...f, lienInscription: e.target.value }))} placeholder="https://…" style={inputStyle} />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Description</label>
              <textarea rows={4} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={{ ...inputStyle, resize: "vertical" }} />
            </div>

            <div>
              <label style={labelStyle}>Visibilité</label>
              <div style={{ display: "flex", gap: 10 }}>
                {VISIBILITE_OPTIONS.map(opt => {
                  const Icon = opt.icon;
                  const active = form.visibilite === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, visibilite: opt.value }))}
                      style={{
                        display: "flex", alignItems: "center", gap: 6, padding: "8px 14px",
                        borderRadius: 8, border: `2px solid ${active ? opt.color : "#e2e8f0"}`,
                        background: active ? opt.bg : "white", cursor: "pointer",
                        fontWeight: 600, fontSize: 13, color: active ? opt.color : "#64748b",
                        transition: "all 0.15s",
                      }}
                    >
                      <Icon size={14} />
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <ImagePicker
                label="Image (optionnel)"
                value={form.imageUrl}
                onChange={url => setForm(f => ({ ...f, imageUrl: url }))}
                egliseId={selectedEgliseId}
              />
              <VideoPicker
                label="Vidéo (optionnel)"
                value={form.videoUrl}
                onChange={url => setForm(f => ({ ...f, videoUrl: url }))}
                egliseId={selectedEgliseId}
              />
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
          <div style={{ marginBottom: 12, display: "flex", justifyContent: "center" }}><CalendarDays size={48} style={{ color: "#1e3a8a" }} /></div>
          <p style={{ color: "#64748b" }}>Aucun événement créé. Ajoutez le premier événement.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {evenements.map(e => (
            <div key={e.id} style={{ background: "white", borderRadius: 14, padding: "1.5rem", border: "1px solid #e2e8f0", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", display: "flex", gap: 16, alignItems: "flex-start" }}>
              {e.imageUrl ? (
                <img src={e.imageUrl} alt="" style={{ width: 64, height: 64, borderRadius: 10, objectFit: "cover", flexShrink: 0 }} />
              ) : (
                <div style={{ flexShrink: 0, width: 60, height: 60, background: "linear-gradient(135deg, #1e3a8a, #1e2d6b)", borderRadius: 10, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "white" }}>
                  <div style={{ fontSize: 20, fontWeight: 800 }}>{new Date(e.dateDebut).getDate()}</div>
                  <div style={{ fontSize: 10 }}>{new Date(e.dateDebut).toLocaleString("fr-FR", { month: "short" }).toUpperCase()}</div>
                </div>
              )}
              <div style={{ flex: 1 }}>
                <h4 style={{ fontWeight: 700, color: "#0f172a", marginBottom: 4, fontSize: 16 }}>{e.titre}</h4>
                {e.lieu && <p style={{ color: "#64748b", fontSize: 13, display: "flex", alignItems: "center", gap: 4 }}><MapPin size={13} /> {e.lieu}</p>}
                {e.description && <p style={{ color: "#475569", fontSize: 13, marginTop: 4 }}>{e.description}</p>}
                <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" as const }}>
                  {e.visibilite && e.visibilite !== "public" && (
                    <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 100, background: "#fef3c7", color: "#92400e" }}>
                      {e.visibilite === "communaute" ? "Communauté" : "Privé"}
                    </span>
                  )}
                  {e.categorie && <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 100, background: "#f0f9ff", color: "#0369a1" }}>{e.categorie}</span>}
                  {e.videoUrl && <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 100, background: "#f0fdf4", color: "#166534" }}>Vidéo</span>}
                </div>
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
