"use client";

import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { useEglise } from "@/lib/church-context";

export default function ChurchInscriptionPage() {
  const { signUp, errors, fetchStatus } = useSignUp();
  const { eglise } = useEglise();
  const router = useRouter();

  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"form" | "verify" | "done">("form");
  const [apiError, setApiError] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  const isLoading = fetchStatus === "fetching";
  const egliseName = eglise?.nom ?? "cette église";

  useEffect(() => {
    if (
      signUp.status === "missing_requirements" &&
      signUp.unverifiedFields.includes("email_address") &&
      signUp.missingFields.length === 0 &&
      step === "form"
    ) {
      setStep("verify");
    }
  }, [signUp.status, signUp.unverifiedFields, signUp.missingFields, step]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    const { error } = await signUp.password({
      emailAddress: email,
      password,
      firstName: prenom,
      lastName: nom,
    });
    if (error) return;
    await signUp.verifications.sendEmailCode();
    setStep("verify");
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    await signUp.verifications.verifyEmailCode({ code });
    if (signUp.status === "complete") {
      await signUp.finalize({
        navigate: async () => {
          if (eglise) {
            setIsRegistering(true);
            try {
              await fetch("/api/church/register-fidele", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  egliseId: eglise.id,
                  nom,
                  prenom,
                  email,
                }),
              });
            } catch {
              // Non-blocking: user is created, role can be assigned later
            } finally {
              setIsRegistering(false);
            }
          }
          setStep("done");
          setTimeout(() => router.push("/c"), 2000);
        },
      });
    }
  };

  if (step === "done") {
    return (
      <div style={s.page}>
        <Card>
          <div style={{ textAlign: "center", padding: "1rem 0" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
            <h2 style={s.heading}>Bienvenue !</h2>
            <p style={{ color: "#64748b", marginTop: 8, lineHeight: 1.6 }}>
              Votre compte a été créé avec succès. Vous êtes maintenant membre de{" "}
              <strong style={{ color: "#1e3a8a" }}>{egliseName}</strong>.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  if (step === "verify") {
    return (
      <div style={s.page}>
        <Card>
          <h2 style={s.heading}>Vérifiez votre e-mail</h2>
          <p style={s.subtext}>
            Un code a été envoyé à{" "}
            <strong style={{ color: "#1e3a8a" }}>{email}</strong>
          </p>
          <form onSubmit={handleVerify} style={s.form}>
            <label style={s.label}>Code de vérification</label>
            <input
              style={s.input}
              type="text"
              inputMode="numeric"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="123456"
              autoFocus
              required
            />
            {errors?.fields?.code && <Err>{errors.fields.code.message}</Err>}
            {apiError && <Err>{apiError}</Err>}
            <button
              type="submit"
              style={s.btn}
              disabled={isLoading || isRegistering || !code}
            >
              {isLoading || isRegistering ? "Vérification…" : "Confirmer mon compte"}
            </button>
            <button
              type="button"
              style={s.outlineBtn}
              onClick={() => signUp.verifications.sendEmailCode()}
            >
              Renvoyer le code
            </button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <Card>
        <h2 style={s.heading}>Rejoindre {egliseName}</h2>
        <p style={s.subtext}>Créez votre compte pour accéder à l&apos;espace membres</p>

        <form onSubmit={handleSubmit} style={s.form}>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1 }}>
              <label style={s.label}>Prénom</label>
              <input
                style={s.input}
                type="text"
                autoComplete="given-name"
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                placeholder="Jean"
                required
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={s.label}>Nom</label>
              <input
                style={s.input}
                type="text"
                autoComplete="family-name"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                placeholder="Dupont"
                required
              />
            </div>
          </div>
          {errors?.fields?.firstName && <Err>{errors.fields.firstName.message}</Err>}
          {errors?.fields?.lastName && <Err>{errors.fields.lastName.message}</Err>}

          <label style={{ ...s.label, marginTop: 12 }}>Adresse e-mail</label>
          <input
            style={s.input}
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="vous@exemple.com"
            required
          />
          {errors?.fields?.emailAddress && <Err>{errors.fields.emailAddress.message}</Err>}

          <label style={{ ...s.label, marginTop: 12 }}>Mot de passe</label>
          <input
            style={s.input}
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
          {errors?.fields?.password && <Err>{errors.fields.password.message}</Err>}
          {(errors?.fields as unknown as Record<string, { message: string }>)?.form && (
            <Err>{(errors.fields as unknown as Record<string, { message: string }>).form.message}</Err>
          )}

          <button
            type="submit"
            style={s.btn}
            disabled={isLoading || !email || !password || !prenom || !nom}
          >
            {isLoading ? "Création…" : "Créer mon compte"}
          </button>
        </form>

        <hr style={s.divider} />
        <p style={s.dividerText}>Déjà membre ?</p>
        <a href="/c/connexion" style={s.linkBtn}>
          Se connecter
        </a>

        <div id="clerk-captcha" />
      </Card>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: "white", borderRadius: 16, padding: "2rem",
      width: "100%", maxWidth: 440,
      boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
      border: "1px solid #e2e8f0",
    }}>
      {children}
    </div>
  );
}

function Err({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      color: "#dc2626", fontSize: 13, marginTop: 4,
      padding: "6px 10px", background: "#fee2e2", borderRadius: 6,
    }}>
      {children}
    </div>
  );
}

const s = {
  page: {
    minHeight: "80vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem 1rem",
    background: "#f8fafc",
  } as React.CSSProperties,
  heading: { margin: "0 0 4px", fontSize: 21, fontWeight: 800, color: "#1e3a8a" } as React.CSSProperties,
  subtext: { margin: "0 0 20px", fontSize: 13, color: "#64748b" } as React.CSSProperties,
  form: { display: "flex", flexDirection: "column" as const, gap: 6 },
  label: { fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 3 } as React.CSSProperties,
  input: {
    padding: "10px 14px", borderRadius: 8, border: "1.5px solid #e2e8f0",
    fontSize: 14, outline: "none", width: "100%", boxSizing: "border-box" as const,
  } as React.CSSProperties,
  btn: {
    marginTop: 18, padding: "12px 0", borderRadius: 8, border: "none",
    background: "#1e3a8a", color: "white", fontWeight: 700, fontSize: 15,
    cursor: "pointer", width: "100%",
  } as React.CSSProperties,
  outlineBtn: {
    marginTop: 10, padding: "10px 0", borderRadius: 8,
    border: "1.5px solid #e2e8f0", background: "white", color: "#1e3a8a",
    fontWeight: 600, fontSize: 14, cursor: "pointer", width: "100%",
  } as React.CSSProperties,
  divider: { border: "none", borderTop: "1px solid #f1f5f9", margin: "20px 0 14px" } as React.CSSProperties,
  dividerText: { margin: "0 0 10px", textAlign: "center" as const, fontSize: 13, color: "#94a3b8" } as React.CSSProperties,
  linkBtn: {
    display: "block", textAlign: "center" as const, padding: "11px 0",
    borderRadius: 8, border: "1.5px solid #1e3a8a", color: "#1e3a8a",
    fontWeight: 700, fontSize: 14, textDecoration: "none",
  } as React.CSSProperties,
};
