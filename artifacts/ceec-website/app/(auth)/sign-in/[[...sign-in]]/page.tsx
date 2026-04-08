"use client";

import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import React, { useState } from "react";

export default function SignInPage() {
  const { signIn, errors, fetchStatus } = useSignIn();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");

  const isLoading = fetchStatus === "fetching";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await signIn.password({ emailAddress: email, password });
    if (error) return;

    if (signIn.status === "complete") {
      await signIn.finalize({
        navigate: ({ decorateUrl }) => {
          const url = decorateUrl("/auth/redirect");
          if (url.startsWith("http")) {
            window.location.href = url;
          } else {
            router.push(url);
          }
        },
      });
    } else if (signIn.status === "needs_client_trust") {
      await signIn.mfa.sendEmailCode();
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    await signIn.mfa.verifyEmailCode({ code });
    if (signIn.status === "complete") {
      await signIn.finalize({
        navigate: ({ decorateUrl }) => {
          const url = decorateUrl("/auth/redirect");
          if (url.startsWith("http")) {
            window.location.href = url;
          } else {
            router.push(url);
          }
        },
      });
    }
  };

  if (signIn.status === "needs_client_trust") {
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
          />
          {errors?.fields?.code && <Err>{errors.fields.code.message}</Err>}
          <button type="submit" style={s.btn} disabled={isLoading || !code}>
            {isLoading ? "Vérification…" : "Vérifier"}
          </button>
          <button type="button" style={s.outlineBtn} onClick={() => signIn.mfa.sendEmailCode()}>
            Renvoyer le code
          </button>
          <button type="button" style={s.ghostBtn} onClick={() => signIn.reset()}>
            Recommencer
          </button>
        </form>
      </Card>
    );
  }

  return (
    <Card>
      <h2 style={s.heading}>Connexion</h2>
      <p style={s.subtext}>Accédez à votre espace CEEC</p>
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
        {errors?.fields?.identifier && <Err>{errors.fields.identifier.message}</Err>}

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
        {errors?.fields?.password && <Err>{errors.fields.password.message}</Err>}
        {(errors?.fields as any)?.form && <Err>{(errors.fields as any).form.message}</Err>}

        <button type="submit" style={s.btn} disabled={isLoading || !email || !password}>
          {isLoading ? "Connexion…" : "Se connecter"}
        </button>
      </form>

      <hr style={s.divider} />
      <p style={s.dividerText}>Pas encore de compte ?</p>
      <Link href="/sign-up" style={s.linkBtn}>
        Créer un compte
      </Link>
    </Card>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: 16,
        padding: "2rem",
        width: "100%",
        maxWidth: 400,
        boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
      }}
    >
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
  outlineBtn: {
    marginTop: 10,
    padding: "10px 0",
    borderRadius: 8,
    border: "1.5px solid #e2e8f0",
    background: "white",
    color: "#1e3a8a",
    fontWeight: 600,
    fontSize: 14,
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
