"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle, AlertCircle, Copy, Check, RefreshCw,
  Clock, ArrowLeft, ChevronRight, Building2, Mail,
  MapPin, Link2, User, Send,
} from "lucide-react";

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
        padding: "8px 16px", borderRadius: 8,
        border: "1.5px solid #e2e8f0",
        background: copied ? "#f0fdf4" : "white",
        color: copied ? "#15803d" : "#1e3a8a",
        fontWeight: 600, fontSize: 13, cursor: "pointer",
        marginTop: 10, transition: "all 0.15s",
      }}
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
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
  const [focusedField, setFocusedField] = useState<string | null>(null);

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

  const inputStyle = (field: string): React.CSSProperties => ({
    width: "100%",
    padding: "11px 14px 11px 40px",
    borderRadius: 10,
    border: `1.5px solid ${focusedField === field ? "#1e3a8a" : "#e2e8f0"}`,
    fontSize: 14,
    boxSizing: "border-box",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
    boxShadow: focusedField === field ? "0 0 0 3px rgba(30,58,138,0.08)" : "none",
    background: "white",
    color: "#0f172a",
  });

  const inputNoIconStyle = (field: string): React.CSSProperties => ({
    ...inputStyle(field),
    paddingLeft: 14,
  });

  if (success) {
    const link = inviteLink(success.inviteToken);
    return (
      <>
        <style>{`
          @media (max-width: 600px) {
            .success-actions { flex-direction: column !important; }
            .success-actions button { width: 100% !important; justify-content: center !important; }
          }
        `}</style>
        <div style={{ background: "white", borderRadius: 20, overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", border: "1px solid #e2e8f0" }}>
          <div style={{ background: "linear-gradient(135deg, #1e3a8a, #1e4db7)", padding: "2.5rem 2rem", textAlign: "center" }}>
            <div style={{ width: 72, height: 72, background: "rgba(255,255,255,0.15)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <CheckCircle size={36} style={{ color: "white" }} />
            </div>
            <h2 style={{ color: "white", margin: "0 0 8px", fontSize: 22, fontWeight: 800 }}>Église créée avec succès</h2>
            <p style={{ color: "rgba(255,255,255,0.75)", margin: 0, fontSize: 14 }}>
              <strong style={{ color: "white" }}>{success.eglise.nom}</strong> a été ajoutée à la plateforme CEEC.
            </p>
          </div>

          <div style={{ padding: "2rem" }}>
            {success.emailEnvoye ? (
              <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 12, padding: "16px 20px", marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#15803d", fontSize: 14, fontWeight: 700, marginBottom: 4 }}>
                  <Mail size={16} />
                  Email d&apos;invitation envoyé
                </div>
                <p style={{ margin: 0, color: "#166534", fontSize: 13, lineHeight: 1.6 }}>
                  L&apos;administrateur recevra un lien valable 7 jours pour configurer son espace.
                </p>
              </div>
            ) : (
              <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 12, padding: "16px 20px", marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#b45309", fontSize: 14, fontWeight: 700, marginBottom: 10 }}>
                  <AlertCircle size={16} />
                  Email non envoyé — lien à transmettre manuellement
                </div>
                <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "12px 16px", fontFamily: "monospace", fontSize: 12, wordBreak: "break-all", color: "#1e3a8a", lineHeight: 1.6 }}>
                  {link}
                </div>
                <CopyButton text={link} />
              </div>
            )}

            <div className="success-actions" style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <button
                style={{ padding: "11px 24px", background: "white", color: "#1e3a8a", border: "1.5px solid #1e3a8a", borderRadius: 10, fontWeight: 600, fontSize: 14, cursor: "pointer" }}
                onClick={() => { setSuccess(null); setForm({ nom: "", slug: "", ville: "", emailAdmin: "", sousDomaine: "" }); setSlugEdited(false); }}
              >
                Inviter une autre église
              </button>
              <button
                style={{ padding: "11px 24px", background: "#1e3a8a", color: "white", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 7 }}
                onClick={() => router.push("/admin/eglises")}
              >
                Voir la liste <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`
        .nouvelle-eglise-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        @media (max-width: 640px) {
          .nouvelle-eglise-grid {
            grid-template-columns: 1fr;
          }
          .form-card {
            border-radius: 16px !important;
          }
          .form-header {
            padding: 1.75rem 1.25rem !important;
          }
          .form-body {
            padding: 1.5rem 1.25rem !important;
          }
          .pending-card {
            padding: 1.25rem !important;
          }
        }
      `}</style>

      <div className="form-card" style={{ background: "white", borderRadius: 20, overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", border: "1px solid #e2e8f0" }}>
        <div className="form-header" style={{ background: "linear-gradient(135deg, #1e3a8a, #1e4db7)", padding: "2rem 2rem 1.75rem" }}>
          <Link
            href="/admin/eglises"
            style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 18, transition: "color 0.15s" }}
          >
            <ArrowLeft size={14} /> Retour à la liste
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 48, height: 48, background: "rgba(255,255,255,0.15)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Building2 size={24} style={{ color: "white" }} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "white" }}>Inviter une nouvelle église</h1>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: "rgba(255,255,255,0.7)" }}>
                Un lien valable 7 jours sera envoyé à l&apos;administrateur désigné.
              </p>
            </div>
          </div>
        </div>

        <div className="form-body" style={{ padding: "2rem" }}>
          {error && (
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "12px 16px", marginBottom: 24, color: "#b91c1c", fontSize: 13.5 }}>
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            <div>
              <SectionTitle icon={<Building2 size={15} />} title="Informations de l'église" />
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div className="nouvelle-eglise-grid">
                  <div>
                    <FieldLabel label="Nom de l'église" required />
                    <div style={{ position: "relative" }}>
                      <FieldIcon><Building2 size={15} /></FieldIcon>
                      <input
                        style={inputStyle("nom")}
                        type="text"
                        placeholder="Église Évangélique du Centre"
                        value={form.nom}
                        onChange={(e) => handleNomChange(e.target.value)}
                        onFocus={() => setFocusedField("nom")}
                        onBlur={() => setFocusedField(null)}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <FieldLabel label="Ville" required />
                    <div style={{ position: "relative" }}>
                      <FieldIcon><MapPin size={15} /></FieldIcon>
                      <input
                        style={inputStyle("ville")}
                        type="text"
                        placeholder="Kinshasa"
                        value={form.ville}
                        onChange={(e) => setForm((f) => ({ ...f, ville: e.target.value }))}
                        onFocus={() => setFocusedField("ville")}
                        onBlur={() => setFocusedField(null)}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <FieldLabel label="Identifiant URL (slug)" required hint="Généré automatiquement · modifiable" />
                  <div style={{ position: "relative" }}>
                    <FieldIcon><Link2 size={15} /></FieldIcon>
                    <input
                      style={inputStyle("slug")}
                      type="text"
                      placeholder="eglise-evangelique-centre"
                      value={form.slug}
                      onChange={(e) => { setSlugEdited(true); setForm((f) => ({ ...f, slug: slugify(e.target.value) })); }}
                      onFocus={() => setFocusedField("slug")}
                      onBlur={() => setFocusedField(null)}
                      required
                      pattern="[a-z0-9\-]+"
                    />
                  </div>
                  {form.slug && (
                    <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 6, fontSize: 12, color: "#64748b" }}>
                      <span>URL :</span>
                      <code style={{ background: "#f1f5f9", padding: "2px 8px", borderRadius: 5, color: "#1e3a8a", fontWeight: 600, fontSize: 12 }}>
                        /paroisses/{form.slug}
                      </code>
                    </div>
                  )}
                </div>

                <div>
                  <FieldLabel label="Sous-domaine" hint="optionnel — ex: kinshasa-centre (donne kinshasa-centre.ceec.cd)" />
                  <div style={{ position: "relative" }}>
                    <FieldIcon><Link2 size={15} /></FieldIcon>
                    <input
                      style={inputStyle("sousDomaine")}
                      type="text"
                      placeholder="kinshasa-centre"
                      value={form.sousDomaine}
                      onChange={(e) => setForm((f) => ({ ...f, sousDomaine: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") }))}
                      onFocus={() => setFocusedField("sousDomaine")}
                      onBlur={() => setFocusedField(null)}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 28 }}>
              <SectionTitle icon={<User size={15} />} title="Administrateur principal" />
              <div>
                <FieldLabel label="Adresse email" required hint="Recevra le lien d'invitation" />
                <div style={{ position: "relative" }}>
                  <FieldIcon><Mail size={15} /></FieldIcon>
                  <input
                    style={inputStyle("emailAdmin")}
                    type="email"
                    placeholder="pasteur@eglise.org"
                    value={form.emailAdmin}
                    onChange={(e) => setForm((f) => ({ ...f, emailAdmin: e.target.value }))}
                    onFocus={() => setFocusedField("emailAdmin")}
                    onBlur={() => setFocusedField(null)}
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !form.nom || !form.slug || !form.ville || !form.emailAdmin}
              style={{
                padding: "14px 0",
                background: loading || !form.nom || !form.slug || !form.ville || !form.emailAdmin
                  ? "#94a3b8" : "linear-gradient(135deg, #1e3a8a, #1e4db7)",
                color: "white",
                border: "none",
                borderRadius: 12,
                fontWeight: 700,
                fontSize: 15,
                cursor: loading || !form.nom || !form.slug || !form.ville || !form.emailAdmin ? "not-allowed" : "pointer",
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                transition: "background 0.2s, opacity 0.2s",
                boxShadow: "0 4px 12px rgba(30,58,138,0.2)",
              }}
            >
              {loading ? (
                <>
                  <RefreshCw size={16} style={{ animation: "spin 1s linear infinite" }} />
                  Création en cours…
                </>
              ) : (
                <>
                  <Send size={16} />
                  Envoyer l&apos;invitation
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {pendingInvites.length > 0 && (
        <div className="pending-card" style={{ marginTop: 20, background: "white", borderRadius: 20, padding: "1.75rem 2rem", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", border: "1px solid #e2e8f0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
            <div style={{ width: 34, height: 34, background: "#fef3c7", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Clock size={16} style={{ color: "#b45309" }} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#0f172a" }}>Invitations en attente</h3>
              <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>{pendingInvites.length} invitation{pendingInvites.length > 1 ? "s" : ""} non utilisée{pendingInvites.length > 1 ? "s" : ""}</p>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {pendingInvites.map((inv) => {
              const inv0 = inv.inviteTokens[0];
              const expiresAt = inv0 ? new Date(inv0.expiresAt) : null;
              const expired = expiresAt ? expiresAt < new Date() : false;
              const resendResult = resendResults[inv.id];
              const isResending = resending === inv.id;

              return (
                <div key={inv.id} style={{
                  background: expired ? "#fef2f2" : "#f8fafc",
                  borderRadius: 12,
                  border: `1px solid ${expired ? "#fecaca" : "#e2e8f0"}`,
                  padding: "14px 18px",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontWeight: 700, color: "#0f172a", fontSize: 14, marginBottom: 4 }}>{inv.nom}</div>
                      {inv0 && (
                        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#64748b", flexWrap: "wrap" }}>
                          <Mail size={11} />
                          <span>{inv0.email}</span>
                          <span style={{ color: "#cbd5e1" }}>·</span>
                          <span style={{ color: expired ? "#b91c1c" : "#64748b" }}>
                            {expired ? "Expirée le" : "Expire le"} {expiresAt?.toLocaleDateString("fr-FR")}
                          </span>
                        </div>
                      )}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                      <span style={{
                        padding: "4px 12px", borderRadius: 100, fontSize: 11, fontWeight: 700,
                        background: expired ? "#fee2e2" : "#fef9c3",
                        color: expired ? "#b91c1c" : "#a16207",
                      }}>
                        {expired ? "Expirée" : "En attente"}
                      </span>
                      {expired && inv.slug && (
                        <button
                          onClick={() => handleResend(inv)}
                          disabled={isResending}
                          style={{
                            display: "inline-flex", alignItems: "center", gap: 5,
                            padding: "6px 14px", borderRadius: 8,
                            border: "1.5px solid #fca5a5", background: "white",
                            color: "#b91c1c", fontWeight: 600, fontSize: 12,
                            cursor: isResending ? "not-allowed" : "pointer",
                            opacity: isResending ? 0.6 : 1, transition: "opacity 0.15s",
                          }}
                        >
                          <RefreshCw size={12} style={{ animation: isResending ? "spin 1s linear infinite" : "none" }} />
                          {isResending ? "Envoi…" : "Renouveler"}
                        </button>
                      )}
                    </div>
                  </div>

                  {resendResult && (
                    <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #e2e8f0" }}>
                      {resendResult.emailEnvoye ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 7, color: "#15803d", fontSize: 13, fontWeight: 600 }}>
                          <CheckCircle size={14} /> Email renvoyé avec succès
                        </div>
                      ) : resendResult.token ? (
                        <div>
                          <div style={{ fontSize: 12, color: "#b45309", fontWeight: 600, marginBottom: 8 }}>Email non envoyé — copiez ce lien :</div>
                          <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, padding: "10px 14px", fontFamily: "monospace", fontSize: 12, wordBreak: "break-all", color: "#1e3a8a", lineHeight: 1.6 }}>
                            {inviteLink(resendResult.token)}
                          </div>
                          <CopyButton text={inviteLink(resendResult.token)} />
                        </div>
                      ) : (
                        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#b91c1c", fontSize: 12, fontWeight: 600 }}>
                          <AlertCircle size={13} /> Erreur lors du renvoi
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7, color: "#1e3a8a" }}>
        {icon}
        <span style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: "#64748b" }}>
          {title}
        </span>
      </div>
    </div>
  );
}

function FieldLabel({ label, required, hint }: { label: string; required?: boolean; hint?: string }) {
  return (
    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 7 }}>
      {label}
      {required && <span style={{ color: "#1e3a8a", marginLeft: 3 }}>*</span>}
      {hint && <span style={{ fontWeight: 400, color: "#94a3b8", marginLeft: 6, fontSize: 12 }}>{hint}</span>}
    </label>
  );
}

function FieldIcon({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)",
      color: "#94a3b8", display: "flex", alignItems: "center", pointerEvents: "none",
    }}>
      {children}
    </div>
  );
}
