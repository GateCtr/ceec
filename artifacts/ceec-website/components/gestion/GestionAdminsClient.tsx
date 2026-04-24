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

const roleLabels: Record<string, { label: string; badgeClass: string }> = {
  admin_eglise: { label: "Admin église", badgeClass: "badge badge-success" },
  moderateur: { label: "Modérateur", badgeClass: "badge badge-warning" },
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
    <div className="flex flex-col gap-7">
      <ConfirmDialog />
      {successMsg && (
        <div className="alert alert-success">
          <CheckCircle size={16} className="shrink-0 text-success" />
          {successMsg}
        </div>
      )}

      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-base text-foreground !m-0">
            Administrateurs actifs ({userRoles.length})
          </h2>
          <button
            onClick={() => { setShowInviteForm(true); setError(null); }}
            className="btn btn-primary btn-sm"
          >
            <Plus size={15} /> Inviter un admin
          </button>
        </div>

        {showInviteForm && (
          <div className="card mb-4 p-5 shadow-md">
            <h3 className="!m-0 !mb-3.5 text-[15px] font-bold text-foreground">Inviter un administrateur</h3>
            {error && <div className="alert alert-danger mb-3 text-[13px]">{error}</div>}
            <form onSubmit={handleInvite} className="flex gap-3 items-end flex-wrap">
              <div className="flex-[2] min-w-[200px]">
                <label className="label">Email *</label>
                <input
                  type="email"
                  className="input"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="admin@eglise.cd"
                  required
                />
              </div>
              <div className="flex-1 min-w-[160px]">
                <label className="label">Rôle</label>
                <select className="input select" value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}>
                  <option value="moderateur">Modérateur</option>
                  <option value="admin_eglise">Admin église</option>
                </select>
              </div>
              <div className="flex gap-2 pb-px">
                <button type="button" onClick={() => setShowInviteForm(false)} className="btn btn-outline btn-sm">Annuler</button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
                  {loading ? "Envoi…" : "Générer l'invitation"}
                </button>
              </div>
            </form>
          </div>
        )}

        {userRoles.length === 0 ? (
          <div className="text-center p-8 bg-white rounded-xl border border-dashed border-border">
            <p className="text-muted-foreground text-sm">Aucun administrateur pour l&apos;instant.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            {userRoles.map((ur, idx) => {
              const rl = roleLabels[ur.roleNom] ?? roleLabels.moderateur;
              const isMe = ur.clerkUserId === currentUserId;
              return (
                <div key={ur.id} className={`px-6 py-4 flex items-center gap-3 justify-between ${idx > 0 ? "border-t border-slate-100" : ""}`}>
                  <div>
                    <div className="text-[13px] text-muted-foreground">
                      ID Clerk: <code className="text-[11px] bg-slate-100 px-1.5 py-px rounded">{ur.clerkUserId.slice(0, 24)}…</code>
                      {isMe && <span className="ml-2 text-[11px] text-primary font-semibold">Vous</span>}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Depuis le {new Date(ur.createdAt).toLocaleDateString("fr-FR")}
                    </div>
                  </div>
                  <div className="flex gap-2 items-center">
                    <span className={rl.badgeClass}>{rl.label}</span>
                    {!isMe && (
                      <button onClick={() => handleRevoke(ur.id)} className="btn btn-danger btn-xs">
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
          <h2 className="font-bold text-base text-foreground !m-0 !mb-3.5">
            Invitations en attente ({invites.length})
          </h2>
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            {invites.map((inv, idx) => {
              const rl = roleLabels[inv.roleNom] ?? roleLabels.moderateur;
              return (
                <div key={inv.id} className={`px-6 py-4 flex items-center gap-3 justify-between flex-wrap ${idx > 0 ? "border-t border-slate-100" : ""}`}>
                  <div>
                    <div className="font-semibold text-sm text-foreground">{inv.email}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Expire le {new Date(inv.expiresAt).toLocaleDateString("fr-FR")}
                    </div>
                  </div>
                  <div className="flex gap-2 items-center">
                    <span className={rl.badgeClass}>{rl.label}</span>
                    <button
                      onClick={() => copyToken(inv.token)}
                      className="btn btn-outline btn-xs"
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
