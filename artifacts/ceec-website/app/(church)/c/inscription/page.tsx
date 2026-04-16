"use client";

import { useSignUp, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useEglise } from "@/lib/church-context";
import { CheckCircle, ArrowLeft } from "lucide-react";

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

type Step = "form" | "verify" | "done";

export default function ChurchInscriptionPage() {
  const { signUp, fetchStatus } = useSignUp();
  const clerk = useClerk();
  const { eglise } = useEglise();
  const router = useRouter();

  const [prenom, setPrenom]   = useState("");
  const [nom, setNom]         = useState("");
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode]       = useState("");
  const [step, setStep]       = useState<Step>("form");
  const [errorMsg, setErrorMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isBusy = submitting || fetchStatus === "fetching";
  const egliseName = eglise?.nom ?? "cette église";

  // ── Google OAuth ──────────────────────────────────────────────────────────
  async function handleGoogleSignUp() {
    if (!clerk.client) { setErrorMsg("Service non disponible. Rechargez la page."); return; }
    setErrorMsg("");
    setSubmitting(true);
    try {
      if (eglise?.slug) {
        try { sessionStorage.setItem("ceec_church_slug", eglise.slug); } catch {}
      }
      await clerk.client.signUp.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/c/oauth-callback",
        redirectUrlComplete: "/c/oauth-callback",
        unsafeMetadata: eglise?.slug ? { pendingEgliseSlug: eglise.slug } : undefined,
      });
    } catch (err: unknown) {
      setErrorMsg((err as Error)?.message ?? "Erreur lors de la connexion Google.");
      setSubmitting(false);
    }
  }

  // ── Étape 1 : inscription + envoi code e-mail ─────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");

    if (!signUp) {
      setErrorMsg("Service non disponible. Rechargez la page.");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await signUp.password({
        emailAddress: email,
        password,
        firstName: prenom,
        lastName: nom,
      });
      if (error) { setErrorMsg(error.message || "Erreur lors de la création du compte."); return; }

      // Envoie le code de vérification par e-mail
      const { error: codeErr } = await signUp.verifications.sendEmailCode();
      if (codeErr) { setErrorMsg(codeErr.message || "Impossible d'envoyer le code de vérification."); return; }

      setStep("verify");
    } catch (err: unknown) {
      setErrorMsg((err as Error)?.message ?? "Une erreur inattendue est survenue.");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Étape 2 : vérification du code e-mail ─────────────────────────────────
  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");

    if (!signUp) {
      setErrorMsg("Session expirée. Rechargez la page.");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await signUp.verifications.verifyEmailCode({ code });
      if (error) { setErrorMsg(error.message || "Code incorrect ou expiré."); return; }

      if (signUp.status !== "complete") {
        setErrorMsg("Vérification incomplète. Veuillez réessayer.");
        return;
      }

      // Finalise la session Clerk
      const { error: finalErr } = await signUp.finalize();
      if (finalErr) { setErrorMsg(finalErr.message || "Erreur lors de la finalisation."); return; }

      // Enregistre le fidèle dans notre BDD (non-bloquant)
      if (eglise) {
        try {
          await fetch("/api/church/register-fidele", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ egliseId: eglise.id, nom, prenom, email }),
          });
        } catch {
          // Non-bloquant : l'utilisateur est créé dans Clerk, le membre sera
          // aussi créé via le webhook. On continue.
        }
      }

      setStep("done");
      setTimeout(() => router.push("/c"), 2500);
    } catch (err: unknown) {
      setErrorMsg((err as Error)?.message ?? "Une erreur inattendue est survenue.");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Rendu : compte créé ───────────────────────────────────────────────────
  if (step === "done") {
    return (
      <Card maxWidth={440}>
        <div style={{ textAlign: "center", padding: "1rem 0" }}>
          <div style={{ marginBottom: 16, display: "flex", justifyContent: "center" }}><CheckCircle size={48} style={{ color: "#15803d" }} /></div>
          <h2 style={s.heading}>Bienvenue !</h2>
          <p style={{ color: "#64748b", marginTop: 8, lineHeight: 1.6 }}>
            Votre compte a été créé avec succès. Vous êtes maintenant membre de{" "}
            <strong style={{ color: "#1e3a8a" }}>{egliseName}</strong>.
          </p>
          <p style={{ color: "#94a3b8", fontSize: 13, marginTop: 12 }}>
            Redirection en cours…
          </p>
        </div>
      </Card>
    );
  }

  // ── Rendu : vérification du code ─────────────────────────────────────────
  if (step === "verify") {
    return (
      <Card maxWidth={440}>
        <h2 style={s.heading}>Vérifiez votre e-mail</h2>
        <p style={s.subtext}>
          Un code a été envoyé à{" "}
          <strong style={{ color: "#1e3a8a" }}>{email}</strong>
        </p>

        {errorMsg && <div style={s.error}>{errorMsg}</div>}

        <form onSubmit={handleVerify} style={s.form}>
          <label style={s.label}>Code de vérification</label>
          <input
            style={{ ...s.input, textAlign: "center", letterSpacing: "0.25em", fontSize: 20 }}
            type="text" inputMode="numeric" autoComplete="one-time-code"
            placeholder="000000" maxLength={8} required autoFocus value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          />
          <button type="submit" style={s.btn} disabled={isBusy || !code}>
            {isBusy ? "Vérification…" : "Confirmer mon compte"}
          </button>
          <button
            type="button" style={s.outlineBtn} disabled={isBusy}
            onClick={async () => {
              if (!signUp) return;
              setErrorMsg("");
              await signUp.verifications.sendEmailCode();
            }}
          >
            Renvoyer le code
          </button>
          <button
            type="button" style={s.ghostBtn}
            onClick={() => { setStep("form"); setCode(""); setErrorMsg(""); }}
          >
            <ArrowLeft size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} /> Modifier mes informations
          </button>
        </form>
      </Card>
    );
  }

  // ── Rendu : formulaire principal ──────────────────────────────────────────
  return (
    <Card maxWidth={440}>
      <h2 style={s.heading}>Rejoindre {egliseName}</h2>
      <p style={s.subtext}>Créez votre compte pour accéder à l&apos;espace membres</p>

      {errorMsg && <div style={s.error}>{errorMsg}</div>}

      {/* ── Bouton Google ── */}
      <button
        type="button"
        style={{ ...s.googleBtn, opacity: isBusy ? 0.7 : 1 }}
        disabled={isBusy || !signUp}
        onClick={handleGoogleSignUp}
      >
        <GoogleIcon />
        Continuer avec Google
      </button>

      <div style={s.orDivider}>
        <span style={s.orLine} />
        <span style={s.orText}>ou</span>
        <span style={s.orLine} />
      </div>

      <form onSubmit={handleSubmit} style={s.form}>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ flex: 1 }}>
            <label style={s.label}>Prénom</label>
            <input
              style={s.input} type="text" autoComplete="given-name"
              placeholder="Jean" required value={prenom}
              onChange={(e) => setPrenom(e.target.value)}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={s.label}>Nom</label>
            <input
              style={s.input} type="text" autoComplete="family-name"
              placeholder="Dupont" required value={nom}
              onChange={(e) => setNom(e.target.value)}
            />
          </div>
        </div>

        <label style={{ ...s.label, marginTop: 12 }}>Adresse e-mail</label>
        <input
          style={s.input} type="email" autoComplete="email"
          placeholder="vous@exemple.com" required value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label style={{ ...s.label, marginTop: 12 }}>Mot de passe</label>
        <input
          style={s.input} type="password" autoComplete="new-password"
          placeholder="••••••••" required value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit" style={s.btn}
          disabled={isBusy || !signUp || !email || !password || !prenom || !nom}
        >
          {isBusy ? "Création…" : "Créer mon compte"}
        </button>
      </form>

      <hr style={s.divider} />
      <p style={s.dividerText}>Déjà membre ?</p>
      <a href="/c/connexion" style={s.linkBtn}>Se connecter</a>

      <div id="clerk-captcha" />
    </Card>
  );
}

