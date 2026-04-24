"use client";

import React, { useState } from "react";
import { CheckCircle, Plus } from "lucide-react";
import { useConfirm } from "@/components/ui/useConfirm";

interface UserRoleItem {
  id: number;
  clerkUserId: string;
  roleNom: string;
  createdAt: string;
}

interface InviteItem {
  id: number;
  email: string;
  token: string;
  roleNom: string;
  expiresAt: string;
}

interface Props {
  initialUserRoles: UserRoleItem[];
  pendingInvites: InviteItem[];
  currentUserId: string;
}

const roleLabels: Record<string, { label: string; bg: string; color: string }> = {
  admin_eglise: { label: "Admin église", bg: "#dcfce7", color: "#15803d" },
  moderateur: { label: "Modérateur", bg: "#fef3c7", color: "#b45309" },
};

export default function GestionAdminsClient({ initialUserRoles, pendingInvites: initialInvites, currentUserId }: Props) {
  const [ConfirmDialog, confirm] = useConfirm();
  const [userRoles, setUserRoles] = useState<UserRoleItem[]>(initialUserRoles);
  const [invites, setInvites] = useState<InviteItem[]>(initialInvites);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("moderateur");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await fetch("/api/gestion/admins/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail, roleNom: inviteRole }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erreur");
        return;
      }
      setInvites((prev) => [
        { id: data.id ?? Date.now(), email: data.email, token: data.token, roleNom: inviteRole, expiresAt: data.expiresAt },
        ...prev,
      ]);
      setSuccessMsg(`Invitation créée pour ${inviteEmail}`);
      setInviteEmail("");
      setShowInviteForm(false);
    } finally {
      setLoading(false);
    }
  }

  async function handleRevoke(id: number) {
    const ok = await confirm({ title: "Révoquer cet administrateur ?", description: "Cette personne perdra son accès à l'espace de gestion.", confirmLabel: "Révoquer", variant: "danger" });
    if (!ok) return;
    const res = await fetch(`/api/gestion/admins/${id}/revoke`, { method: "DELETE" });
    if (res.ok) {
      setUserRoles((prev) => prev.filter((ur) => ur.id !== id));
    } else {
      const data = await res.json();
      alert(data.error ?? "Erreur lors de la révocation");
    }
  }

  function copyToken(token: string) {
    const link = `${window.location.origin}/setup/${token}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopiedToken(token);
      setTimeout(() => setCopiedToken(null), 2000);
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <ConfirmDialog />
      {successMsg && (
        <div style={{ background: "#dcfce7", color: "#15803d", padding: "10px 14px", borderRadius: 8, fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
          <CheckCircle size={16} color="#15803d" />
          {successMsg}
        </div>
      )}

      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ fontWeight: 700, fontSize: 16, color: "#0f172a", margin: 0 }}>
            Administrateurs actifs ({userRoles.length})
          </h2>
          <button
            onClick={() => { setShowInviteForm(true); setError(null); }}
            style={{ background: "#1e3a8a", color: "white", border: "none", borderRadius: 8, padding: "9px 18px", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            <Plus size={15} /> Inviter un admin
          </button>
        </div>

        {showInviteForm && (
          <div style={{ background: "white", borderRadius: 12, padding: "1.25rem 1.5rem", border: "1px solid #e2e8f0", marginBottom: 16, boxShadow: "0 4px 12px rgba(0,0,0,0.06)" }}>
            <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700, color: "#0f172a" }}>Inviter un administrateur</h3>
            {error && <div style={{ background: "#fee2e2", color: "#b91c1c", padding: "8px 12px", borderRadius: 6, marginBottom: 12, fontSize: 13 }}>{error}</div>}
            <form onSubmit={handleInvite} style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
              <div style={{ flex: 2, minWidth: 200 }}>
                <label style={s.label}>Email *</label>
                <input
                  type="email"
                  style={s.input}
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="admin@eglise.cd"
                  required
                />
              </div>
              <div style={{ flex: 1, minWidth: 160 }}>
                <label style={s.label}>Rôle</label>
                <select style={s.input} value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}>
                  <option value="moderateur">Modérateur</option>
                  <option value="admin_eglise">Admin église</option>
                </select>
              </div>
              <div style={{ display: "flex", gap: 8, paddingBottom: 1 }}>
                <button type="button" onClick={() => setShowInviteForm(false)} style={s.cancelBtn}>Annuler</button>
                <button type="submit" style={s.submitBtn} disabled={loading}>
                  {loading ? "Envoi…" : "Générer l'invitation"}
                </button>
              </div>
            </form>
          </div>
        )}

        {userRoles.length === 0 ? (
          <div style={{ textAlign: "center", padding: "2rem", background: "white", borderRadius: 12, border: "1px dashed #cbd5e1" }}>
            <p style={{ color: "#64748b", fontSize: 14 }}>Aucun administrateur pour l&apos;instant.</p>
          </div>
        ) : (
          <div style={{ background: "white", borderRadius: 12, border: "1px solid #e2e8f0", overflow: "hidden" }}>
            {userRoles.map((ur, idx) => {
              const rl = roleLabels[ur.roleNom] ?? roleLabels.moderateur;
              const isMe = ur.clerkUserId === currentUserId;
              return (
                <div key={ur.id} style={{
                  padding: "1rem 1.5rem", display: "flex", alignItems: "center", gap: 12, justifyContent: "space-between",
                  borderTop: idx > 0 ? "1px solid #f1f5f9" : "none",
                }}>
                  <div>
                    <div style={{ fontSize: 13, color: "#64748b" }}>
                      ID Clerk: <code style={{ fontSize: 11, background: "#f1f5f9", padding: "1px 6px", borderRadius: 4 }}>{ur.clerkUserId.slice(0, 24)}…</code>
                      {isMe && <span style={{ marginLeft: 8, fontSize: 11, color: "#1e3a8a", fontWeight: 600 }}>Vous</span>}
                    </div>
                    <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
                      Depuis le {new Date(ur.createdAt).toLocaleDateString("fr-FR")}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ padding: "2px 10px", borderRadius: 100, fontSize: 11, fontWeight: 600, background: rl.bg, color: rl.color }}>{rl.label}</span>
                    {!isMe && (
                      <button onClick={() => handleRevoke(ur.id)} style={{ padding: "6px 12px", borderRadius: 7, border: "none", background: "#fee2e2", color: "#b91c1c", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>
                        Révoquer
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {invites.length > 0 && (
        <div>
          <h2 style={{ fontWeight: 700, fontSize: 16, color: "#0f172a", margin: "0 0 14px" }}>
            Invitations en attente ({invites.length})
          </h2>
          <div style={{ background: "white", borderRadius: 12, border: "1px solid #e2e8f0", overflow: "hidden" }}>
            {invites.map((inv, idx) => {
              const rl = roleLabels[inv.roleNom] ?? roleLabels.moderateur;
              return (
                <div key={inv.id} style={{
                  padding: "1rem 1.5rem", display: "flex", alignItems: "center", gap: 12, justifyContent: "space-between", flexWrap: "wrap",
                  borderTop: idx > 0 ? "1px solid #f1f5f9" : "none",
                }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: "#0f172a" }}>{inv.email}</div>
                    <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
                      Expire le {new Date(inv.expiresAt).toLocaleDateString("fr-FR")}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ padding: "2px 10px", borderRadius: 100, fontSize: 11, fontWeight: 600, background: rl.bg, color: rl.color }}>{rl.label}</span>
                    <button
                      onClick={() => copyToken(inv.token)}
                      style={{ padding: "6px 14px", borderRadius: 7, border: "1.5px solid #e2e8f0", background: "white", color: "#1e3a8a", fontWeight: 600, fontSize: 12, cursor: "pointer" }}
                    >
                      {copiedToken === inv.token ? "Copié !" : "Copier le lien"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

const s = {
  label: { fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 } as React.CSSProperties,
  input: { width: "100%", padding: "9px 12px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 14, outline: "none", boxSizing: "border-box" as const } as React.CSSProperties,
  cancelBtn: { padding: "9px 16px", borderRadius: 8, border: "1.5px solid #e2e8f0", background: "white", color: "#374151", fontWeight: 600, fontSize: 13, cursor: "pointer" } as React.CSSProperties,
  submitBtn: { padding: "9px 18px", borderRadius: 8, border: "none", background: "#1e3a8a", color: "white", fontWeight: 700, fontSize: 13, cursor: "pointer" } as React.CSSProperties,
};
