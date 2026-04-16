"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CheckCircle, ExternalLink } from "lucide-react";

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "ceec.cd";

function getChurchGestionUrl(slug: string): string {
  if (typeof window !== "undefined") {
    const host = window.location.host;
    const isLocalDev =
      host.includes("localhost") ||
      host.includes("127.0.0.1") ||
      host.includes(".replit.dev") ||
      host.includes(".kirk.replit.dev");
    if (isLocalDev) return `/gestion?eglise=${slug}`;
  }
  return `https://${slug}.${ROOT_DOMAIN}/gestion`;
}

interface EgliseInfo {
  id: number;
  nom: string;
  slug: string;
  statut: string;
  email: string | null;
  telephone: string | null;
  description: string | null;
  adresse: string | null;
}

interface AdminItem {
  id: number;
  clerkUserId: string;
  roleNom: string;
  createdAt: string;
}

interface MembreItem {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  roleNom: string;
  statut: string;
  dateAdhesion: string | null;
}

interface Props {
  eglise: EgliseInfo;
  admins: AdminItem[];
  membres: MembreItem[];
}

const roleLabels: Record<string, { label: string; bg: string; color: string }> = {
  admin_eglise: { label: "Admin église",  bg: "#dcfce7", color: "#15803d" },
  pasteur:      { label: "Pasteur",       bg: "#ede9fe", color: "#6d28d9" },
  diacre:       { label: "Diacre",        bg: "#fef9c3", color: "#a16207" },
  tresorier:    { label: "Trésorier",     bg: "#ffedd5", color: "#c2410c" },
  secretaire:   { label: "Secrétaire",    bg: "#e0f2fe", color: "#0369a1" },
  fidele:       { label: "Fidèle",        bg: "#e0e7ff", color: "#3730a3" },
};

const statutLabels: Record<string, { label: string; bg: string; color: string }> = {
  actif: { label: "Actif", bg: "#dcfce7", color: "#15803d" },
  inactif: { label: "Inactif", bg: "#f1f5f9", color: "#64748b" },
  suspendu: { label: "Suspendu", bg: "#fee2e2", color: "#b91c1c" },
};

