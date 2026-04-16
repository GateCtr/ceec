"use client";

import React, { useState } from "react";
import { CHURCH_ROLE_LABELS } from "@/lib/membre-role-constants";

interface MembreEnrichi {
  id: number;
  clerkUserId: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string | null;
  egliseId: number | null;
  statut: string;
  dateAdhesion: Date | string | null;
  roleNom: string;
}

interface Props {
  initialMembres: MembreEnrichi[];
}

const statutLabels: Record<string, { label: string; bg: string; color: string }> = {
  actif: { label: "Actif", bg: "#dcfce7", color: "#15803d" },
  inactif: { label: "Inactif", bg: "#f1f5f9", color: "#64748b" },
  suspendu: { label: "Suspendu", bg: "#fee2e2", color: "#b91c1c" },
};

type StatutFilter = "all" | "actif" | "inactif" | "suspendu";
type RoleFilter = "all" | "admin_eglise" | "pasteur" | "diacre" | "tresorier" | "secretaire" | "fidele";

const ROLE_FILTER_OPTIONS: { value: RoleFilter; label: string }[] = [
  { value: "all", label: "Tous" },
  { value: "admin_eglise", label: "Admin" },
  { value: "pasteur", label: "Pasteur" },
  { value: "diacre", label: "Diacre" },
  { value: "tresorier", label: "Trésorier" },
  { value: "secretaire", label: "Secrétaire" },
  { value: "fidele", label: "Fidèle" },
];

const VALID_ROLES_GESTION = ["fidele", "diacre", "secretaire", "tresorier"];

export default function GestionMembresClient({ initialMembres }: Props) {
  const [membres, setMembres] = useState<MembreEnrichi[]>(initialMembres);
  const [statutFilter, setStatutFilter] = useState<StatutFilter>("all");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [loading, setLoading] = useState<number | null>(null);

  const filtered = membres.filter((m) => {
    const matchStatut = statutFilter === "all" || m.statut === statutFilter;
    const matchRole = roleFilter === "all" || m.roleNom === roleFilter;
    return matchStatut && matchRole;
  });

  async function updateMembre(id: number, data: { statut?: string; role?: string }) {
    setLoading(id);
    try {
      const res = await fetch(`/api/gestion/membres/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const updated = await res.json();
        setMembres((prev) => prev.map((m) => (m.id === updated.id ? { ...m, ...updated } : m)));
      }
    } finally {
      setLoading(null);
    }
  }

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>Statut :</span>
          {(["all", "actif", "inactif", "suspendu"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setStatutFilter(f)}
              style={{
                padding: "5px 12px", borderRadius: 8, fontSize: 12, cursor: "pointer",
                border: statutFilter === f ? "none" : "1.5px solid #e2e8f0",
                background: statutFilter === f ? "#1e3a8a" : "white",
                color: statutFilter === f ? "white" : "#374151",
                fontWeight: statutFilter === f ? 700 : 400,
              }}
            >
              {f === "all" ? "Tous" : f === "actif" ? "Actifs" : f === "inactif" ? "Inactifs" : "Suspendus"}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>Rôle :</span>
          {ROLE_FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setRoleFilter(opt.value)}
              style={{
                padding: "5px 12px", borderRadius: 8, fontSize: 12, cursor: "pointer",
                border: roleFilter === opt.value ? "none" : "1.5px solid #e2e8f0",
                background: roleFilter === opt.value ? "#1e3a8a" : "white",
                color: roleFilter === opt.value ? "white" : "#374151",
                fontWeight: roleFilter === opt.value ? 700 : 400,
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <span style={{ marginLeft: "auto", fontSize: 13, color: "#64748b", alignSelf: "center" }}>
          {filtered.length} membre{filtered.length !== 1 ? "s" : ""}
        </span>
        <a
          href="/api/gestion/membres/export"
          download
          style={{ padding: "6px 14px", borderRadius: 7, border: "1.5px solid #e2e8f0", background: "white", color: "#374151", fontSize: 12, fontWeight: 600, cursor: "pointer", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 5 }}
        >
          ↓ Exporter CSV
        </a>
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", background: "white", borderRadius: 14, border: "1px dashed #cbd5e1" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>👥</div>
          <p style={{ color: "#64748b" }}>Aucun membre dans cette catégorie.</p>
        </div>
      ) : (
        <div style={{ background: "white", borderRadius: 14, border: "1px solid #e2e8f0", overflow: "hidden" }}>
          {filtered.map((m, idx) => {
            const statut = statutLabels[m.statut] ?? statutLabels.actif;
            const role = CHURCH_ROLE_LABELS[m.roleNom] ?? CHURCH_ROLE_LABELS.fidele;
            const isLoading = loading === m.id;
            const isAdminRole = m.roleNom === "admin_eglise" || m.roleNom === "pasteur";

            return (
              <div key={m.id} style={{
                padding: "1rem 1.5rem", display: "flex", alignItems: "center", gap: 12,
                justifyContent: "space-between", flexWrap: "wrap",
                borderTop: idx > 0 ? "1px solid #f1f5f9" : "none",
                opacity: isLoading ? 0.6 : 1,
              }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ fontWeight: 600, color: "#0f172a", fontSize: 14 }}>{m.prenom} {m.nom}</div>
                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{m.email}</div>
                  {m.dateAdhesion && (
                    <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
                      Membre depuis {new Date(m.dateAdhesion).toLocaleDateString("fr-FR")}
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  <span style={{ padding: "2px 10px", borderRadius: 100, fontSize: 11, fontWeight: 600, background: role.bg, color: role.color }}>
                    {role.label}
                  </span>
                  <span style={{ padding: "2px 10px", borderRadius: 100, fontSize: 11, fontWeight: 600, background: statut.bg, color: statut.color }}>
                    {statut.label}
                  </span>
                  <select
                    value={m.statut}
                    disabled={isLoading}
                    onChange={(e) => updateMembre(m.id, { statut: e.target.value })}
                    style={{ padding: "5px 10px", borderRadius: 7, border: "1.5px solid #e2e8f0", fontSize: 12, cursor: "pointer", color: "#374151" }}
                  >
                    <option value="actif">Actif</option>
                    <option value="inactif">Inactif</option>
                    <option value="suspendu">Suspendu</option>
                  </select>
                  <select
                    value={isAdminRole ? m.roleNom : m.roleNom}
                    disabled={isLoading || isAdminRole}
                    onChange={(e) => updateMembre(m.id, { role: e.target.value })}
                    style={{
                      padding: "5px 10px", borderRadius: 7, border: "1.5px solid #e2e8f0", fontSize: 12,
                      cursor: isAdminRole ? "not-allowed" : "pointer", color: "#374151",
                    }}
                    title={isAdminRole ? "Gérez les admins depuis l'onglet Admins" : undefined}
                  >
                    {isAdminRole ? (
                      <option value={m.roleNom}>{role.label}</option>
                    ) : (
                      VALID_ROLES_GESTION.map((r) => (
                        <option key={r} value={r}>{CHURCH_ROLE_LABELS[r]?.label ?? r}</option>
                      ))
                    )}
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
