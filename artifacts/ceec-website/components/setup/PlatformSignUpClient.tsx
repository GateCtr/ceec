"use client";

import React, { useState } from "react";
import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Shield, CheckCircle, AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

interface Props {
  token: string;
  email: string;
  roleLabel: string;
  error: string | null;
}

type Step = "form" | "verify" | "done";

export default function PlatformSignUpClient({ token, email, roleLabel, error }: Props) {
  const { signUp, fetchStatus } = useSignUp();
  const router = useRouter();

  const [prenom, setPrenom]     = useState("");
  const [nom, setNom]           = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode]         = useState("");
  const [step, setStep]         = useState<Step>("form");
  const [errorMsg, setErrorMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isBusy = submitting || fetchStatus === "fetching";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    if (!signUp) { setErrorMsg("Service non disponible. Rechargez la page."); return; }

    setSubmitting(true);
    try {
      const { error: signUpErr } = await signUp.password({
        emailAddress: email,
        password,
        firstName: prenom,
        lastName: nom,
      });
      if (signUpErr) { setErrorMsg(signUpErr.message || "Erreur lors de la création du compte."); return; }

      const { error: codeErr } = await signUp.verifications.sendEmailCode();
      if (codeErr) { setErrorMsg(codeErr.message || "Impossible d'envoyer le code de vérification."); return; }

      setStep("verify");
    } catch (err: unknown) {
      setErrorMsg((err as Error)?.message ?? "Une erreur inattendue est survenue.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    if (!signUp) { setErrorMsg("Session expirée. Rechargez la page."); return; }

    setSubmitting(true);
    try {
      const { error: verifyErr } = await signUp.verifications.verifyEmailCode({ code });
      if (verifyErr) { setErrorMsg(verifyErr.message || "Code incorrect ou expiré."); return; }

      if (signUp.status !== "complete") {
        setErrorMsg("Vérification incomplète. Veuillez réessayer.");
        return;
      }

      const { error: finalErr } = await signUp.finalize();
      if (finalErr) { setErrorMsg(finalErr.message || "Erreur lors de la finalisation."); return; }

      setStep("done");
      setTimeout(() => router.push(`/setup/admin-invite/${token}`), 1800);
    } catch (err: unknown) {
      setErrorMsg((err as Error)?.message ?? "Une erreur inattendue est survenue.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{
      background: "white", borderRadius: 20,
      boxShadow: "0 24px 60px rgba(0,0,0,0.2)",
      maxWidth: 460, width: "100%", overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #1e3a8a, #1e2d6b)",
        padding: "26px 32px", textAlign: "center",
      }}>
        <div style={{
          width: 50, height: 50, borderRadius: "50%",
          background: "rgba(197,155,46,0.2)", border: "2px solid rgba(197,155,46,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 12px",
        }}>
          <Shield size={24} color="#fcd34d" />
        </div>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#fcd34d", marginBottom: 6 }}>
          CEEC — Plateforme
        </div>
        <h1 style={{ color: "white", margin: 0, fontSize: 18, fontWeight: 800 }}>
          {step === "verify" ? "Vérifiez votre e-mail" : step === "done" ? "Compte créé !" : "Créer un compte administrateur"}
        </h1>
      </div>

      <div style={{ padding: "28px 32px" }}>
        {/* Token error */}
        {error ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10, background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 10, padding: "12px 16px", marginBottom: 20, color: "#b91c1c", fontSize: 14 }}>
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
              {error}
            </div>
            <Link href="/" style={{ display: "inline-block", padding: "10px 24px", background: "#1e3a8a", color: "white", borderRadius: 9, fontWeight: 600, fontSize: 14, textDecoration: "none" }}>
              Retour à l&apos;accueil
            </Link>
          </div>
        ) : step === "done" ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ width: 60, height: 60, borderRadius: "50%", background: "#f0fdf4", border: "2px solid #bbf7d0", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <CheckCircle size={30} color="#16a34a" />
            </div>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: "#0f172a", margin: "0 0 8px" }}>Compte créé avec succès !</h2>
            <p style={{ color: "#64748b", fontSize: 13, margin: "0 0 4px" }}>
              Vous allez être redirigé pour accepter l&apos;invitation.
            </p>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, color: "#94a3b8", fontSize: 13, marginTop: 8 }}>
              <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
              Redirection…
            </div>
          </div>
        ) : step === "verify" ? (
          <>
            <p style={{ color: "#374151", fontSize: 14, lineHeight: 1.7, margin: "0 0 6px" }}>
              Un code de vérification a été envoyé à :
            </p>
            <div style={{ background: "#f8fafc", borderRadius: 8, padding: "8px 14px", marginBottom: 20, fontSize: 13, fontWeight: 600, color: "#1e3a8a" }}>
              {email}
            </div>

            {errorMsg && (
              <div style={{ display: "flex", alignItems: "flex-start", gap: 8, background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 8, padding: "10px 14px", marginBottom: 14, color: "#b91c1c", fontSize: 13 }}>
                <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleVerify} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <label style={s.label}>Code de vérification</label>
              <input
                style={{ ...s.input, textAlign: "center", letterSpacing: "0.3em", fontSize: 22, fontWeight: 700 }}
                type="text" inputMode="numeric" autoComplete="one-time-code"
                placeholder="000000" maxLength={8} required autoFocus
                value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              />
              <button type="submit" style={{ ...s.btn, opacity: isBusy || !code ? 0.6 : 1 }} disabled={isBusy || !code}>
                {isBusy ? "Vérification…" : "Confirmer mon compte"}
              </button>
              <button type="button" style={s.outlineBtn} disabled={isBusy}
                onClick={async () => { if (!signUp) return; setErrorMsg(""); await signUp.verifications.sendEmailCode(); }}>
                Renvoyer le code
              </button>
              <button type="button" style={s.ghostBtn}
                onClick={() => { setStep("form"); setCode(""); setErrorMsg(""); }}>
                <ArrowLeft size={13} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} />
                Modifier mes informations
              </button>
            </form>
          </>
        ) : (
          <>
            {/* Role banner */}
            <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10, padding: "10px 14px", marginBottom: 20, fontSize: 13 }}>
              <span style={{ color: "#64748b" }}>Rôle attribué : </span>
              <strong style={{ color: "#1e40af" }}>{roleLabel}</strong>
            </div>

            {errorMsg && (
              <div style={{ display: "flex", alignItems: "flex-start", gap: 8, background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 8, padding: "10px 14px", marginBottom: 14, color: "#b91c1c", fontSize: 13 }}>
                <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <label style={s.label}>Prénom</label>
                  <input style={s.input} type="text" autoComplete="given-name" placeholder="Jean" required value={prenom} onChange={(e) => setPrenom(e.target.value)} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={s.label}>Nom</label>
                  <input style={s.input} type="text" autoComplete="family-name" placeholder="Dupont" required value={nom} onChange={(e) => setNom(e.target.value)} />
                </div>
              </div>

              <label style={{ ...s.label, marginTop: 10 }}>Adresse e-mail</label>
              <div style={{ position: "relative" as const }}>
                <input
                  style={{ ...s.input, background: "#f8fafc", color: "#64748b", cursor: "not-allowed" }}
                  type="email" value={email} readOnly tabIndex={-1}
                />
                <div style={{ position: "absolute" as const, right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>
                  FIXE
                </div>
              </div>
              <p style={{ margin: "3px 0 0", fontSize: 11.5, color: "#94a3b8" }}>
                L&apos;email est imposé par l&apos;invitation et ne peut pas être modifié.
              </p>

              <label style={{ ...s.label, marginTop: 10 }}>Mot de passe</label>
              <input style={s.input} type="password" autoComplete="new-password" placeholder="••••••••" required value={password} onChange={(e) => setPassword(e.target.value)} />

              <button
                type="submit" style={{ ...s.btn, marginTop: 18, opacity: isBusy || !signUp || !email || !password || !prenom || !nom ? 0.65 : 1 }}
                disabled={isBusy || !signUp || !email || !password || !prenom || !nom}
              >
                {isBusy ? "Création du compte…" : "Créer mon compte"}
              </button>
            </form>

            <hr style={{ border: "none", borderTop: "1px solid #f1f5f9", margin: "20px 0 14px" }} />
            <p style={{ textAlign: "center", fontSize: 13, color: "#94a3b8", margin: "0 0 10px" }}>Déjà un compte ?</p>
            <Link
              href={`/sign-in?redirect_url=/setup/admin-invite/${token}`}
              style={{ display: "block", textAlign: "center", padding: "10px 0", borderRadius: 8, border: "1.5px solid #1e3a8a", color: "#1e3a8a", fontWeight: 700, fontSize: 13, textDecoration: "none" }}
            >
              Se connecter
            </Link>

            <div id="clerk-captcha" />
          </>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  label:      { fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 3 },
  input:      { padding: "10px 13px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 14, outline: "none", width: "100%", boxSizing: "border-box" },
  btn:        { padding: "12px 0", borderRadius: 8, border: "none", background: "#1e3a8a", color: "white", fontWeight: 700, fontSize: 14.5, cursor: "pointer", width: "100%" },
  outlineBtn: { marginTop: 8, padding: "10px 0", borderRadius: 8, border: "1.5px solid #e2e8f0", background: "white", color: "#1e3a8a", fontWeight: 600, fontSize: 13, cursor: "pointer", width: "100%" },
  ghostBtn:   { marginTop: 4, padding: "8px 0", borderRadius: 8, border: "none", background: "transparent", color: "#94a3b8", fontWeight: 500, fontSize: 13, cursor: "pointer", width: "100%" },
};
