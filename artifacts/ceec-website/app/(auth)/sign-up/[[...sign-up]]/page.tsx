"use client";

import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import React, { useState } from "react";

export default function SignUpPage() {
  const { signUp, errors, fetchStatus } = useSignUp();
  const router = useRouter();

  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");

  const isLoading = fetchStatus === "fetching";
  const needsVerification =
    signUp.status === "missing_requirements" &&
    signUp.unverifiedFields.includes("email_address") &&
    signUp.missingFields.length === 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await signUp.password({
      emailAddress: email,
      password,
      firstName: prenom,
      lastName: nom,
    });
    if (error) return;
    await signUp.verifications.sendEmailCode();
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    await signUp.verifications.verifyEmailCode({ code });
    if (signUp.status === "complete") {
      await signUp.finalize({
        navigate: ({ decorateUrl }) => {
          const url = decorateUrl("/dashboard");
          if (url.startsWith("http")) {
            window.location.href = url;
          } else {
            router.push(url);
          }
        },
      });
    }
  };

  if (needsVerification) {
    return (
      <Card>
        <h2 style={s.heading}>Vérifiez votre e-mail</h2>
        <p style={s.subtext}>
          Un code de vérification a été envoyé à{" "}
          <strong style={{ color: "#1e3a8a" }}>{email}</strong>.
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
          <button type="submit" style={s.btn} disabled={isLoading || !code}>
            {isLoading ? "Vérification…" : "Confirmer mon compte"}
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
    );
  }

  return (
    <Card>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <img src="/ceec-emblem.svg" alt="CEEC" width={36} height={36} style={{ mixBlendMode: "multiply" }} />
        <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          Plateforme CEEC
        </div>
      </div>
      <h2 style={s.heading}>Créer un compte</h2>
      <p style={s.subtext}>Accès administrateurs de la communauté</p>
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
        {(errors?.fields as any)?.form && <Err>{(errors.fields as any).form.message}</Err>}

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
      <Link href="/sign-in" style={s.linkBtn}>
        Se connecter
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
        <strong>Vous rejoignez une paroisse ?</strong><br />
        Inscrivez-vous via le portail de votre paroisse :{" "}
        <code style={{ fontSize: 11, background: "#e0e7ff", padding: "1px 6px", borderRadius: 4 }}>
          votre-paroisse.ceec.cd
        </code>
      </div>

      <div id="clerk-captcha" />
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
        maxWidth: 420,
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
  label: { fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 } as React.CSSProperties,
  input: {
    padding: "10px 14px",
    borderRadius: 8,
    border: "1.5px solid #e2e8f0",
    fontSize: 14,
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
