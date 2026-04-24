"use client";

import React, { useState } from "react";
import { Users, Download } from "lucide-react";
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

const statutLabels: Record<string, { label: string; badgeClass: string }> = {
  actif:    { label: "Actif",    badgeClass: "badge badge-success" },
  inactif:  { label: "Inactif",  badgeClass: "badge badge-muted" },
  suspendu: { label: "Suspendu", badgeClass: "badge badge-danger" },
};

const roleBadgeClassMap: Record<string, string> = {
  admin_eglise: "badge bg-green-100 text-green-700",
  pasteur:      "badge bg-violet-100 text-violet-700",
  diacre:       "badge bg-yellow-100 text-yellow-700",
  tresorier:    "badge bg-orange-100 text-orange-700",
  secretaire:   "badge bg-sky-100 text-sky-700",
  fidele:       "badge bg-indigo-100 text-indigo-800",
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
      {/* ── Filters bar ── */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="flex gap-1.5 items-center">
          <span className="text-xs text-muted-foreground font-semibold">Statut :</span>
          {(["all", "actif", "inactif", "suspendu"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setStatutFilter(f)}
              className={`btn btn-sm ${
                statutFilter === f
                  ? "btn-primary"
                  : "btn-ghost border border-border text-slate-700"
              }`}
            >
              {f === "all" ? "Tous" : f === "actif" ? "Actifs" : f === "inactif" ? "Inactifs" : "Suspendus"}
            </button>
          ))}
        </div>

        <div className="flex gap-1.5 items-center flex-wrap">
          <span className="text-xs text-muted-foreground font-semibold">Rôle :</span>
          {ROLE_FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setRoleFilter(opt.value)}
              className={`btn btn-sm ${
                roleFilter === opt.value
                  ? "btn-primary"
                  : "btn-ghost border border-border text-slate-700"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <span className="ml-auto text-[13px] text-muted-foreground self-center">
          {filtered.length} membre{filtered.length !== 1 ? "s" : ""}
        </span>

        <a
          href="/api/gestion/membres/export"
          download
          className="btn btn-sm btn-outline border-border bg-white text-slate-700 no-underline"
        >
          <Download size={13} /> Exporter CSV
        </a>
      </div>

      {/* ── Empty state ── */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
          <div className="flex justify-center mb-3">
            <Users size={40} className="text-slate-300" />
          </div>
          <p className="text-muted-foreground">Aucun membre dans cette catégorie.</p>
        </div>
      ) : (
        /* ── Members list ── */
        <div className="card">
          {filtered.map((m, idx) => {
            const statut = statutLabels[m.statut] ?? statutLabels.actif;
            const role = CHURCH_ROLE_LABELS[m.roleNom] ?? CHURCH_ROLE_LABELS.fidele;
            const roleBadgeCls = roleBadgeClassMap[m.roleNom] ?? roleBadgeClassMap.fidele;
            const isLoading = loading === m.id;
            const isAdminRole = m.roleNom === "admin_eglise" || m.roleNom === "pasteur";

            return (
              <div
                key={m.id}
                className={`px-6 py-4 flex items-center gap-3 justify-between flex-wrap ${
                  idx > 0 ? "border-t border-slate-100" : ""
                } ${isLoading ? "opacity-60" : ""}`}
              >
                <div className="flex-1 min-w-[200px]">
                  <div className="font-semibold text-foreground text-sm">
                    {m.prenom} {m.nom}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">{m.email}</div>
                  {m.dateAdhesion && (
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Membre depuis {new Date(m.dateAdhesion).toLocaleDateString("fr-FR")}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 items-center flex-wrap">
                  <span className={roleBadgeCls}>
                    {role.label}
                  </span>
                  <span className={statut.badgeClass}>
                    {statut.label}
                  </span>

                  <select
                    value={m.statut}
                    disabled={isLoading}
                    onChange={(e) => updateMembre(m.id, { statut: e.target.value })}
                    className="input select w-auto text-xs py-1.5! px-2.5!"
                  >
                    <option value="actif">Actif</option>
                    <option value="inactif">Inactif</option>
                    <option value="suspendu">Suspendu</option>
                  </select>

                  <select
                    value={m.roleNom}
                    disabled={isLoading || isAdminRole}
                    onChange={(e) => updateMembre(m.id, { role: e.target.value })}
                    className={`input select w-auto text-xs py-1.5! px-2.5! ${
                      isAdminRole ? "cursor-not-allowed" : "cursor-pointer"
                    }`}
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
