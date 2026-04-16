"use client";

import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";

type Step = "password" | "mfa_email" | "mfa_phone";

export default function SignInPage() {
  const { signIn, fetchStatus } = useSignIn();
  const router = useRouter();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode]         = useState("");
  const [step, setStep]         = useState<Step>("password");
  const [errorMsg, setErrorMsg] = useState("");
  const [infoMsg, setInfoMsg]   = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isBusy = submitting || fetchStatus === "fetching";

  // ── Finalise la session et redirige ─────────────────────────────────────
  async function finalizeAndRedirect() {
    if (!signIn) return;
    const { error } = await signIn.finalize();
    if (error) {
      setErrorMsg(error.message || "Erreur lors de la finalisation.");
      return;
    }
    router.push("/auth/redirect");
  }

  // ── Étape 1 : mot de passe ───────────────────────────────────────────────
  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    setInfoMsg("");

    if (!signIn) {
      setErrorMsg("Authentification non disponible. Rechargez la page.");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await signIn.password({ emailAddress: email, password });

      if (error) {
        setErrorMsg(error.message || "Identifiants incorrects.");
        return;
      }

      if (signIn.status === "complete") {
        await finalizeAndRedirect();
        return;
      }

      if (signIn.status === "needs_second_factor") {
        // Essaie l'envoi par e-mail en priorité, sinon par téléphone
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
            setErrorMsg("Impossible d'envoyer le code MFA. Contactez l'administrateur.");
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

  // ── Étape 2 : code MFA ───────────────────────────────────────────────────
  async function handleMfaSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");

    if (!signIn) {
      setErrorMsg("Session expirée. Rechargez la page.");
      return;
    }

    setSubmitting(true);
    try {
      const verify =
        step === "mfa_email"
          ? await signIn.mfa.verifyEmailCode({ code })
          : await signIn.mfa.verifyPhoneCode({ code });

      if (verify.error) {
        setErrorMsg(verify.error.message || "Code incorrect ou expiré.");
        return;
      }

      if (signIn.status === "complete") {
        await finalizeAndRedirect();
      } else {
        setErrorMsg("Vérification incomplète : " + (signIn.status ?? "inconnu"));
      }
    } catch (err: unknown) {
      setErrorMsg((err as Error)?.message ?? "Une erreur inattendue est survenue.");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Rendu ─────────────────────────────────────────────────────────────────
  return (
    <div style={styles.card}>
      {/* En-tête */}
      <div style={styles.header}>
        <h1 style={styles.title}>Se connecter</h1>
        <p style={styles.subtitle}>Accédez à votre espace CEEC</p>
      </div>

      {/* Messages */}
      {infoMsg && <div style={styles.info}>{infoMsg}</div>}
      {errorMsg && <div style={styles.error}>{errorMsg}</div>}

      {/* ── Formulaire mot de passe ── */}
      {step === "password" && (
        <form onSubmit={handlePasswordSubmit} style={styles.form}>
          <label style={styles.label}>Adresse e-mail</label>
          <input
            type="email"
            required
            autoComplete="email"
            placeholder="vous@exemple.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
          />

          <label style={styles.label}>Mot de passe</label>
          <input
            type="password"
            required
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
          />

          <Link href="/forgot-password" style={styles.forgotLink}>
            Mot de passe oublié ?
          </Link>

          <button
            type="submit"
            disabled={isBusy || !signIn}
            style={{
              ...styles.button,
              opacity: isBusy || !signIn ? 0.7 : 1,
              cursor: isBusy || !signIn ? "not-allowed" : "pointer",
            }}
          >
            {isBusy ? "Connexion en cours…" : "Se connecter"}
          </button>
        </form>
      )}

      {/* ── Formulaire MFA ── */}
      {(step === "mfa_email" || step === "mfa_phone") && (
        <form onSubmit={handleMfaSubmit} style={styles.form}>
          <label style={styles.label}>
            {step === "mfa_email"
              ? "Code reçu par e-mail"
              : "Code reçu par SMS"}
          </label>
          <input
            type="text"
            inputMode="numeric"
            required
            autoComplete="one-time-code"
            placeholder="000000"
            maxLength={8}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            style={{ ...styles.input, textAlign: "center", letterSpacing: "0.3em", fontSize: 20 }}
          />

          <button
            type="submit"
            disabled={isBusy}
            style={{
              ...styles.button,
              opacity: isBusy ? 0.7 : 1,
              cursor: isBusy ? "not-allowed" : "pointer",
            }}
          >
            {isBusy ? "Vérification…" : "Vérifier le code"}
          </button>

          <button
            type="button"
            onClick={() => { setStep("password"); setErrorMsg(""); setInfoMsg(""); setCode(""); }}
            style={styles.backButton}
          >
            <ArrowLeft size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} /> Retour
          </button>
        </form>
      )}

      {/* Pied */}
      <p style={styles.footer}>
        Pas encore de compte ?{" "}
        <Link href="/sign-up" style={styles.link}>S&apos;inscrire</Link>
      </p>
    </div>
  );
}

// ── Styles ──────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  card: {
    width: "100%",
    maxWidth: 420,
    background: "#ffffff",
    borderRadius: 16,
    boxShadow: "0 20px 60px rgba(0,0,0,0.30)",
    padding: "36px 32px 28px",
    display: "flex",
    flexDirection: "column",
    gap: 0,
  },
  header: {
    textAlign: "center",
    marginBottom: 24,
  },
  title: {
    margin: 0,
    fontSize: 22,
    fontWeight: 800,
    color: "#1e3a8a",
  },
  subtitle: {
    margin: "6px 0 0",
    fontSize: 13,
    color: "#64748b",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: 600,
    color: "#374151",
    marginBottom: 4,
    marginTop: 12,
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    border: "1.5px solid #d1d5db",
    borderRadius: 8,
    fontSize: 14,
    color: "#111827",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.15s",
  },
  forgotLink: {
    fontSize: 12,
    color: "#1e3a8a",
    textDecoration: "none",
    textAlign: "right",
    marginTop: 4,
    marginBottom: 4,
    display: "block",
  },
  button: {
    marginTop: 16,
    width: "100%",
    padding: "11px 0",
    background: "#1e3a8a",
    color: "#ffffff",
    border: "none",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 700,
    transition: "background 0.15s",
  },
  backButton: {
    marginTop: 8,
    width: "100%",
    padding: "9px 0",
    background: "transparent",
    color: "#6b7280",
    border: "1.5px solid #e5e7eb",
    borderRadius: 8,
    fontSize: 13,
    cursor: "pointer",
  },
  info: {
    background: "#eff6ff",
    border: "1px solid #bfdbfe",
    color: "#1e40af",
    borderRadius: 8,
    padding: "10px 14px",
    fontSize: 13,
    marginBottom: 12,
  },
  error: {
    background: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#dc2626",
    borderRadius: 8,
    padding: "10px 14px",
    fontSize: 13,
    marginBottom: 12,
  },
  footer: {
    textAlign: "center",
    fontSize: 13,
    color: "#6b7280",
    marginTop: 20,
    marginBottom: 0,
  },
  link: {
    color: "#1e3a8a",
    fontWeight: 600,
    textDecoration: "none",
  },
};
