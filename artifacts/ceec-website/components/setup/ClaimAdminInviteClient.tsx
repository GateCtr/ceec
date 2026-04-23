"use client";

import { useState } from "react";
import { Shield, CheckCircle, AlertCircle, Loader2, LogIn, UserPlus } from "lucide-react";
import Link from "next/link";

interface Props {
  token: string;
  email: string;
  roleLabel: string;
  roleNom: string;
  error: string | null;
  isLoggedIn: boolean;
}

export default function ClaimAdminInviteClient({
  token,
  email,
  roleLabel,
  roleNom,
  error,
  isLoggedIn,
}: Props) {
  const [loading, setLoading]         = useState(false);
  const [claimError, setClaimError]   = useState("");
  const [done, setDone]               = useState(false);
  const [showAuth, setShowAuth]       = useState(false);

  const roleColor =
    roleNom === "admin_plateforme"
      ? { bg: "#eff6ff", border: "#bfdbfe", text: "#1e40af" }
      : { bg: "#f0fdf4", border: "#bbf7d0", text: "#15803d" };

  async function handleAccept() {
    if (!isLoggedIn) {
      setShowAuth(true);
      return;
    }
    setLoading(true);
    setClaimError("");
    try {
      const res = await fetch(`/api/setup/admin-invite/${token}/finalize`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) { setClaimError(data.error ?? "Une erreur est survenue."); return; }
      setDone(true);
      // Hard redirect : force un rechargement complet pour que le serveur
      // lise la session Clerk + les nouveaux rôles DB sans cache Next.js.
      setTimeout(() => { window.location.href = data.redirectUrl ?? "/admin"; }, 1800);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #1e3a8a 0%, #1e2d6b 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "2rem 1rem",
    }}>
      <div style={{
        background: "white", borderRadius: 20,
        boxShadow: "0 24px 60px rgba(0,0,0,0.2)",
        maxWidth: 480, width: "100%", overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{
          background: "linear-gradient(135deg, #1e3a8a, #1e2d6b)",
          padding: "28px 32px", textAlign: "center",
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: "50%",
            background: "rgba(197,155,46,0.2)", border: "2px solid rgba(197,155,46,0.5)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 14px",
          }}>
            <Shield size={26} color="#fcd34d" />
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#fcd34d", marginBottom: 8 }}>
            CEEC — Plateforme
          </div>
          <h1 style={{ color: "white", margin: 0, fontSize: 20, fontWeight: 800 }}>
            Invitation Administration
          </h1>
        </div>

        <div style={{ padding: "32px" }}>
          {/* ── Lien invalide / expiré ── */}
          {error ? (
            <div style={{ textAlign: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 12, padding: "14px 18px", marginBottom: 24, color: "#b91c1c", fontSize: 14 }}>
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                {error}
              </div>
              <Link href="/" style={{ display: "inline-block", padding: "10px 24px", background: "#1e3a8a", color: "white", borderRadius: 9, fontWeight: 600, fontSize: 14, textDecoration: "none" }}>
                Retour à l&apos;accueil
              </Link>
            </div>

          ) : done ? (
            /* ── Succès ── */
            <div style={{ textAlign: "center" }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#f0fdf4", border: "2px solid #bbf7d0", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
                <CheckCircle size={32} color="#16a34a" />
              </div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", margin: "0 0 8px" }}>Invitation acceptée !</h2>
              <p style={{ color: "#64748b", fontSize: 14, margin: "0 0 4px" }}>
                Votre rôle <strong>{roleLabel}</strong> est maintenant actif.
              </p>
              <p style={{ color: "#94a3b8", fontSize: 13 }}>Redirection vers l&apos;administration…</p>
            </div>

          ) : (
            /* ── Invitation ── */
            <>
              <p style={{ color: "#374151", fontSize: 15, lineHeight: 1.7, margin: "0 0 20px" }}>
                Vous avez été invité(e) à rejoindre l&apos;équipe d&apos;administration de la plateforme CEEC.
              </p>

              {/* Rôle */}
              <div style={{ background: roleColor.bg, border: `1px solid ${roleColor.border}`, borderRadius: 12, padding: "14px 18px", marginBottom: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: roleColor.text, marginBottom: 4 }}>
                  Rôle assigné
                </div>
                <div style={{ fontSize: 15, fontWeight: 800, color: roleColor.text }}>{roleLabel}</div>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
                  {roleNom === "admin_plateforme"
                    ? "Accès complet à l'administration : églises, membres, contenu, invitations."
                    : "Accès limité : modération du contenu et journal d'activité uniquement."}
                </div>
              </div>

              {/* Email ciblé */}
              <div style={{ background: "#f8fafc", borderRadius: 10, padding: "10px 14px", marginBottom: 24, fontSize: 13, color: "#64748b" }}>
                Destiné à : <strong style={{ color: "#334155" }}>{email}</strong>
              </div>

              {/* Erreur d'acceptation */}
              {claimError && (
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10, background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 10, padding: "12px 16px", marginBottom: 18, color: "#b91c1c", fontSize: 13 }}>
                  <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
                  {claimError}
                </div>
              )}

              {/* ── Bouton principal ── */}
              {!showAuth && (
                <button
                  onClick={handleAccept}
                  disabled={loading}
                  style={{
                    width: "100%", padding: "13px",
                    background: loading ? "#94a3b8" : "#1e3a8a",
                    color: "white", border: "none", borderRadius: 10,
                    fontWeight: 700, fontSize: 15,
                    cursor: loading ? "not-allowed" : "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  }}
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
                      Activation en cours…
                    </>
                  ) : (
                    <>
                      <Shield size={18} />
                      Accepter l&apos;invitation
                    </>
                  )}
                </button>
              )}

              {/* ── Options auth (non connecté, après clic) ── */}
              {showAuth && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <p style={{ margin: "0 0 4px", fontSize: 13.5, color: "#374151", fontWeight: 600, textAlign: "center" }}>
                    Pour accepter, connectez-vous ou créez un compte
                  </p>
                  <Link
                    href={`/sign-in?redirect_url=/setup/admin-invite/${token}`}
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 9, padding: "13px", background: "#1e3a8a", color: "white", borderRadius: 10, fontWeight: 700, fontSize: 15, textDecoration: "none" }}
                  >
                    <LogIn size={18} />
                    Se connecter
                  </Link>
                  <Link
                    href={`/setup/admin-invite/${token}/signup`}
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 9, padding: "12px", background: "white", color: "#1e3a8a", border: "1.5px solid #bfdbfe", borderRadius: 10, fontWeight: 600, fontSize: 15, textDecoration: "none" }}
                  >
                    <UserPlus size={18} />
                    Créer un compte
                  </Link>
                  <button
                    onClick={() => setShowAuth(false)}
                    style={{ background: "none", border: "none", color: "#94a3b8", fontSize: 13, cursor: "pointer", marginTop: 2 }}
                  >
                    ← Retour
                  </button>
                </div>
              )}

              {!showAuth && (
                <p style={{ textAlign: "center", fontSize: 12, color: "#94a3b8", marginTop: 16, marginBottom: 0 }}>
                  En acceptant, vous rejoignez l&apos;équipe d&apos;administration CEEC.
                </p>
              )}
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
