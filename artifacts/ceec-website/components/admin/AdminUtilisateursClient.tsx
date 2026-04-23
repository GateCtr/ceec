"use client";

import React, { useState } from "react";
import { Shield, Trash2, UserPlus, CheckCircle, AlertCircle, Mail, Clock, X } from "lucide-react";

interface PlatformUser {
  id: number;
  clerkUserId: string;
  roleNom: string;
  roleLabel: string;
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

export interface PendingInvite {
  id: number;
  email: string;
  roleNom: string;
  roleLabel: string;
  expiresAt: string;
  createdAt: string;
  expired: boolean;
}

interface Props {
  initialUsers: PlatformUser[];
  membres: MembreOption[];
  initialInvitations: PendingInvite[];
}

const ROLE_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  super_admin: { bg: "#fef3c7", color: "#92400e", border: "#fde68a" },
  admin_plateforme: { bg: "#eff6ff", color: "#1e40af", border: "#bfdbfe" },
  moderateur_plateforme: { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" },
};

type Mode = "none" | "assign" | "invite";

export default function AdminUtilisateursClient({
  initialUsers,
  membres,
  initialInvitations,
}: Props) {
  const [users, setUsers] = useState<PlatformUser[]>(initialUsers);
  const [invitations, setInvitations] = useState<PendingInvite[]>(initialInvitations);
  const [mode, setMode] = useState<Mode>("none");

  // Assign form
  const [assignForm, setAssignForm] = useState({ clerkUserId: "", roleNom: "admin_plateforme" });
  const [assignSearch, setAssignSearch] = useState("");
  const [assignLoading, setAssignLoading] = useState(false);

  // Invite form
  const [inviteForm, setInviteForm] = useState({ email: "", roleNom: "admin_plateforme" });
  const [inviteLoading, setInviteLoading] = useState(false);

  // Shared state
  const [revoking, setRevoking] = useState<number | null>(null);
  const [cancelling, setCancelling] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const filteredMembres = membres.filter(
    (m) =>
      !assignSearch ||
      `${m.prenom ?? ""} ${m.nom} ${m.email}`.toLowerCase().includes(assignSearch.toLowerCase())
  );

  function openMode(m: Mode) {
    setMode((prev) => (prev === m ? "none" : m));
    setError("");
    setSuccess("");
  }

  async function handleAssign(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setAssignLoading(true);
    try {
      const res = await fetch("/api/admin/utilisateurs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(assignForm),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Erreur lors de l'assignation"); return; }
      const roleLabel =
        assignForm.roleNom === "admin_plateforme" ? "Administrateur Plateforme" : "Modérateur Plateforme";
      setUsers((prev) => [
        {
          id: data.id, clerkUserId: data.clerkUserId,
          roleNom: assignForm.roleNom, roleLabel,
          nom: data.nom, prenom: data.prenom, email: data.email,
          assignedAt: new Date().toISOString(),
        },
        ...prev,
      ]);
      setSuccess(`Rôle assigné avec succès à ${data.prenom ?? ""} ${data.nom ?? ""}`.trim());
      setMode("none");
      setAssignForm({ clerkUserId: "", roleNom: "admin_plateforme" });
      setAssignSearch("");
    } finally {
      setAssignLoading(false);
    }
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setInviteLoading(true);
    try {
      const res = await fetch("/api/admin/utilisateurs/inviter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inviteForm),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Erreur lors de l'envoi"); return; }
      setInvitations((prev) => [data, ...prev]);
      setSuccess(`Invitation envoyée à ${inviteForm.email}`);
      setMode("none");
      setInviteForm({ email: "", roleNom: "admin_plateforme" });
    } finally {
      setInviteLoading(false);
    }
  }

  async function handleRevoke(userRoleId: number, name: string) {
    if (!confirm(`Révoquer le rôle de ${name} ?`)) return;
    setRevoking(userRoleId);
    setError(""); setSuccess("");
    try {
      const res = await fetch("/api/admin/utilisateurs", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userRoleId }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Erreur lors de la révocation"); return; }
      setUsers((prev) => prev.filter((u) => u.id !== userRoleId));
      setSuccess("Rôle révoqué avec succès");
    } finally {
      setRevoking(null);
    }
  }

  async function handleCancelInvite(inviteId: number, email: string) {
    if (!confirm(`Annuler l'invitation envoyée à ${email} ?`)) return;
    setCancelling(inviteId);
    setError(""); setSuccess("");
    try {
      const res = await fetch("/api/admin/utilisateurs/invitations", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteId }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Erreur lors de l'annulation"); return; }
      setInvitations((prev) => prev.filter((i) => i.id !== inviteId));
      setSuccess("Invitation annulée");
    } finally {
      setCancelling(null);
    }
  }

  const superAdmins = users.filter((u) => u.roleNom === "super_admin");
  const others = users.filter((u) => u.roleNom !== "super_admin");

  return (
    <div style={{ maxWidth: 860, margin: "0 auto" }}>
      {/* Messages */}
      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 10, padding: "12px 16px", marginBottom: 20, color: "#b91c1c", fontSize: 14 }}>
          <AlertCircle size={16} style={{ flexShrink: 0 }} /> {error}
        </div>
      )}
      {success && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "12px 16px", marginBottom: 20, color: "#15803d", fontSize: 14 }}>
          <CheckCircle size={16} style={{ flexShrink: 0 }} /> {success}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginBottom: 20, flexWrap: "wrap" }}>
        <button
          onClick={() => openMode("invite")}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "9px 18px", borderRadius: 9, fontWeight: 600, fontSize: 13.5, cursor: "pointer",
            background: mode === "invite" ? "#0f172a" : "#1e3a8a", color: "white", border: "none",
          }}
        >
          <Mail size={16} />
          Inviter par email
        </button>
        <button
          onClick={() => openMode("assign")}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "9px 18px", borderRadius: 9, fontWeight: 600, fontSize: 13.5, cursor: "pointer",
            background: "white", color: "#1e3a8a",
            border: "1.5px solid #bfdbfe",
          }}
        >
          <UserPlus size={16} />
          Assigner un rôle
        </button>
      </div>

      {/* ── Formulaire : Inviter par email ── */}
      {mode === "invite" && (
        <div style={{ background: "white", borderRadius: 14, border: "1px solid #bfdbfe", padding: "1.5rem", marginBottom: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <h3 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 700, color: "#0f172a" }}>
            Inviter un nouvel administrateur
          </h3>
          <p style={{ margin: "0 0 18px", fontSize: 13, color: "#64748b" }}>
            Un email sera envoyé avec un lien d&apos;activation valable 7 jours.
          </p>
          <form onSubmit={handleInvite} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                Adresse email
              </label>
              <input
                type="email"
                required
                placeholder="admin@exemple.com"
                value={inviteForm.email}
                onChange={(e) => setInviteForm((f) => ({ ...f, email: e.target.value }))}
                style={{ width: "100%", padding: "9px 13px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 13.5, boxSizing: "border-box" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                Rôle à attribuer
              </label>
              <select
                value={inviteForm.roleNom}
                onChange={(e) => setInviteForm((f) => ({ ...f, roleNom: e.target.value }))}
                style={{ width: "100%", padding: "9px 13px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 13.5, boxSizing: "border-box", background: "white" }}
              >
                <option value="admin_plateforme">Administrateur Plateforme</option>
                <option value="moderateur_plateforme">Modérateur Plateforme</option>
              </select>
              <p style={{ margin: "6px 0 0", fontSize: 12, color: "#64748b" }}>
                {inviteForm.roleNom === "admin_plateforme"
                  ? "Accès complet à l'administration : églises, membres, contenu, invitations."
                  : "Accès limité : modération du contenu et journal d'activité uniquement."}
              </p>
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => setMode("none")}
                style={{ padding: "9px 18px", borderRadius: 8, border: "1.5px solid #e2e8f0", background: "white", color: "#374151", fontWeight: 600, fontSize: 13, cursor: "pointer" }}
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={inviteLoading || !inviteForm.email}
                style={{ padding: "9px 20px", borderRadius: 8, background: "#1e3a8a", color: "white", border: "none", fontWeight: 700, fontSize: 13, cursor: "pointer", opacity: inviteLoading || !inviteForm.email ? 0.6 : 1 }}
              >
                {inviteLoading ? "Envoi…" : "Envoyer l'invitation"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Formulaire : Assigner un rôle (membre existant) ── */}
      {mode === "assign" && (
        <div style={{ background: "white", borderRadius: 14, border: "1px solid #e2e8f0", padding: "1.5rem", marginBottom: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <h3 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 700, color: "#0f172a" }}>
            Assigner un rôle à un membre existant
          </h3>
          <p style={{ margin: "0 0 18px", fontSize: 13, color: "#64748b" }}>
            Le membre doit déjà être inscrit sur la plateforme.
          </p>
          <form onSubmit={handleAssign} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                Rechercher un membre
              </label>
              <input
                type="text"
                placeholder="Nom, prénom ou email..."
                value={assignSearch}
                onChange={(e) => setAssignSearch(e.target.value)}
                style={{ width: "100%", padding: "9px 13px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 13.5, boxSizing: "border-box", marginBottom: 8 }}
              />
              <select
                value={assignForm.clerkUserId}
                onChange={(e) => setAssignForm((f) => ({ ...f, clerkUserId: e.target.value }))}
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
                value={assignForm.roleNom}
                onChange={(e) => setAssignForm((f) => ({ ...f, roleNom: e.target.value }))}
                style={{ width: "100%", padding: "9px 13px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 13.5, boxSizing: "border-box", background: "white" }}
              >
                <option value="admin_plateforme">Administrateur Plateforme</option>
                <option value="moderateur_plateforme">Modérateur Plateforme</option>
              </select>
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button type="button" onClick={() => { setMode("none"); setAssignSearch(""); }}
                style={{ padding: "9px 18px", borderRadius: 8, border: "1.5px solid #e2e8f0", background: "white", color: "#374151", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                Annuler
              </button>
              <button type="submit" disabled={assignLoading || !assignForm.clerkUserId}
                style={{ padding: "9px 20px", borderRadius: 8, background: "#1e3a8a", color: "white", border: "none", fontWeight: 700, fontSize: 13, cursor: "pointer", opacity: assignLoading || !assignForm.clerkUserId ? 0.6 : 1 }}>
                {assignLoading ? "Assignation…" : "Confirmer l'assignation"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Super admins ── */}
      {superAdmins.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <h3 style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 12px" }}>
            Super Administrateurs
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {superAdmins.map((u) => (
              <UserCard key={u.id} user={u} onRevoke={handleRevoke} revoking={revoking} canRevoke={false} />
            ))}
          </div>
        </div>
      )}

      {/* ── Admins & Modérateurs ── */}
      <div style={{ marginBottom: 32 }}>
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

      {/* ── Invitations en attente ── */}
      <div>
        <h3 style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 12px", display: "flex", alignItems: "center", gap: 8 }}>
          Invitations en attente
          {invitations.length > 0 && (
            <span style={{ background: "#fef3c7", color: "#92400e", border: "1px solid #fde68a", borderRadius: 100, fontSize: 10, padding: "1px 8px", fontWeight: 700 }}>
              {invitations.length}
            </span>
          )}
        </h3>

        {invitations.length === 0 ? (
          <div style={{ background: "#f8fafc", borderRadius: 12, border: "1px solid #e2e8f0", padding: "2rem", textAlign: "center" }}>
            <Mail size={28} style={{ color: "#cbd5e1", margin: "0 auto 10px", display: "block" }} />
            <p style={{ color: "#94a3b8", fontSize: 14, margin: 0 }}>
              Aucune invitation en attente.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {invitations.map((inv) => (
              <InviteCard
                key={inv.id}
                invite={inv}
                onCancel={handleCancelInvite}
                cancelling={cancelling}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── UserCard ───────────────────────────────────────── */
function UserCard({
  user, onRevoke, revoking, canRevoke,
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
    <div style={{ display: "flex", alignItems: "center", gap: 14, background: "white", borderRadius: 12, border: "1px solid #e2e8f0", padding: "14px 18px" }}>
      <div style={{ width: 40, height: 40, borderRadius: "50%", background: roleStyle.bg, border: `1.5px solid ${roleStyle.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, color: roleStyle.color, flexShrink: 0 }}>
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
      <span style={{ padding: "3px 12px", borderRadius: 100, fontSize: 11, fontWeight: 700, background: roleStyle.bg, color: roleStyle.color, border: `1px solid ${roleStyle.border}`, flexShrink: 0, whiteSpace: "nowrap" }}>
        {user.roleLabel}
      </span>
      {canRevoke && (
        <button onClick={() => onRevoke(user.id, fullName)} disabled={isRevoking} title="Révoquer ce rôle"
          style={{ background: "transparent", border: "none", cursor: "pointer", color: "#94a3b8", padding: 6, borderRadius: 6, display: "flex", alignItems: "center", flexShrink: 0, opacity: isRevoking ? 0.5 : 1 }}>
          <Trash2 size={15} />
        </button>
      )}
    </div>
  );
}

/* ── InviteCard ─────────────────────────────────────── */
function InviteCard({
  invite, onCancel, cancelling,
}: {
  invite: PendingInvite;
  onCancel: (id: number, email: string) => void;
  cancelling: number | null;
}) {
  const roleStyle = ROLE_COLORS[invite.roleNom] ?? ROLE_COLORS.moderateur_plateforme;
  const isCancelling = cancelling === invite.id;
  const daysLeft = Math.max(0, Math.ceil((new Date(invite.expiresAt).getTime() - Date.now()) / 86400000));

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, background: invite.expired ? "#fafafa" : "white", borderRadius: 12, border: "1px solid #e2e8f0", padding: "14px 18px", opacity: invite.expired ? 0.65 : 1 }}>
      <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#f8fafc", border: "1.5px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Mail size={18} color="#94a3b8" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 14, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {invite.email}
        </div>
        <div style={{ fontSize: 12, color: "#64748b", marginTop: 1 }}>
          Invité le {new Date(invite.createdAt).toLocaleDateString("fr-FR")}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
        <span style={{ padding: "3px 10px", borderRadius: 100, fontSize: 11, fontWeight: 700, background: roleStyle.bg, color: roleStyle.color, border: `1px solid ${roleStyle.border}`, whiteSpace: "nowrap" }}>
          {invite.roleLabel}
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: invite.expired ? "#ef4444" : "#94a3b8" }}>
          <Clock size={11} />
          {invite.expired ? "Expirée" : `Expire dans ${daysLeft}j`}
        </span>
      </div>
      <button onClick={() => onCancel(invite.id, invite.email)} disabled={isCancelling} title="Annuler cette invitation"
        style={{ background: "transparent", border: "none", cursor: "pointer", color: "#94a3b8", padding: 6, borderRadius: 6, display: "flex", alignItems: "center", flexShrink: 0, opacity: isCancelling ? 0.5 : 1 }}>
        <X size={15} />
      </button>
    </div>
  );
}
