"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Trophy, Plus, Search, Users, Calendar, ChevronRight, Trash2, Lock, Unlock, X, Building2 } from "lucide-react";

interface Eglise {
  id: number;
  nom: string;
  slug: string | null;
  ville: string | null;
}

interface Marathon {
  id: number;
  titre: string;
  theme: string | null;
  dateDebut: string;
  nombreJours: number;
  statut: string;
  eglise: Eglise;
  _count: { participants: number };
}

const PRIMARY = "#1e3a8a";
const GOLD = "#c59b2e";

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
}

export default function AdminMarathonsClient({
  initialMarathons,
  eglises,
}: {
  initialMarathons: Marathon[];
  eglises: Eglise[];
}) {
  const router = useRouter();
  const [marathons, setMarathons] = useState<Marathon[]>(initialMarathons);
  const [search, setSearch] = useState("");
  const [filterEglise, setFilterEglise] = useState<string>("");
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    egliseId: "",
    titre: "",
    theme: "",
    referenceBiblique: "",
    dateDebut: "",
    nombreJours: "21",
    denomination: "",
  });
  const [joursExclus, setJoursExclus] = useState<string[]>([]);
  const [newExcluDate, setNewExcluDate] = useState("");

  const refresh = useCallback(async () => {
    const res = await fetch("/api/admin/marathons");
    if (res.ok) setMarathons(await res.json());
  }, []);

  const handleCreate = async () => {
    if (!form.egliseId || !form.titre || !form.dateDebut || !form.nombreJours) {
      setError("Église, titre, date de début et nombre de jours sont requis");
      return;
    }
    setCreating(true);
    setError("");
    const res = await fetch("/api/admin/marathons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, nombreJours: parseInt(form.nombreJours), joursExclus }),
    });
    if (res.ok) {
      const data = await res.json();
      setShowCreate(false);
      setForm({ egliseId: "", titre: "", theme: "", referenceBiblique: "", dateDebut: "", nombreJours: "21", denomination: "" });
      setJoursExclus([]);
      setNewExcluDate("");
      router.push(`/gestion/marathons/${data.id}`);
    } else {
      const d = await res.json();
      setError(d.error ?? "Erreur de création");
    }
    setCreating(false);
  };

  const handleDelete = async (id: number, titre: string) => {
    if (!confirm(`Supprimer le marathon "${titre}" et toutes ses données ?`)) return;
    const m = marathons.find((x) => x.id === id);
    if (!m) return;
    await fetch(`/api/gestion/marathons/${id}`, {
      method: "DELETE",
      headers: { "x-eglise-id": String(m.eglise.id) },
    });
    refresh();
  };

  const handleToggleStatus = async (m: Marathon) => {
    const newStatut = m.statut === "ouvert" ? "clos" : "ouvert";
    await fetch(`/api/gestion/marathons/${m.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-eglise-id": String(m.eglise.id) },
      body: JSON.stringify({ statut: newStatut }),
    });
    refresh();
  };

  const filtered = marathons.filter((m) => {
    const matchSearch =
      m.titre.toLowerCase().includes(search.toLowerCase()) ||
      (m.theme ?? "").toLowerCase().includes(search.toLowerCase()) ||
      m.eglise.nom.toLowerCase().includes(search.toLowerCase());
    const matchEglise = filterEglise ? String(m.eglise.id) === filterEglise : true;
    return matchSearch && matchEglise;
  });

  const inputStyle = {
    width: "100%",
    padding: "9px 12px",
    border: "1.5px solid #e5e7eb",
    borderRadius: 8,
    fontSize: 14,
    boxSizing: "border-box" as const,
    outline: "none",
  };

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1.5rem", flexWrap: "wrap" }}>
        {/* Search */}
        <div style={{ position: "relative", flex: "1 1 220px", minWidth: 200, maxWidth: 340 }}>
          <Search size={15} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un marathon..."
            style={{ ...inputStyle, paddingLeft: 32 }}
          />
        </div>

        {/* Church filter */}
        <select
          value={filterEglise}
          onChange={(e) => setFilterEglise(e.target.value)}
          style={{ ...inputStyle, width: "auto", minWidth: 180, flex: "0 1 220px", color: filterEglise ? "#111827" : "#9ca3af" }}
        >
          <option value="">Toutes les églises</option>
          {eglises.map((e) => (
            <option key={e.id} value={String(e.id)}>{e.nom}</option>
          ))}
        </select>

        <button
          onClick={() => setShowCreate(true)}
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", background: PRIMARY, color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 14, whiteSpace: "nowrap", marginLeft: "auto" }}
        >
          <Plus size={16} /> Nouveau marathon
        </button>
      </div>

      {/* Summary */}
      <p style={{ fontSize: 13, color: "#64748b", marginBottom: 16 }}>
        {filtered.length} marathon{filtered.length !== 1 ? "s" : ""}
        {filterEglise ? ` pour cette église` : " au total (toutes églises)"}
        {" · "}{filtered.filter((m) => m.statut === "ouvert").length} ouvert{filtered.filter((m) => m.statut === "ouvert").length !== 1 ? "s" : ""}
      </p>

      {/* List */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem 2rem", background: "#f9fafb", borderRadius: 16, border: "2px dashed #e5e7eb" }}>
          <Trophy size={40} color="#d1d5db" style={{ marginBottom: 16 }} />
          <p style={{ color: "#6b7280", fontWeight: 500, marginBottom: 8 }}>
            {search || filterEglise ? "Aucun marathon trouvé" : "Aucun marathon sur la plateforme"}
          </p>
          {!search && !filterEglise && (
            <button onClick={() => setShowCreate(true)} style={{ padding: "8px 16px", background: PRIMARY, color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 14 }}>
              Créer le premier marathon
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {filtered.map((m) => (
            <div
              key={m.id}
              style={{ background: "white", border: "1.5px solid #e5e7eb", borderRadius: 12, padding: "1.1rem 1.4rem", display: "flex", alignItems: "center", gap: 16, cursor: "pointer", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
              onClick={() => router.push(`/gestion/marathons/${m.id}`)}
            >
              <div style={{ width: 44, height: 44, borderRadius: 10, background: m.statut === "ouvert" ? "#eff6ff" : "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Trophy size={20} color={m.statut === "ouvert" ? PRIMARY : "#9ca3af"} />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontWeight: 700, fontSize: 15, color: "#111827" }}>{m.titre}</span>
                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 100,
                    background: m.statut === "ouvert" ? "#dcfce7" : "#fee2e2",
                    color: m.statut === "ouvert" ? "#15803d" : "#b91c1c",
                  }}>
                    {m.statut === "ouvert" ? "Ouvert" : "Clos"}
                  </span>
                </div>

                {/* Church badge */}
                <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 3 }}>
                  <Building2 size={12} color="#6366f1" />
                  <span style={{ fontSize: 12, color: "#6366f1", fontWeight: 600 }}>
                    {m.eglise.nom}{m.eglise.ville ? ` · ${m.eglise.ville}` : ""}
                  </span>
                </div>

                {m.theme && <div style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>{m.theme}</div>}

                <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 5, flexWrap: "wrap" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#6b7280" }}>
                    <Calendar size={12} /> {formatDate(m.dateDebut)} · {m.nombreJours} jours
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#6b7280" }}>
                    <Users size={12} /> {m._count.participants} participant{m._count.participants !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", gap: 6 }} onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => handleToggleStatus(m)}
                  title={m.statut === "ouvert" ? "Clôturer" : "Rouvrir"}
                  style={{ padding: "6px 10px", background: m.statut === "ouvert" ? "#fef2f2" : "#f0fdf4", border: "none", borderRadius: 7, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: m.statut === "ouvert" ? "#b91c1c" : "#15803d", fontWeight: 600 }}
                >
                  {m.statut === "ouvert" ? <Lock size={13} /> : <Unlock size={13} />}
                  {m.statut === "ouvert" ? "Clôturer" : "Rouvrir"}
                </button>
                <button
                  onClick={() => handleDelete(m.id, m.titre)}
                  style={{ padding: "6px 10px", background: "#fef2f2", border: "none", borderRadius: 7, cursor: "pointer", display: "flex", alignItems: "center" }}
                >
                  <Trash2 size={14} color="#b91c1c" />
                </button>
                <ChevronRight size={18} color="#d1d5db" style={{ alignSelf: "center" }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}
          onClick={() => setShowCreate(false)}
        >
          <div
            style={{ background: "white", borderRadius: 16, padding: "2rem", width: "100%", maxWidth: 560, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: PRIMARY }}>Nouveau marathon</h2>
              <button onClick={() => setShowCreate(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280" }}><X size={20} /></button>
            </div>

            {error && <div style={{ background: "#fef2f2", color: "#b91c1c", padding: "10px 14px", borderRadius: 8, marginBottom: 16, fontSize: 13 }}>{error}</div>}

            {/* Church selector */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>Église *</label>
              <select
                value={form.egliseId}
                onChange={(e) => setForm({ ...form, egliseId: e.target.value })}
                style={{ ...inputStyle, color: form.egliseId ? "#111827" : "#9ca3af" }}
              >
                <option value="">Sélectionner une église...</option>
                {eglises.map((e) => (
                  <option key={e.id} value={String(e.id)}>{e.nom}{e.ville ? ` · ${e.ville}` : ""}</option>
                ))}
              </select>
            </div>

            {[
              { label: "Titre *", key: "titre", placeholder: "ex: Marathon de prière 2026" },
              { label: "Thème", key: "theme", placeholder: "ex: Grâce et renouveau" },
              { label: "Référence biblique", key: "referenceBiblique", placeholder: "ex: Jésus-Christ est le même hier, aujourd'hui et éternellement" },
              { label: "Dénomination / Église (affichage)", key: "denomination", placeholder: "ex: CEEC Kinshasa" },
            ].map(({ label, key, placeholder }) => (
              <div key={key} style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>{label}</label>
                <input
                  value={(form as Record<string, string>)[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  placeholder={placeholder}
                  style={inputStyle}
                />
              </div>
            ))}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>Date de début *</label>
                <input
                  type="date"
                  value={form.dateDebut}
                  onChange={(e) => setForm({ ...form, dateDebut: e.target.value })}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>Nombre de jours *</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={form.nombreJours}
                  onChange={(e) => setForm({ ...form, nombreJours: e.target.value })}
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Excluded days */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>Jours à exclure (congés, repos)</label>
              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <input
                  type="date"
                  value={newExcluDate}
                  min={form.dateDebut || undefined}
                  onChange={(e) => setNewExcluDate(e.target.value)}
                  style={{ ...inputStyle, flex: 1 }}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newExcluDate && !joursExclus.includes(newExcluDate)) {
                      setJoursExclus([...joursExclus, newExcluDate].sort());
                      setNewExcluDate("");
                    }
                  }}
                  style={{ padding: "8px 14px", background: GOLD, color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 13, whiteSpace: "nowrap" }}
                >
                  + Ajouter
                </button>
              </div>
              {joursExclus.length > 0 ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {joursExclus.map((d) => (
                    <span key={d} style={{ display: "flex", alignItems: "center", gap: 4, background: "#fef3c7", color: "#92400e", fontSize: 12, padding: "3px 8px", borderRadius: 100, fontWeight: 600 }}>
                      {new Date(d + "T12:00:00").toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}
                      <button type="button" onClick={() => setJoursExclus(joursExclus.filter((x) => x !== d))} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, lineHeight: 1, color: "#b45309" }}>×</button>
                    </span>
                  ))}
                </div>
              ) : (
                <p style={{ margin: 0, fontSize: 12, color: "#9ca3af", fontStyle: "italic" }}>Aucun jour exclu</p>
              )}
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: "1.5rem" }}>
              <button
                onClick={() => { setShowCreate(false); setJoursExclus([]); setNewExcluDate(""); setError(""); }}
                style={{ padding: "9px 18px", border: "1.5px solid #e5e7eb", borderRadius: 8, background: "white", cursor: "pointer", fontWeight: 600, fontSize: 14, color: "#374151" }}
              >
                Annuler
              </button>
              <button
                onClick={handleCreate}
                disabled={creating}
                style={{ padding: "9px 20px", background: creating ? "#9ca3af" : PRIMARY, color: "white", border: "none", borderRadius: 8, cursor: creating ? "not-allowed" : "pointer", fontWeight: 600, fontSize: 14 }}
              >
                {creating ? "Création..." : "Créer le marathon"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