function Card({ children, maxWidth = 400 }: { children: React.ReactNode; maxWidth?: number }) {
  return (
    <div style={{
      background: "white", borderRadius: 16, padding: "2rem",
      width: "100%", maxWidth, boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
    }}>
      {children}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  heading:    { margin: "0 0 4px", fontSize: 21, fontWeight: 800, color: "#1e3a8a" },
  subtext:    { margin: "0 0 20px", fontSize: 13, color: "#64748b" },
  form:       { display: "flex", flexDirection: "column", gap: 6 },
  label:      { fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 3 },
  input:      { padding: "10px 14px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 14, outline: "none", width: "100%", boxSizing: "border-box" },
  btn:        { marginTop: 18, padding: "12px 0", borderRadius: 8, border: "none", background: "#1e3a8a", color: "white", fontWeight: 700, fontSize: 15, cursor: "pointer", width: "100%" },
  outlineBtn: { marginTop: 10, padding: "10px 0", borderRadius: 8, border: "1.5px solid #e2e8f0", background: "white", color: "#1e3a8a", fontWeight: 600, fontSize: 14, cursor: "pointer", width: "100%" },
  ghostBtn:   { marginTop: 6, padding: "8px 0", borderRadius: 8, border: "none", background: "transparent", color: "#94a3b8", fontWeight: 500, fontSize: 13, cursor: "pointer", width: "100%" },
  divider:    { border: "none", borderTop: "1px solid #f1f5f9", margin: "20px 0 14px" },
  dividerText:{ margin: "0 0 10px", textAlign: "center", fontSize: 13, color: "#94a3b8" },
  linkBtn:    { display: "block", textAlign: "center", padding: "11px 0", borderRadius: 8, border: "1.5px solid #1e3a8a", color: "#1e3a8a", fontWeight: 700, fontSize: 14, textDecoration: "none" },
  error:      { background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", borderRadius: 8, padding: "10px 14px", fontSize: 13, marginBottom: 12 },
  googleBtn:  { display: "flex", alignItems: "center", justifyContent: "center", gap: 10, width: "100%", padding: "11px 0", borderRadius: 8, border: "1.5px solid #e2e8f0", background: "white", color: "#374151", fontWeight: 600, fontSize: 14, cursor: "pointer" },
  orDivider:  { display: "flex", alignItems: "center", gap: 10, margin: "16px 0 4px" },
  orLine:     { flex: 1, height: 1, background: "#e2e8f0" },
  orText:     { fontSize: 12, color: "#94a3b8", fontWeight: 500 },
};
