"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Eglise } from "@prisma/client";

interface MembreAvecEglise {
  id: number;
  clerkUserId: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string | null;
  egliseId: number | null;
  statut: string;
  dateAdhesion: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  suspendedByChurch: boolean;
  roleNom: string;
  eglise: Eglise | null;
}

interface Props {
  initialMembres: MembreAvecEglise[];
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

const ROLE_LABELS: Record<string, { label: string; bg: string; color: string }> = {
  fidele:           { label: "Fidèle",          bg: "#e0e7ff", color: "#3730a3" },
  diacre:           { label: "Diacre",           bg: "#fef9c3", color: "#a16207" },
  tresorier:        { label: "Trésorier",        bg: "#ffedd5", color: "#c2410c" },
  secretaire:       { label: "Secrétaire",       bg: "#e0f2fe", color: "#0369a1" },
  pasteur:          { label: "Pasteur",          bg: "#ede9fe", color: "#6d28d9" },
  admin_eglise:     { label: "Admin église",     bg: "#dcfce7", color: "#15803d" },
  super_admin:      { label: "Super Admin",      bg: "#fce7f3", color: "#9d174d" },
  admin_plateforme: { label: "Admin plateforme", bg: "#ede9fe", color: "#6d28d9" },
};

function getRoleDisplay(roleNom: string) {
  return ROLE_LABELS[roleNom] ?? { label: roleNom, bg: "#f1f5f9", color: "#475569" };
}

export default function AdminMembresClient({ initialMembres, paroissesList }: Props) {
  const router = useRouter();
  const [membres, setMembres] = useState(initialMembres);
  const [editId, setEditId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editForm, setEditForm] = useState<{
    role: string;
    statut: string;
    egliseId: string;
  } | null>(null);

  const sansParoisse = membres.filter(m => !m.egliseId);
  const avecParoisse = membres.filter(m => !!m.egliseId);

  const handleEdit = (m: MembreAvecEglise) => {
    setEditId(m.id);
    setEditForm({
      role: m.roleNom,
      statut: m.statut,
      egliseId: m.egliseId?.toString() || "",
    });
    setError("");
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setEditForm(null);
    setError("");
  };

  const handleSave = async (id: number, m: MembreAvecEglise) => {
    if (!editForm) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/membres/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nom: m.nom,
          prenom: m.prenom,
          email: m.email,
          telephone: m.telephone,
          egliseId: editForm.egliseId ? parseInt(editForm.egliseId) : null,
          role: editForm.role,
          statut: editForm.statut,
        }),
      });
      if (!response.ok) {
        const d = await response.json();
        throw new Error(d.error || "Erreur serveur");
      }
      const updated = await response.json();
      setMembres(prev => prev.map(item =>
        item.id === id
          ? { ...updated, eglise: paroissesList.find(p => p.id === updated.egliseId) || null }
          : item
      ));
      setEditId(null);
      setEditForm(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    }
    setLoading(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer ce membre ? Cette action est irréversible.")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/membres/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erreur lors de la suppression");
      setMembres(prev => prev.filter(item => item.id !== id));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la suppression");
    }
    setLoading(false);
  };

  const renderMembre = (m: MembreAvecEglise) => {
    const eg = m.eglise;
    const rd = getRoleDisplay(m.roleNom);
    return (
      <div key={m.id} style={{ background: "white", borderRadius: 14, padding: "1.25rem 1.5rem", border: "1px solid #e2e8f0", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
        {editId === m.id && editForm ? (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#1e3a8a", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: 14 }}>
                {m.prenom.charAt(0)}
              </div>
              <div>
                <div style={{ fontWeight: 600, color: "#0f172a" }}>{m.prenom} {m.nom}</div>
                <div style={{ color: "#64748b", fontSize: 13 }}>{m.email}</div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>Rôle église</label>
                <select value={editForm.role} onChange={e => setEditForm(f => f ? { ...f, role: e.target.value } : f)} style={{ ...inputStyle, cursor: "pointer" }}>
                  <option value="fidele">Fidèle</option>
                  <option value="diacre">Diacre</option>
                  <option value="secretaire">Secrétaire</option>
                  <option value="tresorier">Trésorier</option>
                  <option value="pasteur">Pasteur</option>
                  <option value="admin_eglise">Admin église</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Statut</label>
                <select value={editForm.statut} onChange={e => setEditForm(f => f ? { ...f, statut: e.target.value } : f)} style={{ ...inputStyle, cursor: "pointer" }}>
                  <option value="actif">Actif</option>
                  <option value="inactif">Inactif</option>
                  <option value="suspendu">Suspendu</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Église</label>
                <select value={editForm.egliseId} onChange={e => setEditForm(f => f ? { ...f, egliseId: e.target.value } : f)} style={{ ...inputStyle, cursor: "pointer" }}>
                  <option value="">Aucune église</option>
                  {paroissesList.map(eg => <option key={eg.id} value={eg.id.toString()}>{eg.nom}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={handleCancelEdit} style={{ padding: "8px 16px", borderRadius: 6, border: "1px solid #e2e8f0", background: "white", cursor: "pointer", fontWeight: 600, fontSize: 13 }}>
                Annuler
              </button>
              <button onClick={() => handleSave(m.id, m)} disabled={loading} style={{ padding: "8px 16px", borderRadius: 6, background: loading ? "#94a3b8" : "#1e3a8a", color: "white", fontWeight: 700, border: "none", cursor: loading ? "not-allowed" : "pointer", fontSize: 13 }}>
                {loading ? "Sauvegarde..." : "Enregistrer"}
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" as const, gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#1e3a8a", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                {m.prenom.charAt(0)}
              </div>
              <div>
                <div style={{ fontWeight: 600, color: "#0f172a", fontSize: 14 }}>{m.prenom} {m.nom}</div>
                <div style={{ color: "#64748b", fontSize: 13 }}>{m.email}</div>
                {eg
                  ? <div style={{ color: "#c59b2e", fontSize: 12, fontWeight: 600 }}>{eg.nom}</div>
                  : <div style={{ color: "#dc2626", fontSize: 12, fontWeight: 600 }}>⚠ Sans paroisse</div>
                }
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ display: "inline-block", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 100, background: rd.bg, color: rd.color }}>
                {rd.label}
              </span>
              <span style={{ display: "inline-block", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 100, background: m.statut === "actif" ? "#dcfce7" : m.statut === "suspendu" ? "#fee2e2" : "#f1f5f9", color: m.statut === "actif" ? "#16a34a" : m.statut === "suspendu" ? "#dc2626" : "#64748b" }}>
                {m.statut === "actif" ? "Actif" : m.statut === "suspendu" ? "Suspendu" : "Inactif"}
              </span>
              <button onClick={() => handleEdit(m)} style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid #e2e8f0", background: "white", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#1e3a8a" }}>
                Modifier
              </button>
              <button onClick={() => handleDelete(m.id)} style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid #fee2e2", background: "#fee2e2", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#dc2626" }}>
                Supprimer
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 10 }}>
        <h2 style={{ fontWeight: 700, color: "#1e3a8a", fontSize: 20 }}>
          {membres.length} membre{membres.length > 1 ? "s" : ""} au total
        </h2>
        <a
          href="/api/admin/membres/export"
          download
          style={{ padding: "9px 16px", borderRadius: 8, border: "1.5px solid #e2e8f0", background: "white", color: "#374151", fontSize: 13, fontWeight: 600, cursor: "pointer", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 5 }}
        >
          ↓ Exporter CSV
        </a>
      </div>

      {error && <div style={{ padding: "1rem", borderRadius: 10, background: "#fee2e2", color: "#dc2626", marginBottom: 16 }}>{error}</div>}

      {membres.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem", background: "white", borderRadius: 14, border: "1px dashed #e2e8f0" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>👥</div>
          <p style={{ color: "#64748b" }}>Aucun membre inscrit pour le moment.</p>
        </div>
      ) : (
        <div>
          {sansParoisse.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#dc2626" }}>⚠ Membres sans paroisse ({sansParoisse.length})</span>
                <span style={{ fontSize: 12, color: "#64748b" }}>— Ces enregistrements n'ont pas d'église associée</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {sansParoisse.map(renderMembre)}
              </div>
            </div>
          )}

          {avecParoisse.length > 0 && (
            <div>
              {sansParoisse.length > 0 && (
                <div style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 12 }}>
                  Membres avec paroisse ({avecParoisse.length})
                </div>
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {avecParoisse.map(renderMembre)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
