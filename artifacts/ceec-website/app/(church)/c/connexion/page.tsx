"use client";

import { useSignIn, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useEglise } from "@/lib/church-context";
import { ArrowLeft } from "lucide-react";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}

type Step = "password" | "mfa_email" | "mfa_phone";

export default function ChurchConnexionPage() {
  const { signIn, fetchStatus } = useSignIn();
  const clerk = useClerk();
  const { eglise } = useEglise();
  const router = useRouter();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode]         = useState("");
  const [step, setStep]         = useState<Step>("password");
  const [errorMsg, setErrorMsg] = useState("");
  const [infoMsg, setInfoMsg]   = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isBusy = submitting || fetchStatus === "fetching";
  const egliseName = eglise?.nom ?? "votre espace";

  // ── Google OAuth ──────────────────────────────────────────────────────────
  async function handleGoogleSignIn() {
    if (!clerk.client) { setErrorMsg("Service non disponible. Rechargez la page."); return; }
    setErrorMsg(""); setInfoMsg("");
    setSubmitting(true);
    try {
      if (eglise?.slug) {
        try { sessionStorage.setItem("ceec_church_slug", eglise.slug); } catch {}
      }
      await clerk.client.signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/c/oauth-callback",
        redirectUrlComplete: "/c/oauth-callback",
      });
    } catch (err: unknown) {
      setErrorMsg((err as Error)?.message ?? "Erreur lors de la connexion Google.");
      setSubmitting(false);
    }
  }

  async function finalizeAndRedirect() {
    if (!signIn) return;
    const { error } = await signIn.finalize();
    if (error) { setErrorMsg(error.message || "Erreur lors de la finalisation."); return; }
    router.push("/c");
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(""); setInfoMsg("");

    if (!signIn) {
      setErrorMsg("Authentification non disponible. Rechargez la page.");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await signIn.password({ emailAddress: email, password });
      if (error) { setErrorMsg(error.message || "Identifiants incorrects."); return; }

      if (signIn.status === "complete") {
        await finalizeAndRedirect();
        return;
      }

      if (signIn.status === "needs_second_factor") {
        const { error: mfaErr } = await signIn.mfa.sendEmailCode();
        if (!mfaErr) {
          setInfoMsg("Un code de vérification a été envoyé à votre adresse e-mail.");
          setStep("mfa_email");
        } else {
          const { error: phoneErr } = await signIn.mfa.sendPhoneCode();
          if (!phoneErr) {
            setInfoMsg("Un code de vérification a été envoyé par SMS.");
            setStep("mfa_phone");
          } else {
            setErrorMsg("Impossible d'envoyer le code de vérification.");
          }
        }
        return;
      }

      setErrorMsg("Statut inattendu : " + (signIn.status ?? "inconnu"));
    } catch (err: unknown) {
      setErrorMsg((err as Error)?.message ?? "Une erreur inattendue est survenue.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleMfaSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    if (!signIn) { setErrorMsg("Session expirée. Rechargez la page."); return; }

    setSubmitting(true);
    try {
      const { error } =
        step === "mfa_email"
          ? await signIn.mfa.verifyEmailCode({ code })
          : await signIn.mfa.verifyPhoneCode({ code });

      if (error) { setErrorMsg(error.message || "Code incorrect ou expiré."); return; }

      if (signIn.status === "complete") {
        await finalizeAndRedirect();
      } else {
        setErrorMsg("Vérification incomplète.");
      }
    } catch (err: unknown) {
      setErrorMsg((err as Error)?.message ?? "Une erreur inattendue est survenue.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <h2 style={s.heading}>Connexion</h2>
      <p style={s.subtext}>Accédez à votre espace — {egliseName}</p>

      {infoMsg && <div style={s.info}>{infoMsg}</div>}
      {errorMsg && <div style={s.error}>{errorMsg}</div>}

      {/* ── Bouton Google (uniquement sur l'étape mot de passe) ── */}
      {step === "password" && (
        <>
          <button
            type="button"
            style={{ ...s.googleBtn, opacity: isBusy ? 0.7 : 1 }}
            disabled={isBusy || !signIn}
            onClick={handleGoogleSignIn}
          >
            <GoogleIcon />
            Continuer avec Google
          </button>
          <div style={s.orDivider}>
            <span style={s.orLine} />
            <span style={s.orText}>ou</span>
            <span style={s.orLine} />
          </div>
        </>
      )}

      {/* ── Mot de passe ── */}
      {step === "password" && (
        <form onSubmit={handlePasswordSubmit} style={s.form}>
          <label style={s.label}>Adresse e-mail</label>
          <input
            style={s.input} type="email" autoComplete="email" required
            placeholder="vous@exemple.com" value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label style={{ ...s.label, marginTop: 14 }}>Mot de passe</label>
          <input
            style={s.input} type="password" autoComplete="current-password" required
            placeholder="••••••••" value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit" style={s.btn}
            disabled={isBusy || !signIn || !email || !password}>
            {isBusy ? "Connexion…" : "Se connecter"}
          </button>
        </form>
      )}

      {/* ── Code MFA ── */}
      {(step === "mfa_email" || step === "mfa_phone") && (
        <form onSubmit={handleMfaSubmit} style={s.form}>
          <label style={s.label}>
            {step === "mfa_email" ? "Code reçu par e-mail" : "Code reçu par SMS"}
          </label>
          <input
            style={{ ...s.input, textAlign: "center", letterSpacing: "0.25em", fontSize: 20 }}
            type="text" inputMode="numeric" autoComplete="one-time-code"
            placeholder="000000" maxLength={8} required value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          />
          <button type="submit" style={s.btn} disabled={isBusy || !code}>
            {isBusy ? "Vérification…" : "Vérifier le code"}
          </button>
          <button type="button" style={s.outlineBtn}
            onClick={() => { setStep("password"); setErrorMsg(""); setInfoMsg(""); setCode(""); }}>
            <ArrowLeft size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} /> Retour
          </button>
        </form>
      )}

      <hr style={s.divider} />
      <p style={s.dividerText}>Pas encore de compte ?</p>
      <a href="/c/inscription" style={s.linkBtn}>Créer un compte</a>
    </Card>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: "white", borderRadius: 16, padding: "2rem",
      width: "100%", maxWidth: 400, boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
    }}>
      {children}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  heading:    { margin: "0 0 4px", fontSize: 21, fontWeight: 800, color: "#1e3a8a" },
  subtext:    { margin: "0 0 20px", fontSize: 13, color: "#64748b" },
  form:       { display: "flex", flexDirection: "column", gap: 6 },
  label:      { fontSize: 13, fontWeight: 600, color: "#374151" },
  input:      { padding: "10px 14px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 15, outline: "none", width: "100%", boxSizing: "border-box" },
  btn:        { marginTop: 18, padding: "12px 0", borderRadius: 8, border: "none", background: "#1e3a8a", color: "white", fontWeight: 700, fontSize: 15, cursor: "pointer", width: "100%" },
  outlineBtn: { marginTop: 10, padding: "10px 0", borderRadius: 8, border: "1.5px solid #e2e8f0", background: "white", color: "#1e3a8a", fontWeight: 600, fontSize: 14, cursor: "pointer", width: "100%" },
  divider:    { border: "none", borderTop: "1px solid #f1f5f9", margin: "20px 0 14px" },
  dividerText:{ margin: "0 0 10px", textAlign: "center", fontSize: 13, color: "#94a3b8" },
  linkBtn:    { display: "block", textAlign: "center", padding: "11px 0", borderRadius: 8, border: "1.5px solid #1e3a8a", color: "#1e3a8a", fontWeight: 700, fontSize: 14, textDecoration: "none" },
  info:       { background: "#eff6ff", border: "1px solid #bfdbfe", color: "#1e40af", borderRadius: 8, padding: "10px 14px", fontSize: 13, marginBottom: 12 },
  error:      { background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", borderRadius: 8, padding: "10px 14px", fontSize: 13, marginBottom: 12 },
  googleBtn:  { display: "flex", alignItems: "center", justifyContent: "center", gap: 10, width: "100%", padding: "11px 0", borderRadius: 8, border: "1.5px solid #e2e8f0", background: "white", color: "#374151", fontWeight: 600, fontSize: 14, cursor: "pointer" },
  orDivider:  { display: "flex", alignItems: "center", gap: 10, margin: "14px 0 2px" },
  orLine:     { flex: 1, height: 1, background: "#e2e8f0" },
  orText:     { fontSize: 12, color: "#94a3b8", fontWeight: 500 },
};
