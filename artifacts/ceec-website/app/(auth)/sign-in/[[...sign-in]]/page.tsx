"use client";

import { useSignIn } from "@clerk/nextjs";
import { isClerkAPIResponseError } from "@clerk/nextjs/errors";
import { useRouter } from "next/navigation";
import Link from "next/link";
import React, { useState } from "react";

export default function SignInPage() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"password" | "mfa">("password");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [debug, setDebug] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDebug(`isLoaded=${isLoaded}, signIn=${signIn ? "ok" : "null"}`);
    if (!isLoaded || !signIn) {
      setError("Clerk n'est pas encore chargé. Attendez et réessayez.");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const result = await signIn.create({
        strategy: "password",
        identifier: email,
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/auth/redirect");
      } else if (
        result.status === "needs_second_factor" ||
        result.status === "needs_new_password"
      ) {
        await signIn.prepareFirstFactor({ strategy: "email_code", emailAddressId: result.supportedFirstFactors?.find(f => f.strategy === "email_code")?.emailAddressId ?? "" });
        setStep("mfa");
      } else {
        setError("Connexion incomplète. Veuillez réessayer.");
      }
    } catch (err) {
      if (isClerkAPIResponseError(err)) {
        const msg = err.errors[0]?.longMessage ?? err.errors[0]?.message ?? "Erreur de connexion.";
        setError(msg);
      } else {
        setError("Une erreur inattendue s'est produite.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !signIn) return;

    setError(null);
    setIsLoading(true);

    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "email_code",
        code,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/auth/redirect");
      } else {
        setError("Code invalide ou expiré.");
      }
    } catch (err) {
      if (isClerkAPIResponseError(err)) {
        setError(err.errors[0]?.longMessage ?? err.errors[0]?.message ?? "Code invalide.");
      } else {
        setError("Une erreur inattendue s'est produite.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (step === "mfa") {
    return (
      <Card>
        <h2 style={s.heading}>Vérification requise</h2>
        <p style={s.subtext}>Un code a été envoyé à votre adresse e-mail.</p>
        <form onSubmit={handleVerify} style={s.form}>
          <label style={s.label}>Code de vérification</label>
          <input
            style={s.input}
            type="text"
            inputMode="numeric"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="123456"
            required
            autoFocus
          />
          {error && <Err>{error}</Err>}
          <button type="submit" style={s.btn} disabled={isLoading || !code}>
            {isLoading ? "Vérification…" : "Vérifier"}
          </button>
          <button
            type="button"
            style={s.ghostBtn}
            onClick={() => { setStep("password"); setError(null); setCode(""); }}
          >
            Recommencer
          </button>
        </form>
      </Card>
    );
  }

  return (
    <Card>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <img src="/ceec-emblem.svg" alt="CEEC" width={36} height={36} style={{ mixBlendMode: "multiply" }} />
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Plateforme CEEC
          </div>
        </div>
      </div>
      <h2 style={s.heading}>Connexion</h2>
      <p style={s.subtext}>Espace réservé aux administrateurs de la communauté</p>
      <form onSubmit={handleSubmit} style={s.form}>
        <label style={s.label}>Adresse e-mail</label>
        <input
          style={s.input}
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="vous@exemple.com"
          required
        />

        <label style={{ ...s.label, marginTop: 14 }}>Mot de passe</label>
        <input
          style={s.input}
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
        />

        {error && <Err>{error}</Err>}
        {debug && (
          <div style={{ fontSize: 11, color: "#6b7280", background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 6, padding: "4px 8px", fontFamily: "monospace" }}>
            {debug}
          </div>
        )}

        <button
          type="submit"
          style={{
            ...s.btn,
            opacity: (!isLoaded || isLoading) ? 0.6 : 1,
            cursor: (!isLoaded || isLoading) ? "not-allowed" : "pointer",
          }}
          disabled={!isLoaded || isLoading}
        >
          {isLoading ? "Connexion…" : "Se connecter"}
        </button>
      </form>

      <hr style={s.divider} />
      <p style={s.dividerText}>Pas encore de compte ?</p>
      <Link href="/sign-up" style={s.linkBtn}>
        Créer un compte
      </Link>

      <div style={{
        marginTop: 20,
        padding: "12px 14px",
        borderRadius: 10,
        background: "#f0f4ff",
        border: "1px solid #c7d2fe",
        fontSize: 12,
        color: "#4338ca",
        lineHeight: 1.5,
      }}>
        <strong>Fidèle d&apos;une paroisse ?</strong><br />
        Connectez-vous via le portail de votre paroisse :{" "}
        <code style={{ fontSize: 11, background: "#e0e7ff", padding: "1px 6px", borderRadius: 4 }}>
          votre-paroisse.ceec.cd
        </code>
      </div>
    </Card>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: "white",
      borderRadius: 16,
      padding: "2rem",
      width: "100%",
      maxWidth: 400,
      boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
    }}>
      {children}
    </div>
  );
}

function Err({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ color: "#dc2626", fontSize: 13, marginTop: 4, padding: "6px 10px", background: "#fee2e2", borderRadius: 6 }}>
      {children}
    </div>
  );
}

const s = {
  heading: { margin: "0 0 4px", fontSize: 22, fontWeight: 800, color: "#1e3a8a" } as React.CSSProperties,
  subtext: { margin: "0 0 20px", fontSize: 13, color: "#64748b" } as React.CSSProperties,
  form: { display: "flex", flexDirection: "column" as const, gap: 6 },
  label: { fontSize: 13, fontWeight: 600, color: "#374151" } as React.CSSProperties,
  input: {
    padding: "10px 14px",
    borderRadius: 8,
    border: "1.5px solid #e2e8f0",
    fontSize: 15,
    outline: "none",
    width: "100%",
    boxSizing: "border-box" as const,
  } as React.CSSProperties,
  btn: {
    marginTop: 18,
    padding: "12px 0",
    borderRadius: 8,
    border: "none",
    background: "#1e3a8a",
    color: "white",
    fontWeight: 700,
    fontSize: 15,
    cursor: "pointer",
    width: "100%",
  } as React.CSSProperties,
  ghostBtn: {
    marginTop: 6,
    padding: "8px 0",
    borderRadius: 8,
    border: "none",
    background: "transparent",
    color: "#94a3b8",
    fontWeight: 500,
    fontSize: 13,
    cursor: "pointer",
    width: "100%",
  } as React.CSSProperties,
  divider: { border: "none", borderTop: "1px solid #f1f5f9", margin: "20px 0 14px" } as React.CSSProperties,
  dividerText: { margin: "0 0 10px", textAlign: "center" as const, fontSize: 13, color: "#94a3b8" } as React.CSSProperties,
  linkBtn: {
    display: "block",
    textAlign: "center" as const,
    padding: "11px 0",
    borderRadius: 8,
    border: "1.5px solid #1e3a8a",
    color: "#1e3a8a",
    fontWeight: 700,
    fontSize: 14,
    textDecoration: "none",
  } as React.CSSProperties,
};
