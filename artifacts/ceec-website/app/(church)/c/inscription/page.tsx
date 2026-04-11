"use client";

import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useEglise } from "@/lib/church-context";

type Step = "form" | "verify" | "done";

export default function ChurchInscriptionPage() {
  const { signUp, fetchStatus } = useSignUp();
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
          <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
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
            ← Modifier mes informations
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
};