export default function AdminEgliseDetailClient({ eglise, admins: initialAdmins, membres }: Props) {
  const [admins, setAdmins] = useState<AdminItem[]>(initialAdmins);
  const [egliseStatut, setEgliseStatut] = useState(eglise.statut);
  const [loadingAction, setLoadingAction] = useState(false);
  const [revokeLoading, setRevokeLoading] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [membreFilter, setMembreFilter] = useState<"all" | "actif" | "inactif" | "suspendu">("all");

  const filteredMembres = membreFilter === "all"
    ? membres
    : membres.filter((m) => m.statut === membreFilter);

  async function handleStatutAction(action: "suspendre" | "reactiver") {
    const msg = action === "suspendre"
      ? `Suspendre "${eglise.nom}" ? L'accès aux membres sera bloqué.`
      : `Réactiver "${eglise.nom}" ?`;
    if (!confirm(msg)) return;

    setLoadingAction(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/eglises/${eglise.slug}/${action}`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erreur");
        return;
      }
      setEgliseStatut(data.statut);
      setSuccess(action === "suspendre" ? "Église suspendue." : "Église réactivée.");
      setTimeout(() => setSuccess(null), 4000);
    } finally {
      setLoadingAction(false);
    }
  }

  async function handleRevoke(id: number) {
    if (!confirm("Révoquer l'accès de cet administrateur ?")) return;
    setRevokeLoading(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/eglises/${eglise.slug}/admins/${id}/revoke`, { method: "DELETE" });
      if (res.ok) {
        setAdmins((prev) => prev.filter((a) => a.id !== id));
        setSuccess("Accès révoqué.");
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const data = await res.json();
        setError(data.error ?? "Erreur");
      }
    } finally {
      setRevokeLoading(null);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {error && <div style={{ background: "#fee2e2", color: "#b91c1c", padding: "10px 14px", borderRadius: 8, fontSize: 14 }}>{error}</div>}
      {success && <div style={{ background: "#dcfce7", color: "#15803d", padding: "10px 14px", borderRadius: 8, fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}><CheckCircle size={16} /> {success}</div>}

      <div style={{ background: "white", borderRadius: 14, padding: "1.5rem", border: "1px solid #e2e8f0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 20 }}>
          <h2 style={{ fontWeight: 700, fontSize: 17, color: "#0f172a", margin: 0 }}>Informations</h2>
          <div style={{ display: "flex", gap: 10 }}>
            {egliseStatut === "actif" && (
              <button
                onClick={() => handleStatutAction("suspendre")}
                disabled={loadingAction}
                style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "#fee2e2", color: "#b91c1c", fontWeight: 600, fontSize: 13, cursor: "pointer" }}
              >
                Suspendre l&apos;église
              </button>
            )}
            {(egliseStatut === "suspendu" || egliseStatut === "en_attente") && (
              <button
                onClick={() => handleStatutAction("reactiver")}
                disabled={loadingAction}
                style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "#dcfce7", color: "#15803d", fontWeight: 600, fontSize: 13, cursor: "pointer" }}
              >
                Réactiver l&apos;église
              </button>
            )}
            <a
              href={getChurchGestionUrl(eglise.slug)}
              target="_blank"
              rel="noopener noreferrer"
              style={{ padding: "8px 16px", borderRadius: 8, background: "#1e3a8a", color: "white", fontWeight: 600, fontSize: 13, textDecoration: "none" }}
            >
              Accéder à la gestion <ExternalLink size={13} style={{ display: "inline", verticalAlign: "middle" }} />
            </a>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
          {eglise.email && (
            <div>
              <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 2 }}>E-mail</div>
              <div style={{ fontSize: 14, color: "#0f172a" }}>{eglise.email}</div>
            </div>
          )}
          {eglise.telephone && (
            <div>
              <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 2 }}>Téléphone</div>
              <div style={{ fontSize: 14, color: "#0f172a" }}>{eglise.telephone}</div>
            </div>
          )}
          {eglise.adresse && (
            <div>
              <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 2 }}>Adresse</div>
              <div style={{ fontSize: 14, color: "#0f172a" }}>{eglise.adresse}</div>
            </div>
          )}
        </div>

        {eglise.description && (
          <p style={{ marginTop: 16, color: "#64748b", fontSize: 14, lineHeight: 1.6, borderTop: "1px solid #f1f5f9", paddingTop: 14 }}>
            {eglise.description}
          </p>
        )}
      </div>

      <div style={{ background: "white", borderRadius: 14, padding: "1.5rem", border: "1px solid #e2e8f0" }}>
        <h2 style={{ fontWeight: 700, fontSize: 17, color: "#0f172a", margin: "0 0 16px" }}>
          Administrateurs ({admins.length})
        </h2>

        {admins.length === 0 ? (
          <p style={{ color: "#94a3b8", fontSize: 14 }}>Aucun administrateur pour cette église.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {admins.map((admin, idx) => {
              const rl = roleLabels[admin.roleNom] ?? roleLabels.moderateur;
              return (
                <div key={admin.id} style={{
                  padding: "1rem 0", display: "flex", alignItems: "center", gap: 12, justifyContent: "space-between",
                  borderTop: idx > 0 ? "1px solid #f1f5f9" : "none",
                  opacity: revokeLoading === admin.id ? 0.5 : 1,
                }}>
                  <div>
                    <code style={{ fontSize: 12, background: "#f1f5f9", padding: "2px 8px", borderRadius: 4, color: "#374151" }}>
                      {admin.clerkUserId.slice(0, 32)}…
                    </code>
                    <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>
                      Depuis le {new Date(admin.createdAt).toLocaleDateString("fr-FR")}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ padding: "2px 10px", borderRadius: 100, fontSize: 11, fontWeight: 600, background: rl.bg, color: rl.color }}>
                      {rl.label}
                    </span>
                    <button
                      onClick={() => handleRevoke(admin.id)}
                      disabled={revokeLoading === admin.id}
                      style={{ padding: "6px 12px", borderRadius: 7, border: "none", background: "#fee2e2", color: "#b91c1c", fontWeight: 600, fontSize: 12, cursor: "pointer" }}
                    >
                      Révoquer
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div style={{ background: "white", borderRadius: 14, padding: "1.5rem", border: "1px solid #e2e8f0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
          <h2 style={{ fontWeight: 700, fontSize: 17, color: "#0f172a", margin: 0 }}>
            Membres ({membres.length})
          </h2>
          <div style={{ display: "flex", gap: 6 }}>
            {(["all", "actif", "inactif", "suspendu"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setMembreFilter(f)}
                style={{
                  padding: "5px 12px", borderRadius: 6, fontSize: 12, cursor: "pointer",
                  border: membreFilter === f ? "none" : "1.5px solid #e2e8f0",
                  background: membreFilter === f ? "#1e3a8a" : "white",
                  color: membreFilter === f ? "white" : "#374151",
                  fontWeight: membreFilter === f ? 700 : 400,
                }}
              >
                {f === "all" ? "Tous" : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {filteredMembres.length === 0 ? (
          <p style={{ color: "#94a3b8", fontSize: 14 }}>Aucun membre dans cette catégorie.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #f1f5f9" }}>
                  <th style={th}>Nom</th>
                  <th style={th}>Email</th>
                  <th style={th}>Rôle</th>
                  <th style={th}>Statut</th>
                  <th style={th}>Adhésion</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembres.map((m) => {
                  const rl = roleLabels[m.roleNom] ?? roleLabels.fidele;
                  const sl = statutLabels[m.statut] ?? statutLabels.actif;
                  return (
                    <tr key={m.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={td}><span style={{ fontWeight: 600 }}>{m.prenom} {m.nom}</span></td>
                      <td style={{ ...td, color: "#64748b" }}>{m.email}</td>
                      <td style={td}>
                        <span style={{ padding: "2px 8px", borderRadius: 100, fontSize: 11, fontWeight: 600, background: rl.bg, color: rl.color }}>{rl.label}</span>
                      </td>
                      <td style={td}>
                        <span style={{ padding: "2px 8px", borderRadius: 100, fontSize: 11, fontWeight: 600, background: sl.bg, color: sl.color }}>{sl.label}</span>
                      </td>
                      <td style={{ ...td, color: "#94a3b8" }}>
                        {m.dateAdhesion ? new Date(m.dateAdhesion).toLocaleDateString("fr-FR") : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const th: React.CSSProperties = {
  textAlign: "left", padding: "8px 12px", fontWeight: 600, color: "#64748b", fontSize: 12,
};

const td: React.CSSProperties = {
  padding: "10px 12px", color: "#0f172a",
};
