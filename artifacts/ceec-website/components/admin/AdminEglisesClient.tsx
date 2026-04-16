"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Church, Link2, Users, CalendarDays, ChevronRight, MapPin } from "lucide-react";

interface Eglise {
  id: number;
  nom: string;
  slug: string | null;
  ville: string;
  statut: string;
  createdAt: string;
  membresCount: number;
  hasInvitePending: boolean;
}

interface Props {
  initialEglises: Eglise[];
}

const statutLabels: Record<string, { label: string; color: string; bg: string }> = {
  actif: { label: "Actif", color: "#15803d", bg: "#dcfce7" },
  en_attente: { label: "En attente", color: "#b45309", bg: "#fef3c7" },
  suspendu: { label: "Suspendu", color: "#b91c1c", bg: "#fee2e2" },
};

export default function AdminEglisesClient({ initialEglises }: Props) {
  const [eglises, setEglises] = useState<Eglise[]>(initialEglises);
  const [loading, setLoading] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleAction(eglise: Eglise, action: "suspendre" | "reactiver") {
    if (action === "suspendre" && !confirm(`Suspendre "${eglise.nom}" ? L'accès aux membres sera bloqué.`)) return;
    if (action === "reactiver" && !confirm(`Réactiver "${eglise.nom}" ?`)) return;

    setLoading(eglise.id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/eglises/${eglise.slug}/${action}`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Erreur");
        return;
      }
      const data = await res.json();
      setEglises((prev) => prev.map((e) => e.id === eglise.id ? { ...e, statut: data.statut } : e));
    } finally {
      setLoading(null);
    }
  }

  return (
    <div>
      {error && (
        <div style={{ background: "#fee2e2", color: "#b91c1c", padding: "10px 14px", borderRadius: 8, marginBottom: 16, fontSize: 14 }}>
          {error}
        </div>
      )}

      {eglises.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem 2rem", background: "white", borderRadius: 16, border: "1px dashed #cbd5e1" }}>
          <div style={{ marginBottom: 16, display: "flex", justifyContent: "center" }}><Church size={48} style={{ color: "#1e3a8a" }} /></div>
          <h3 style={{ color: "#1e3a8a", margin: "0 0 8px" }}>Aucune église enregistrée</h3>
          <p style={{ color: "#64748b" }}>Commencez par inviter la première église à rejoindre la plateforme.</p>
          <Link href="/admin/eglises/nouveau" style={{ display: "inline-block", marginTop: 16, background: "#1e3a8a", color: "white", padding: "12px 28px", borderRadius: 8, fontWeight: 700, textDecoration: "none" }}>
            Inviter une église
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {eglises.map((eglise) => {
            const statut = statutLabels[eglise.statut] ?? statutLabels.en_attente;
            const isLoading = loading === eglise.id;

            return (
              <div key={eglise.id} style={{
                background: "white", borderRadius: 14, padding: "1.25rem 1.5rem",
                border: "1px solid #e2e8f0", boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                display: "flex", justifyContent: "space-between", alignItems: "center",
                flexWrap: "wrap", gap: 16, opacity: isLoading ? 0.7 : 1,
              }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 700, fontSize: 16, color: "#0f172a" }}>{eglise.nom}</span>
                    <span style={{ background: statut.bg, color: statut.color, padding: "2px 10px", borderRadius: 100, fontSize: 11, fontWeight: 600 }}>
                      {statut.label}
                    </span>
                    {eglise.hasInvitePending && (
                      <span style={{ background: "#e0e7ff", color: "#3730a3", padding: "2px 10px", borderRadius: 100, fontSize: 11, fontWeight: 600 }}>
                        Invitation en cours
                      </span>
                    )}
                  </div>
                  <div style={{ color: "#64748b", fontSize: 13, display: "flex", gap: 16, flexWrap: "wrap" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><MapPin size={13} /> {eglise.ville}</span>
                    {eglise.slug && <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><Link2 size={13} /> {eglise.slug}</span>}
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><Users size={13} /> {eglise.membresCount} membre{eglise.membresCount !== 1 ? "s" : ""}</span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><CalendarDays size={13} /> {new Date(eglise.createdAt).toLocaleDateString("fr-FR")}</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {eglise.slug && (
                    <Link
                      href={`/admin/eglises/${eglise.slug}`}
                      style={{ padding: "7px 14px", borderRadius: 8, border: "1.5px solid #e2e8f0", background: "white", color: "#374151", fontWeight: 600, fontSize: 13, textDecoration: "none" }}
                    >
                      Détail
                    </Link>
                  )}
                  {eglise.statut === "en_attente" && eglise.slug && (
                    <Link href={`/admin/eglises/nouveau?reinvite=${eglise.id}`} style={{ padding: "7px 14px", borderRadius: 8, border: "1.5px solid #c59b2e", color: "#c59b2e", fontWeight: 600, fontSize: 13, textDecoration: "none" }}>
                      Réinviter
                    </Link>
                  )}
                  {eglise.statut === "actif" && eglise.slug && (
                    <button
                      onClick={() => handleAction(eglise, "suspendre")}
                      disabled={isLoading}
                      style={{ padding: "7px 14px", borderRadius: 8, border: "none", background: "#fee2e2", color: "#b91c1c", fontWeight: 600, fontSize: 13, cursor: "pointer" }}
                    >
                      Suspendre
                    </button>
                  )}
                  {eglise.statut === "suspendu" && eglise.slug && (
                    <button
                      onClick={() => handleAction(eglise, "reactiver")}
                      disabled={isLoading}
                      style={{ padding: "7px 14px", borderRadius: 8, border: "none", background: "#dcfce7", color: "#15803d", fontWeight: 600, fontSize: 13, cursor: "pointer" }}
                    >
                      Réactiver
                    </button>
                  )}
                  {eglise.slug && (
                    <Link href={`/gestion?eglise=${eglise.slug}`} style={{ padding: "7px 14px", borderRadius: 8, background: "#1e3a8a", color: "white", fontWeight: 600, fontSize: 13, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 }}>
                      Gérer <ChevronRight size={14} />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
