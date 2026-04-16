"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle, AlertCircle, Copy, Check, RefreshCw, Clock, ArrowLeft, ChevronRight } from "lucide-react";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);
}

export interface PendingInvite {
  id: number;
  nom: string;
  slug: string | null;
  statut: string;
  inviteTokens: Array<{ email: string; expiresAt: string; createdAt: string }>;
}

interface SuccessData {
  eglise: { nom: string; slug: string };
  inviteToken: string;
  emailEnvoye: boolean;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [text]);
  return (
    <button
      onClick={handleCopy}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "6px 12px", borderRadius: 7,
        border: "1px solid #e2e8f0", background: "white",
        color: copied ? "#15803d" : "#1e3a8a",
        fontWeight: 600, fontSize: 12, cursor: "pointer", marginTop: 8, transition: "all 0.15s",
      }}
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
      {copied ? "Copié !" : "Copier le lien"}
    </button>
  );
}

interface Props {
  initialPending: PendingInvite[];
}

export default function NouvelleEgliseForm({ initialPending }: Props) {
  const router = useRouter();
  const [form, setForm] = useState({ nom: "", slug: "", ville: "", emailAdmin: "", sousDomaine: "" });
  const [slugEdited, setSlugEdited] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<SuccessData | null>(null);
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>(initialPending);
  const [resending, setResending] = useState<number | null>(null);
  const [resendResults, setResendResults] = useState<Record<number, { success: boolean; token?: string; emailEnvoye?: boolean }>>({});

  const fetchPending = useCallback(() => {
    fetch("/api/admin/eglises")
      .then((r) => r.json())
      .then((data: PendingInvite[]) => {
        if (Array.isArray(data)) {
          setPendingInvites(data.filter((e) => e.statut === "en_attente" && e.inviteTokens.length > 0));
        }
      })
      .catch(() => {});
  }, []);

  const handleNomChange = (nom: string) => {
    setForm((f) => ({ ...f, nom, slug: slugEdited ? f.slug : slugify(nom) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/eglises", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Erreur lors de la création"); return; }
      setSuccess(data);
      fetchPending();
    } catch { setError("Erreur réseau, veuillez réessayer"); }
    finally { setLoading(false); }
  };

  const handleResend = async (inv: PendingInvite) => {
    if (!inv.slug) return;
    setResending(inv.id);
    try {
      const res = await fetch(`/api/admin/eglises/${inv.slug}/resend-invite`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setResendResults((prev) => ({ ...prev, [inv.id]: { success: true, token: data.token, emailEnvoye: data.emailEnvoye } }));
        fetchPending();
      } else {
        setResendResults((prev) => ({ ...prev, [inv.id]: { success: false } }));
      }
    } finally { setResending(null); }
  };

  const inviteLink = (token: string) =>
    typeof window !== "undefined" ? `${window.location.origin}/setup/${token}` : `/setup/${token}`;

  if (success) {
    const link = inviteLink(success.inviteToken);
    return (
      <div style={card}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ width: 60, height: 60, background: "#dcfce7", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <CheckCircle size={30} style={{ color: "#15803d" }} />
          </div>
          <h2 style={{ color: "#0f172a", margin: "0 0 6px", fontSize: 20, fontWeight: 800 }}>Église créée avec succès</h2>
          <p style={{ color: "#64748b", margin: 0, fontSize: 14 }}>
            <strong style={{ color: "#1e3a8a" }}>{success.eglise.nom}</strong> a été ajoutée à la plateforme.
          </p>
        </div>

        {success.emailEnvoye ? (
          <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "14px 18px", marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#15803d", fontSize: 13.5, fontWeight: 600 }}>
              <CheckCircle size={15} />
              Email d&apos;invitation envoyé avec succès
            </div>
            <p style={{ margin: "6px 0 0", color: "#166534", fontSize: 13 }}>
              L&apos;administrateur recevra un lien valable 7 jours.
            </p>
          </div>
        ) : (
          <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, padding: "16px 18px", marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#b45309", fontSize: 13.5, fontWeight: 600, marginBottom: 10 }}>
              <AlertCircle size={15} />
              Email non envoyé — copiez et transmettez manuellement
            </div>
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "10px 14px", fontFamily: "monospace", fontSize: 12, wordBreak: "break-all", color: "#1e3a8a", lineHeight: 1.5 }}>
              {link}
            </div>
            <CopyButton text={link} />
          </div>
        )}

        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <button style={btnOutline} onClick={() => { setSuccess(null); setForm({ nom: "", slug: "", ville: "", emailAdmin: "", sousDomaine: "" }); setSlugEdited(false); }}>
            Inviter une autre église
          </button>
          <button style={{ ...btn, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6 }} onClick={() => router.push("/admin/eglises")}>Voir la liste <ChevronRight size={15} /></button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div style={card}>
        <div style={{ marginBottom: 24 }}>
          <Link href="/admin/eglises" style={{ color: "#64748b", fontSize: 13, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 }}>
            <ArrowLeft size={14} /> Retour à la liste
          </Link>
          <h1 style={{ margin: "10px 0 4px", fontSize: 20, fontWeight: 800, color: "#0f172a" }}>
            Inviter une nouvelle église
          </h1>
          <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>
            Un lien d&apos;invitation valable 7 jours sera envoyé à l&apos;administrateur désigné.
          </p>
        </div>

        {error && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 8, padding: "12px 16px", marginBottom: 20, color: "#b91c1c", fontSize: 13.5 }}>
            <AlertCircle size={15} style={{ flexShrink: 0 }} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Section title="Informations de l'église">
            <Field label="Nom de l'église *">
              <input style={input} type="text" placeholder="Église Évangélique du Centre" value={form.nom} onChange={(e) => handleNomChange(e.target.value)} required />
            </Field>
            <Field label="Identifiant URL (slug) *" hint="Généré automatiquement, modifiable">
              <input style={input} type="text" placeholder="eglise-evangelique-centre" value={form.slug}
                onChange={(e) => { setSlugEdited(true); setForm((f) => ({ ...f, slug: slugify(e.target.value) })); }}
                required pattern="[a-z0-9\-]+" />
              {form.slug && (
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>URL : /paroisses/<strong>{form.slug}</strong></div>
              )}
            </Field>
            <Field label="Ville *">
              <input style={input} type="text" placeholder="Kinshasa" value={form.ville} onChange={(e) => setForm((f) => ({ ...f, ville: e.target.value }))} required />
            </Field>
            <Field label="Sous-domaine (optionnel)" hint="ex: kinshasa-centre (donne kinshasa-centre.ceec.cd)">
              <input style={input} type="text" placeholder="kinshasa-centre" value={form.sousDomaine}
                onChange={(e) => setForm((f) => ({ ...f, sousDomaine: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") }))} />
            </Field>
          </Section>

          <Section title="Administrateur principal">
            <Field label="Adresse email *" hint="Cette personne recevra le lien pour créer son compte">
              <input style={input} type="email" placeholder="pasteur@eglise.org" value={form.emailAdmin} onChange={(e) => setForm((f) => ({ ...f, emailAdmin: e.target.value }))} required />
            </Field>
          </Section>

          <button type="submit" style={{ ...btn, marginTop: 8 }} disabled={loading || !form.nom || !form.slug || !form.ville || !form.emailAdmin}>
            {loading ? "Création en cours…" : <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>Envoyer l&apos;invitation <ChevronRight size={15} /></span>}
          </button>
        </form>
      </div>

      {pendingInvites.length > 0 && (
        <div style={{ ...card, marginTop: 24 }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 700, color: "#0f172a", display: "flex", alignItems: "center", gap: 8 }}>
            <Clock size={15} style={{ color: "#64748b" }} />
            Invitations en attente ({pendingInvites.length})
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {pendingInvites.map((inv) => {
              const inv0 = inv.inviteTokens[0];
              const expiresAt = inv0 ? new Date(inv0.expiresAt) : null;
              const expired = expiresAt ? expiresAt < new Date() : false;
              const resendResult = resendResults[inv.id];
              const isResending = resending === inv.id;

              return (
                <div key={inv.id} style={{ background: "#f8fafc", borderRadius: 10, border: `1px solid ${expired ? "#fca5a5" : "#e2e8f0"}`, padding: "14px 16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 700, color: "#0f172a", fontSize: 14 }}>{inv.nom}</div>
                      {inv0 && (
                        <div style={{ fontSize: 12, color: "#64748b", marginTop: 3 }}>
                          {inv0.email} · Expire le {expiresAt?.toLocaleDateString("fr-FR")}
                        </div>
                      )}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ padding: "3px 10px", borderRadius: 100, fontSize: 11, fontWeight: 600, background: expired ? "#fee2e2" : "#fef3c7", color: expired ? "#b91c1c" : "#b45309" }}>
                        {expired ? "Expirée" : "En attente"}
                      </span>
                      {expired && inv.slug && (
                        <button
                          onClick={() => handleResend(inv)}
                          disabled={isResending}
                          title="Renouveler l'invitation expirée"
                          style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 7, border: "1px solid #fca5a5", background: "#fff5f5", color: "#b91c1c", fontWeight: 600, fontSize: 12, cursor: "pointer", opacity: isResending ? 0.6 : 1 }}
                        >
                          <RefreshCw size={11} />
                          {isResending ? "Envoi…" : "Renouveler"}
                        </button>
                      )}
                    </div>
                  </div>

                  {resendResult && (
                    <div style={{ marginTop: 10 }}>
                      {resendResult.emailEnvoye ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#15803d", fontSize: 12, fontWeight: 600 }}>
                          <CheckCircle size={13} /> Email renvoyé avec succès
                        </div>
                      ) : resendResult.token ? (
                        <div>
                          <div style={{ fontSize: 12, color: "#b45309", fontWeight: 600, marginBottom: 6 }}>Email non envoyé — copiez ce lien :</div>
                          <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 7, padding: "8px 12px", fontFamily: "monospace", fontSize: 11, wordBreak: "break-all", color: "#1e3a8a" }}>
                            {inviteLink(resendResult.token)}
                          </div>
                          <CopyButton text={inviteLink(resendResult.token)} />
                        </div>
                      ) : (
                        <div style={{ color: "#b91c1c", fontSize: 12 }}>Erreur lors du renvoi</div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 14px", paddingBottom: 8, borderBottom: "1px solid #f1f5f9" }}>
        {title}
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>{children}</div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
        {label}
        {hint && <span style={{ fontWeight: 400, color: "#94a3b8", marginLeft: 6 }}>— {hint}</span>}
      </label>
      {children}
    </div>
  );
}

const card: React.CSSProperties = {
  background: "white", borderRadius: 16, padding: "1.75rem 2rem", width: "100%",
  boxShadow: "0 2px 16px rgba(0,0,0,0.07)", border: "1px solid #e2e8f0",
};

const input: React.CSSProperties = {
  width: "100%", padding: "10px 13px", borderRadius: 8,
  border: "1.5px solid #e2e8f0", fontSize: 14, boxSizing: "border-box",
  outline: "none", transition: "border-color 0.15s",
};

const btn: React.CSSProperties = {
  padding: "12px 0", background: "#1e3a8a", color: "white", border: "none",
  borderRadius: 10, fontWeight: 700, fontSize: 14.5, cursor: "pointer", width: "100%",
};

const btnOutline: React.CSSProperties = {
  padding: "10px 22px", background: "white", color: "#1e3a8a",
  border: "1.5px solid #1e3a8a", borderRadius: 10, fontWeight: 600, fontSize: 14, cursor: "pointer",
};
