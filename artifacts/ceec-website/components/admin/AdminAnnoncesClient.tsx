"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Annonce, Eglise } from "@prisma/client";
import { Megaphone, Globe, Users, Lock } from "lucide-react";
import ImagePicker from "@/components/gestion/ImagePicker";
import VideoPicker from "@/components/gestion/VideoPicker";

interface Props {
  initialAnnonces: Annonce[];
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
  contenu: string;
  priorite: string;
  egliseId: string;
  publie: boolean;
  imageUrl: string;
  videoUrl: string;
  visibilite: string;
  categorie: string;
  dateExpiration: string;
};

const VISIBILITE_OPTIONS = [
  { value: "public", label: "Public", icon: Globe, color: "#16a34a", bg: "#dcfce7" },
  { value: "communaute", label: "Communauté", icon: Users, color: "#d97706", bg: "#fef3c7" },
  { value: "prive", label: "Privé", icon: Lock, color: "#dc2626", bg: "#fee2e2" },
];

export default function AdminAnnoncesClient({ initialAnnonces, paroissesList }: Props) {
  const router = useRouter();
  const [annonces, setAnnonces] = useState(initialAnnonces);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<FormData>({
    titre: "", contenu: "", priorite: "normale",
    egliseId: "", publie: true, imageUrl: "", videoUrl: "",
    visibilite: "public", categorie: "", dateExpiration: "",
  });

  const resetForm = () => {
    setForm({
      titre: "", contenu: "", priorite: "normale", egliseId: "", publie: true,
      imageUrl: "", videoUrl: "", visibilite: "public", categorie: "", dateExpiration: "",
    });
    setEditId(null);
    setError("");
  };

  const handleEdit = (a: Annonce) => {
    setForm({
      titre: a.titre,
      contenu: a.contenu,
      priorite: a.priorite,
      egliseId: a.egliseId?.toString() || "",
      publie: a.publie,
      imageUrl: a.imageUrl ?? "",
      videoUrl: a.videoUrl ?? "",
      visibilite: a.visibilite ?? "public",
      categorie: a.categorie ?? "",
      dateExpiration: a.dateExpiration ? new Date(a.dateExpiration).toISOString().slice(0, 10) : "",
    });
    setEditId(a.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer cette annonce ?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/annonces/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erreur lors de la suppression");
      setAnnonces(prev => prev.filter(a => a.id !== id));
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
      const response = await fetch(editId ? `/api/annonces/${editId}` : "/api/annonces", {
        method: editId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titre: form.titre,
          contenu: form.contenu,
          priorite: form.priorite,
          egliseId: form.egliseId ? parseInt(form.egliseId) : null,
          publie: form.publie,
          imageUrl: form.imageUrl || null,
          videoUrl: form.videoUrl || null,
          visibilite: form.visibilite,
          categorie: form.categorie || null,
          dateExpiration: form.dateExpiration || null,
        }),
      });
      if (!response.ok) {
        const d = await response.json();
        throw new Error(d.error || "Erreur serveur");
      }
      const saved = await response.json();
      if (editId) {
        setAnnonces(prev => prev.map(a => a.id === editId ? saved : a));
      } else {
        setAnnonces(prev => [saved, ...prev]);
      }
      resetForm();
      setShowForm(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la publication");
    }
    setLoading(false);
  };

  const prioriteStyle = (p: string) => {
    if (p === "urgente") return { bg: "#fee2e2", color: "#dc2626", label: "Urgent" };
    if (p === "haute") return { bg: "#fef3c7", color: "#d97706", label: "Important" };
    return { bg: "#e0f2fe", color: "#0369a1", label: "Information" };
  };

  const selectedEgliseId = form.egliseId ? parseInt(form.egliseId) : undefined;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2 style={{ fontWeight: 700, color: "#1e3a8a", fontSize: 20 }}>
          {annonces.length} annonce{annonces.length > 1 ? "s" : ""}
        </h2>
        <button
          onClick={() => { resetForm(); setShowForm(!showForm); }}
          style={{ padding: "10px 24px", borderRadius: 8, background: "#1e3a8a", color: "white", fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer" }}
        >
          {showForm ? "Annuler" : "+ Publier une annonce"}
        </button>
      </div>

      {showForm && (
        <div style={{ background: "white", borderRadius: 14, padding: "2rem", border: "1px solid #e2e8f0", marginBottom: 24 }}>
          <h3 style={{ fontWeight: 700, color: "#0f172a", marginBottom: 20 }}>
            {editId ? "Modifier l'annonce" : "Nouvelle annonce"}
          </h3>
          {error && <div style={{ padding: "1rem", borderRadius: 10, background: "#fee2e2", color: "#dc2626", marginBottom: 16 }}>{error}</div>}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            <div>
              <label style={labelStyle}>Titre *</label>
              <input type="text" required value={form.titre} onChange={e => setForm(f => ({ ...f, titre: e.target.value }))} style={inputStyle} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={labelStyle}>Priorité</label>
                <select value={form.priorite} onChange={e => setForm(f => ({ ...f, priorite: e.target.value }))} style={{ ...inputStyle, cursor: "pointer" }}>
                  <option value="normale">Normale</option>
                  <option value="haute">Haute</option>
                  <option value="urgente">Urgente</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Église (optionnel)</label>
                <select value={form.egliseId} onChange={e => setForm(f => ({ ...f, egliseId: e.target.value }))} style={{ ...inputStyle, cursor: "pointer" }}>
                  <option value="">Toutes les églises</option>
                  {paroissesList.map(p => <option key={p.id} value={p.id.toString()}>{p.nom}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={labelStyle}>Catégorie</label>
                <input type="text" value={form.categorie} onChange={e => setForm(f => ({ ...f, categorie: e.target.value }))} placeholder="Ex: culte, jeunesse…" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Date d'expiration</label>
                <input type="date" value={form.dateExpiration} onChange={e => setForm(f => ({ ...f, dateExpiration: e.target.value }))} style={inputStyle} />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Contenu *</label>
              <textarea required rows={5} value={form.contenu} onChange={e => setForm(f => ({ ...f, contenu: e.target.value }))} style={{ ...inputStyle, resize: "vertical" }} />
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
              <input type="checkbox" id="publie" checked={form.publie} onChange={e => setForm(f => ({ ...f, publie: e.target.checked }))} />
              <label htmlFor="publie" style={{ fontSize: 14, fontWeight: 500, color: "#374151", cursor: "pointer" }}>Publier immédiatement</label>
            </div>

            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button type="button" onClick={() => { setShowForm(false); resetForm(); }} style={{ padding: "10px 24px", borderRadius: 8, border: "1px solid #e2e8f0", background: "white", cursor: "pointer", fontWeight: 600 }}>
                Annuler
              </button>
              <button type="submit" disabled={loading} style={{ padding: "10px 24px", borderRadius: 8, background: loading ? "#94a3b8" : "#16a34a", color: "white", fontWeight: 700, border: "none", cursor: loading ? "not-allowed" : "pointer" }}>
                {loading ? "Sauvegarde..." : editId ? "Modifier" : "Publier l'annonce"}
              </button>
            </div>
          </form>
        </div>
      )}

      {annonces.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", background: "white", borderRadius: 14, border: "1px dashed #e2e8f0" }}>
          <div style={{ marginBottom: 12, display: "flex", justifyContent: "center" }}><Megaphone size={48} style={{ color: "#94a3b8" }} /></div>
          <p style={{ color: "#64748b" }}>Aucune annonce publiée. Créez votre première annonce.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {annonces.map(a => {
            const style = prioriteStyle(a.priorite);
            return (
              <div key={a.id} style={{ background: "white", borderRadius: 14, padding: "1.5rem", border: "1px solid #e2e8f0", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap" as const, gap: 8, marginBottom: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
                    <span style={{ display: "inline-block", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 100, background: style.bg, color: style.color, flexShrink: 0 }}>
                      {style.label}
                    </span>
                    <h3 style={{ fontWeight: 700, color: "#0f172a", fontSize: 15 }}>{a.titre}</h3>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
                    {a.imageUrl && (
                      <img src={a.imageUrl} alt="" style={{ width: 40, height: 40, borderRadius: 6, objectFit: "cover", border: "1px solid #e2e8f0" }} />
                    )}
                    <span style={{ fontSize: 12, color: "#94a3b8" }}>
                      {new Date(a.datePublication).toLocaleDateString("fr-FR")}
                    </span>
                    <button onClick={() => handleEdit(a)} style={{ padding: "5px 10px", borderRadius: 6, border: "1px solid #e2e8f0", background: "white", cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#1e3a8a" }}>
                      Modifier
                    </button>
                    <button onClick={() => handleDelete(a.id)} style={{ padding: "5px 10px", borderRadius: 6, border: "1px solid #fee2e2", background: "#fee2e2", cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#dc2626" }}>
                      Supprimer
                    </button>
                  </div>
                </div>
                <p style={{ color: "#475569", fontSize: 14, lineHeight: 1.7 }}>{a.contenu}</p>
                <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" as const }}>
                  {!a.publie && <span style={{ display: "inline-block", fontSize: 12, padding: "2px 8px", borderRadius: 100, background: "#f1f5f9", color: "#64748b" }}>Non publié</span>}
                  {a.visibilite && a.visibilite !== "public" && (
                    <span style={{ display: "inline-block", fontSize: 12, padding: "2px 8px", borderRadius: 100, background: "#fef3c7", color: "#92400e" }}>
                      {a.visibilite === "communaute" ? "Communauté" : "Privé"}
                    </span>
                  )}
                  {a.categorie && <span style={{ display: "inline-block", fontSize: 12, padding: "2px 8px", borderRadius: 100, background: "#f0f9ff", color: "#0369a1" }}>{a.categorie}</span>}
                  {a.videoUrl && <span style={{ display: "inline-block", fontSize: 12, padding: "2px 8px", borderRadius: 100, background: "#f0fdf4", color: "#166534" }}>Vidéo</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
