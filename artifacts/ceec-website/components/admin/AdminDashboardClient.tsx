"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

interface EgliseRow {
  id: number;
  nom: string;
  slug: string;
  ville: string;
  statut: string;
  membres: number;
  createdAt: string;
}

const statutStyles: Record<string, { label: string; bg: string; color: string }> = {
  actif: { label: "Actif", bg: "#dcfce7", color: "#15803d" },
  en_attente: { label: "En attente", bg: "#fef3c7", color: "#b45309" },
  suspendu: { label: "Suspendu", bg: "#fee2e2", color: "#b91c1c" },
};

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "ceec.cd";

function getChurchGestionUrl(slug: string): string {
  if (typeof window !== "undefined") {
    const host = window.location.host;
    const isLocalDev =
      host.includes("localhost") ||
      host.includes("127.0.0.1") ||
      host.includes(".replit.dev") ||
      host.includes(".kirk.replit.dev");
    if (isLocalDev) {
      return `/gestion?eglise=${slug}`;
    }
  }
  return `https://${slug}.${ROOT_DOMAIN}/gestion`;
}

export default function AdminDashboardClient({ eglises: initialEglises }: { eglises: EgliseRow[] }) {
  const [eglises, setEglises] = useState<EgliseRow[]>(initialEglises);
  const [loading, setLoading] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "actif" | "en_attente" | "suspendu">("all");

  const filtered = filter === "all" ? eglises : eglises.filter((e) => e.statut === filter);

  async function handleAction(eglise: EgliseRow, action: "suspendre" | "reactiver") {
    const msg = action === "suspendre"
      ? `Suspendre "${eglise.nom}" ? L'accès aux membres sera bloqué.`
      : `Réactiver "${eglise.nom}" ?`;
    if (!confirm(msg)) return;

    setLoading(eglise.id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/eglises/${eglise.slug}/${action}`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erreur lors de l'opération");
        return;
      }
      setEglises((prev) => prev.map((e) => e.id === eglise.id ? { ...e, statut: data.statut } : e));
    } finally {
      setLoading(null);
    }
  }

  return (
    <div style={{ background: "white", borderRadius: 14, border: "1px solid #e2e8f0", overflow: "hidden" }}>
      {error && (
        <div style={{ background: "#fee2e2", color: "#b91c1c", padding: "10px 16px", fontSize: 13 }}>
          {error}
        </div>
      )}

      <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid #f1f5f9", display: "flex", gap: 6, flexWrap: "wrap" }}>
        {(["all", "actif", "en_attente", "suspendu"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "5px 14px", borderRadius: 6, fontSize: 12, cursor: "pointer",
              border: filter === f ? "none" : "1.5px solid #e2e8f0",
              background: filter === f ? "#1e3a8a" : "white",
              color: filter === f ? "white" : "#374151",
              fontWeight: filter === f ? 700 : 400,
            }}
          >
            {f === "all" ? "Toutes" : f === "en_attente" ? "En attente" : f.charAt(0).toUpperCase() + f.slice(1)}
            {" "}({f === "all" ? eglises.length : eglises.filter((e) => e.statut === f).length})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ padding: "2rem", textAlign: "center", color: "#94a3b8", fontSize: 14 }}>
          Aucune église dans cette catégorie.
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #f1f5f9" }}>
                <th style={th}>Nom</th>
                <th style={th}>Ville</th>
                <th style={th}>Membres</th>
                <th style={th}>Statut</th>
                <th style={th}>Créée le</th>
                <th style={th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((eglise) => {
                const sl = statutStyles[eglise.statut] ?? statutStyles.en_attente;
                const isLoading = loading === eglise.id;
                const gestionUrl = getChurchGestionUrl(eglise.slug);
                return (
                  <tr key={eglise.id} style={{ borderBottom: "1px solid #f1f5f9", opacity: isLoading ? 0.5 : 1 }}>
                    <td style={td}>
                      <span style={{ fontWeight: 600, color: "#0f172a" }}>{eglise.nom}</span>
                      {eglise.slug && (
                        <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 1 }}>{eglise.slug}</div>
                      )}
                    </td>
                    <td style={{ ...td, color: "#64748b" }}>{eglise.ville}</td>
                    <td style={{ ...td, textAlign: "center", fontWeight: 600, color: "#1e3a8a" }}>{eglise.membres}</td>
                    <td style={td}>
                      <span style={{ padding: "2px 10px", borderRadius: 100, fontSize: 11, fontWeight: 600, background: sl.bg, color: sl.color }}>
                        {sl.label}
                      </span>
                    </td>
                    <td style={{ ...td, color: "#94a3b8" }}>
                      {new Date(eglise.createdAt).toLocaleDateString("fr-FR")}
                    </td>
                    <td style={td}>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        <Link
                          href={`/admin/eglises/${eglise.slug}`}
                          style={{ padding: "5px 10px", borderRadius: 6, background: "#f1f5f9", color: "#1e3a8a", fontSize: 12, fontWeight: 600, textDecoration: "none" }}
                        >
                          Détail
                        </Link>
                        <a
                          href={gestionUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ padding: "5px 10px", borderRadius: 6, background: "#e0e7ff", color: "#3730a3", fontSize: 12, fontWeight: 600, textDecoration: "none" }}
                        >
                          Accéder <ExternalLink size={12} style={{ display: "inline", verticalAlign: "middle" }} />
                        </a>
                        {eglise.statut === "actif" && (
                          <button
                            onClick={() => handleAction(eglise, "suspendre")}
                            disabled={isLoading}
                            style={{ padding: "5px 10px", borderRadius: 6, border: "none", background: "#fee2e2", color: "#b91c1c", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                          >
                            Suspendre
                          </button>
                        )}
                        {(eglise.statut === "suspendu" || eglise.statut === "en_attente") && (
                          <button
                            onClick={() => handleAction(eglise, "reactiver")}
                            disabled={isLoading}
                            style={{ padding: "5px 10px", borderRadius: 6, border: "none", background: "#dcfce7", color: "#15803d", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                          >
                            Réactiver
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const th: React.CSSProperties = {
  textAlign: "left", padding: "10px 16px", fontWeight: 600, color: "#64748b", fontSize: 12,
};

const td: React.CSSProperties = {
  padding: "12px 16px", verticalAlign: "middle",
};
