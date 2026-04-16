"use client";

import React, { useState } from "react";
import { Shield, Trash2, UserPlus, CheckCircle, AlertCircle } from "lucide-react";

interface PlatformUser {
  id: number;
  clerkUserId: string;
  roleNom: string;
  roleLabel: string;
  membreId: number | null;
  nom: string | null;
  prenom: string | null;
  email: string | null;
  assignedAt: string | null;
}

interface MembreOption {
  id: number;
  clerkUserId: string;
  nom: string;
  prenom: string | null;
  email: string;
}

interface Props {
  initialUsers: PlatformUser[];
  membres: MembreOption[];
}

const ROLE_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  super_admin: { bg: "#fef3c7", color: "#92400e", border: "#fde68a" },
  admin_plateforme: { bg: "#eff6ff", color: "#1e40af", border: "#bfdbfe" },
  moderateur_plateforme: { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" },
};

export default function AdminUtilisateursClient({ initialUsers, membres }: Props) {
  const [users, setUsers] = useState<PlatformUser[]>(initialUsers);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ clerkUserId: "", roleNom: "admin_plateforme" });
  const [loading, setLoading] = useState(false);
  const [revoking, setRevoking] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");

  const filteredMembres = membres.filter(
    (m) =>
      !search ||
      `${m.prenom ?? ""} ${m.nom} ${m.email}`.toLowerCase().includes(search.toLowerCase())
  );

  async function handleAssign(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/utilisateurs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erreur lors de l'assignation");
        return;
      }
      const roleLabel =
        form.roleNom === "admin_plateforme"
          ? "Administrateur Plateforme"
          : "Modérateur Plateforme";
      setUsers((prev) => [
        {
          id: data.id,
          clerkUserId: data.clerkUserId,
          roleNom: form.roleNom,
          roleLabel,
          membreId: data.membreId,
          nom: data.nom,
          prenom: data.prenom,
          email: data.email,
          assignedAt: new Date().toISOString(),
        },
        ...prev,
      ]);
      setSuccess(`Rôle assigné avec succès à ${data.prenom ?? ""} ${data.nom ?? ""}`.trim());
      setShowForm(false);
      setForm({ clerkUserId: "", roleNom: "admin_plateforme" });
      setSearch("");
    } finally {
      setLoading(false);
    }
  }

  async function handleRevoke(userRoleId: number, name: string) {
    if (!confirm(`Révoquer le rôle de ${name} ?`)) return;
    setRevoking(userRoleId);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/admin/utilisateurs", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userRoleId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erreur lors de la révocation");
        return;
      }
      setUsers((prev) => prev.filter((u) => u.id !== userRoleId));
      setSuccess("Rôle révoqué avec succès");
    } finally {
      setRevoking(null);
    }
  }

  const superAdmins = users.filter((u) => u.roleNom === "super_admin");
  const others = users.filter((u) => u.roleNom !== "super_admin");

  return (
    <div style={{ maxWidth: 860, margin: "0 auto" }}>
      {/* Messages */}
      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 10, padding: "12px 16px", marginBottom: 20, color: "#b91c1c", fontSize: 14 }}>
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          {error}
        </div>
      )}
      {success && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "12px 16px", marginBottom: 20, color: "#15803d", fontSize: 14 }}>
          <CheckCircle size={16} style={{ flexShrink: 0 }} />
          {success}
        </div>
      )}

      {/* Bouton ajouter */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20 }}>
        <button
          onClick={() => { setShowForm(!showForm); setError(""); setSuccess(""); }}
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 18px", background: "#1e3a8a", color: "white", border: "none", borderRadius: 9, fontWeight: 600, fontSize: 13.5, cursor: "pointer" }}
        >
          <UserPlus size={16} />
          Assigner un rôle
        </button>
      </div>

      {/* Formulaire d'assignation */}
      {showForm && (
        <div style={{ background: "white", borderRadius: 14, border: "1px solid #e2e8f0", padding: "1.5rem", marginBottom: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <h3 style={{ margin: "0 0 18px", fontSize: 15, fontWeight: 700, color: "#0f172a" }}>
            Assigner un rôle plateforme
          </h3>
          <form onSubmit={handleAssign} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                Rechercher un membre
              </label>
              <input
                type="text"
                placeholder="Nom, prénom ou email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: "100%", padding: "9px 13px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 13.5, boxSizing: "border-box", marginBottom: 8 }}
              />
              <select
                value={form.clerkUserId}
                onChange={(e) => setForm((f) => ({ ...f, clerkUserId: e.target.value }))}
                required
                style={{ width: "100%", padding: "9px 13px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 13.5, boxSizing: "border-box", background: "white" }}
              >
                <option value="">-- Sélectionner un membre --</option>
                {filteredMembres.map((m) => (
                  <option key={m.clerkUserId} value={m.clerkUserId}>
                    {m.prenom ? `${m.prenom} ${m.nom}` : m.nom} — {m.email}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                Rôle à assigner
              </label>
              <select
                value={form.roleNom}
                onChange={(e) => setForm((f) => ({ ...f, roleNom: e.target.value }))}
                style={{ width: "100%", padding: "9px 13px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 13.5, boxSizing: "border-box", background: "white" }}
              >
                <option value="admin_plateforme">Administrateur Plateforme</option>
                <option value="moderateur_plateforme">Modérateur Plateforme</option>
              </select>
              <p style={{ margin: "6px 0 0", fontSize: 12, color: "#64748b" }}>
                {form.roleNom === "admin_plateforme"
                  ? "Accès complet à l'administration : églises, membres, contenu, invitations."
                  : "Accès limité : modération du contenu et journal d'activité uniquement."}
              </p>
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => { setShowForm(false); setSearch(""); }}
                style={{ padding: "9px 18px", borderRadius: 8, border: "1.5px solid #e2e8f0", background: "white", color: "#374151", fontWeight: 600, fontSize: 13, cursor: "pointer" }}
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading || !form.clerkUserId}
                style={{ padding: "9px 20px", borderRadius: 8, background: "#1e3a8a", color: "white", border: "none", fontWeight: 700, fontSize: 13, cursor: "pointer", opacity: loading || !form.clerkUserId ? 0.6 : 1 }}
              >
                {loading ? "Assignation…" : "Confirmer l'assignation"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Super admins */}
      {superAdmins.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <h3 style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 12px" }}>
            Super Administrateurs
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {superAdmins.map((u) => <UserCard key={u.id} user={u} onRevoke={handleRevoke} revoking={revoking} canRevoke={false} />)}
          </div>
        </div>
      )}

      {/* Autres rôles plateforme */}
      <div>
        <h3 style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 12px" }}>
          Administrateurs et Modérateurs ({others.length})
        </h3>
        {others.length === 0 ? (
          <div style={{ background: "white", borderRadius: 12, border: "1px solid #e2e8f0", padding: "2.5rem", textAlign: "center" }}>
            <Shield size={36} style={{ color: "#cbd5e1", margin: "0 auto 12px", display: "block" }} />
            <p style={{ color: "#94a3b8", fontSize: 14, margin: 0 }}>
              Aucun administrateur ou modérateur assigné.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {others.map((u) => (
              <UserCard key={u.id} user={u} onRevoke={handleRevoke} revoking={revoking} canRevoke={true} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function UserCard({
  user,
  onRevoke,
  revoking,
  canRevoke,
}: {
  user: PlatformUser;
  onRevoke: (id: number, name: string) => void;
  revoking: number | null;
  canRevoke: boolean;
}) {
  const roleStyle = ROLE_COLORS[user.roleNom] ?? ROLE_COLORS.moderateur_plateforme;
  const fullName = [user.prenom, user.nom].filter(Boolean).join(" ") || user.email || user.clerkUserId;
  const initials = fullName.slice(0, 2).toUpperCase();
  const isRevoking = revoking === user.id;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        background: "white",
        borderRadius: 12,
        border: "1px solid #e2e8f0",
        padding: "14px 18px",
        transition: "border-color 0.15s",
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          background: roleStyle.bg,
          border: `1.5px solid ${roleStyle.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 700,
          fontSize: 14,
          color: roleStyle.color,
          flexShrink: 0,
        }}
      >
        {initials}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 14, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {fullName}
        </div>
        {user.email && (
          <div style={{ fontSize: 12, color: "#64748b", marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {user.email}
          </div>
        )}
        {user.assignedAt && (
          <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
            Assigné le {new Date(user.assignedAt).toLocaleDateString("fr-FR")}
          </div>
        )}
      </div>
      <span
        style={{
          padding: "3px 12px",
          borderRadius: 100,
          fontSize: 11,
          fontWeight: 700,
          background: roleStyle.bg,
          color: roleStyle.color,
          border: `1px solid ${roleStyle.border}`,
          flexShrink: 0,
          whiteSpace: "nowrap",
        }}
      >
        {user.roleLabel}
      </span>
      {canRevoke && (
        <button
          onClick={() => onRevoke(user.id, fullName)}
          disabled={isRevoking}
          title="Révoquer ce rôle"
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: "#94a3b8",
            padding: 6,
            borderRadius: 6,
            display: "flex",
            alignItems: "center",
            flexShrink: 0,
            opacity: isRevoking ? 0.5 : 1,
          }}
        >
          <Trash2 size={15} />
        </button>
      )}
    </div>
  );
}
