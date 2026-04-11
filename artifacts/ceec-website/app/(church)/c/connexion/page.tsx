"use client";

import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useEglise } from "@/lib/church-context";

type Step = "password" | "mfa_email" | "mfa_phone";

export default function ChurchConnexionPage() {
  const { signIn, fetchStatus } = useSignIn();
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
            ← Retour
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
};
