"use client";

import React, { useState } from "react";
import type { Membre } from "@prisma/client";

interface Props {
  initialMembres: Membre[];
}

const statutLabels: Record<string, { label: string; bg: string; color: string }> = {
  actif: { label: "Actif", bg: "#dcfce7", color: "#15803d" },
  inactif: { label: "Inactif", bg: "#f1f5f9", color: "#64748b" },
  suspendu: { label: "Suspendu", bg: "#fee2e2", color: "#b91c1c" },
};

const roleLabels: Record<string, { label: string; bg: string; color: string }> = {
  fidele: { label: "Fidèle", bg: "#e0e7ff", color: "#3730a3" },
  moderateur: { label: "Modérateur", bg: "#fef3c7", color: "#b45309" },
  admin_eglise: { label: "Admin", bg: "#dcfce7", color: "#15803d" },
};

type StatutFilter = "all" | "actif" | "inactif" | "suspendu";
type RoleFilter = "all" | "fidele" | "moderateur" | "admin_eglise";

export default function GestionMembresClient({ initialMembres }: Props) {
  const [membres, setMembres] = useState<Membre[]>(initialMembres);
  const [statutFilter, setStatutFilter] = useState<StatutFilter>("all");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [loading, setLoading] = useState<number | null>(null);

  const filtered = membres.filter((m) => {
    const matchStatut = statutFilter === "all" || m.statut === statutFilter;
    const matchRole = roleFilter === "all" || m.role === roleFilter;
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
        setMembres((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
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

        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>Rôle :</span>
          {(["all", "fidele", "moderateur", "admin_eglise"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setRoleFilter(f)}
              style={{
                padding: "5px 12px", borderRadius: 8, fontSize: 12, cursor: "pointer",
                border: roleFilter === f ? "none" : "1.5px solid #e2e8f0",
                background: roleFilter === f ? "#1e3a8a" : "white",
                color: roleFilter === f ? "white" : "#374151",
                fontWeight: roleFilter === f ? 700 : 400,
              }}
            >
              {f === "all" ? "Tous" : roleLabels[f]?.label ?? f}
            </button>
          ))}
        </div>

        <span style={{ marginLeft: "auto", fontSize: 13, color: "#64748b", alignSelf: "center" }}>
          {filtered.length} membre{filtered.length !== 1 ? "s" : ""}
        </span>
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
            const role = roleLabels[m.role] ?? roleLabels.fidele;
            const isLoading = loading === m.id;

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
                    value={m.role}
                    disabled={isLoading || m.role === "admin_eglise"}
                    onChange={(e) => updateMembre(m.id, { role: e.target.value })}
                    style={{ padding: "5px 10px", borderRadius: 7, border: "1.5px solid #e2e8f0", fontSize: 12, cursor: m.role === "admin_eglise" ? "not-allowed" : "pointer", color: "#374151" }}
                    title={m.role === "admin_eglise" ? "Gérez les admins depuis l'onglet Admins" : undefined}
                  >
                    <option value="fidele">Fidèle</option>
                    <option value="moderateur">Modérateur</option>
                    {m.role === "admin_eglise" && <option value="admin_eglise">Admin</option>}
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
