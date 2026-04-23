"use client";

import React, { useEffect, useState } from "react";
import { useSignUp, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";

type InviteData = {
  email: string;
  eglise: {
    id: number;
    nom: string;
    slug: string | null;
    ville: string;
    statut: string;
  } | null;
};

type Step = "loading" | "error" | "account" | "verify" | "confirm" | "done";

export default function SetupPage({ params }: { params: Promise<{ token: string }> }) {
  const [token, setToken] = useState<string>("");
  const [invite, setInvite] = useState<InviteData | null>(null);
  const [step, setStep] = useState<Step>("loading");
  const [inviteError, setInviteError] = useState("");

  const { signUp, errors, fetchStatus } = useSignUp();
  const { setActive } = useClerk();
  const router = useRouter();

  const isLoading = fetchStatus === "fetching";

  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [apiError, setApiError] = useState("");
  const [finalizing, setFinalizing] = useState(false);

  const [usedSlug, setUsedSlug] = useState<string | null>(null);
  const [usedEgliseNom, setUsedEgliseNom] = useState<string | null>(null);

  useEffect(() => {
    params.then(({ token: t }) => {
      setToken(t);
      fetch(`/api/setup/${t}`)
        .then((r) => r.json().then((data) => ({ status: r.status, data })))
        .then(({ status, data }) => {
          if (status === 410 && data.slug) {
            setUsedSlug(data.slug);
            setUsedEgliseNom(data.egliseNom ?? null);
            setStep("error");
          } else if (data.error) {
            setInviteError(data.error);
            setStep("error");
          } else {
            setInvite(data);
            setStep("account");
          }
        })
        .catch(() => {
          setInviteError("Impossible de vérifier ce lien. Veuillez réessayer.");
          setStep("error");
        });
    });
  }, [params]);

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUp || !invite) return;
    setApiError("");

    const { error } = await signUp.password({
      emailAddress: invite.email,
      password,
      firstName: prenom,
      lastName: nom,
    });
    if (error) {
      setApiError(error.message || "Erreur lors de la création du compte.");
      return;
    }

    const { error: codeErr } = await signUp.verifications.sendEmailCode();
    if (codeErr) {
      setApiError(codeErr.message || "Impossible d'envoyer le code de vérification.");
      return;
    }

    setStep("verify");
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUp) return;
    setApiError("");

    const { error: verifyErr } = await signUp.verifications.verifyEmailCode({ code });
    if (verifyErr) {
      setApiError(verifyErr.message || "Code incorrect ou expiré. Veuillez réessayer.");
      return;
    }

    if (signUp.status !== "complete") {
      setApiError("Vérification incomplète. Veuillez réessayer.");
      return;
    }

    setStep("confirm");
  };

  const handleFinalize = async () => {
    if (!signUp) return;
    setFinalizing(true);
    setApiError("");

    try {
      // Active la session Clerk (le signup est déjà "complete" depuis l'étape de vérification)
      if (signUp.createdSessionId) {
        await setActive({ session: signUp.createdSessionId });
      }

      // Assigne les rôles via l'API (utilise la session active)
      const res = await fetch(`/api/setup/${token}/finalize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();

      if (!res.ok) {
        // Si le lien a déjà été utilisé mais qu'on a bien le slug, c'est que
        // la session a été créée avec succès — on redirige quand même vers la gestion
        if (res.status === 410 && data.slug) {
          setStep("done");
          setTimeout(() => {
            const target = data.redirectUrl ?? `/gestion?eglise=${data.slug}`;
            if (target.startsWith("http")) window.location.href = target;
            else router.push(target);
          }, 2500);
          return;
        }
        setApiError(data.error ?? "Erreur lors de la finalisation");
        return;
      }

      setStep("done");
      setTimeout(() => {
        const target = data.redirectUrl ?? (data.slug ? `/gestion?eglise=${data.slug}` : "/auth/redirect");
        if (target.startsWith("http")) {
          window.location.href = target;
        } else {
          router.push(target);
        }
      }, 2500);
    } catch {
      setApiError("Erreur réseau. Veuillez réessayer.");
    } finally {
      setFinalizing(false);
    }
  };

  if (step === "loading") {
    return (
      <Center>
        <div style={{ textAlign: "center", color: "#64748b" }}>
          <div style={{ fontSize: 36, marginBottom: 16 }}>⏳</div>
          <p>Vérification du lien d&apos;invitation…</p>
        </div>
      </Center>
    );
  }

  if (step === "error") {
    if (usedSlug) {
      return (
        <Center>
          <Card>
            <div style={{ textAlign: "center" }}>
              <div style={{ width: 72, height: 72, background: "#dcfce7", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, margin: "0 auto 20px" }}>✓</div>
              <h2 style={{ color: "#1e3a8a", margin: "0 0 12px" }}>Espace déjà configuré</h2>
              <p style={{ color: "#64748b", lineHeight: 1.6 }}>
                {usedEgliseNom ? (
                  <>L&apos;espace de <strong>{usedEgliseNom}</strong> a déjà été configuré.</>
                ) : (
                  <>Cet espace a déjà été configuré.</>
                )}
              </p>
              <Link
                href={`/gestion?eglise=${usedSlug}`}
                style={{ display: "inline-block", marginTop: 20, background: "#1e3a8a", color: "white", fontWeight: 700, textDecoration: "none", padding: "12px 28px", borderRadius: 10 }}
              >
                Accéder à la gestion <ChevronRight size={14} style={{ display: "inline", verticalAlign: "middle" }} />
              </Link>
            </div>
          </Card>
        </Center>
      );
    }
    return (
      <Center>
        <Card>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>❌</div>
            <h2 style={{ color: "#b91c1c", margin: "0 0 12px" }}>Lien invalide</h2>
            <p style={{ color: "#64748b", lineHeight: 1.6 }}>{inviteError}</p>
            <p style={{ color: "#94a3b8", fontSize: 13 }}>
              Contactez votre administrateur pour obtenir un nouveau lien d&apos;invitation.
            </p>
            <Link href="/" style={{ display: "inline-block", marginTop: 20, color: "#1e3a8a", fontWeight: 700, textDecoration: "none" }}>
              <ArrowLeft size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} /> Retour à l&apos;accueil
            </Link>
          </div>
        </Card>
      </Center>
    );
  }

  if (step === "done") {
    return (
      <Center>
        <Card>
          <div style={{ textAlign: "center" }}>
            <div style={{ width: 72, height: 72, background: "#dcfce7", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, margin: "0 auto 20px" }}>✓</div>
            <h2 style={{ color: "#1e3a8a", margin: "0 0 12px" }}>Espace créé avec succès !</h2>
            <p style={{ color: "#64748b" }}>
              L&apos;espace de <strong>{invite?.eglise?.nom}</strong> est prêt.
              <br />Redirection en cours…
            </p>
          </div>
        </Card>
      </Center>
    );
  }

  return (
    <Center>
      <div style={{ width: "100%", maxWidth: 480 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ display: "inline-block", background: "#1e3a8a", color: "white", borderRadius: 12, padding: "8px 20px", fontWeight: 800, fontSize: 15, letterSpacing: 1 }}>
            CEEC
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: "#1e3a8a", margin: "12px 0 4px" }}>
            Configuration de votre espace
          </h1>
          {invite?.eglise && (
            <p style={{ color: "#64748b", fontSize: 14, margin: 0 }}>
              {invite.eglise.nom} — {invite.eglise.ville}
            </p>
          )}
        </div>

        <StepIndicator current={step === "account" ? 1 : step === "verify" ? 2 : 3} />

        <Card>
          {step === "account" && (
            <>
              <h2 style={heading}>Créer votre compte</h2>
              <p style={subtext}>Vous serez l&apos;administrateur de l&apos;église.</p>

              {apiError && <ErrorBox>{apiError}</ErrorBox>}

              <form onSubmit={handleCreateAccount} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "flex", gap: 10 }}>
                  <FieldWrap label="Prénom *" error={errors?.fields?.firstName?.message}>
                    <input style={inp} type="text" value={prenom} onChange={(e) => setPrenom(e.target.value)} placeholder="Jean" required autoFocus />
                  </FieldWrap>
                  <FieldWrap label="Nom *" error={errors?.fields?.lastName?.message}>
                    <input style={inp} type="text" value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Dupont" required />
                  </FieldWrap>
                </div>

                <FieldWrap label="Adresse e-mail">
                  <input style={{ ...inp, background: "#f8fafc", color: "#64748b" }} type="email" value={invite?.email ?? ""} readOnly />
                  <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 3 }}>Défini par l&apos;invitation</div>
                </FieldWrap>

                <FieldWrap label="Mot de passe *" error={errors?.fields?.password?.message}>
                  <input style={inp} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimum 8 caractères" required minLength={8} />
                </FieldWrap>

                {errors?.fields?.emailAddress && <ErrorBox>{errors.fields.emailAddress.message}</ErrorBox>}

                <button type="submit" style={submitBtn} disabled={isLoading || !prenom || !nom || !password}>
                  {isLoading ? "Création…" : <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>Continuer <ChevronRight size={14} /></span>}
                </button>
              </form>
            </>
          )}

          {step === "verify" && (
            <>
              <h2 style={heading}>Vérifiez votre e-mail</h2>
              <p style={subtext}>
                Un code de vérification a été envoyé à <strong style={{ color: "#1e3a8a" }}>{invite?.email}</strong>.
              </p>

              {apiError && <ErrorBox>{apiError}</ErrorBox>}

              <form onSubmit={handleVerifyCode} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <FieldWrap label="Code de vérification" error={errors?.fields?.code?.message}>
                  <input
                    style={{ ...inp, textAlign: "center", letterSpacing: 6, fontSize: 20, fontWeight: 700 }}
                    type="text"
                    inputMode="numeric"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="123456"
                    autoFocus
                    required
                  />
                </FieldWrap>

                <button type="submit" style={submitBtn} disabled={isLoading || code.length < 6}>
                  {isLoading ? "Vérification…" : <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>Confirmer <ChevronRight size={14} /></span>}
                </button>
                <button
                  type="button"
                  style={outlineBtn}
                  onClick={() => signUp?.verifications.sendEmailCode()}
                >
                  Renvoyer le code
                </button>
              </form>
            </>
          )}

          {step === "confirm" && invite?.eglise && (
            <>
              <h2 style={heading}>Confirmer la création</h2>
              <p style={subtext}>Voici les informations de votre espace d&apos;église.</p>

              {apiError && <ErrorBox>{apiError}</ErrorBox>}

              <div style={{ background: "#f8fafc", borderRadius: 10, padding: "16px 20px", marginBottom: 20, border: "1px solid #e2e8f0" }}>
                <Row label="Nom de l'église" value={invite.eglise.nom} />
                <Row label="Ville" value={invite.eglise.ville} />
                {invite.eglise.slug && <Row label="Identifiant URL" value={invite.eglise.slug} />}
                <Row label="Votre rôle" value="Administrateur principal" />
              </div>

              <button style={submitBtn} onClick={handleFinalize} disabled={finalizing}>
                {finalizing ? "Création…" : <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>Créer mon espace <ChevronRight size={14} /></span>}
              </button>
            </>
          )}
        </Card>

        <div id="clerk-captcha" />
      </div>
    </Center>
  );
}

function StepIndicator({ current }: { current: number }) {
  const steps = ["Compte", "Vérification", "Confirmation"];
  return (
    <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
      {steps.map((label, i) => {
        const stepNum = i + 1;
        const done = stepNum < current;
        const active = stepNum === current;
        return (
          <React.Fragment key={label}>
            {i > 0 && (
              <div style={{ flex: 1, height: 2, background: done ? "#1e3a8a" : "#e2e8f0", alignSelf: "center", marginBottom: 18 }} />
            )}
            <div style={{ display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 6 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: done || active ? "#1e3a8a" : "#e2e8f0", color: done || active ? "white" : "#94a3b8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
                {done ? "✓" : stepNum}
              </div>
              <span style={{ fontSize: 11, color: active ? "#1e3a8a" : done ? "#64748b" : "#94a3b8", fontWeight: active ? 700 : 400 }}>
                {label}
              </span>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
      <span style={{ color: "#64748b", fontSize: 13 }}>{label}</span>
      <span style={{ color: "#0f172a", fontSize: 13, fontWeight: 600 }}>{value}</span>
    </div>
  );
}

function Center({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem 1rem" }}>
      {children}
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: "white", borderRadius: 16, padding: "2rem", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", border: "1px solid #e2e8f0" }}>
      {children}
    </div>
  );
}

function FieldWrap({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div style={{ flex: 1 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 5 }}>{label}</label>
      {children}
      {error && <div style={{ color: "#dc2626", fontSize: 12, marginTop: 4 }}>{error}</div>}
    </div>
  );
}

function ErrorBox({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 8, padding: "10px 14px", color: "#b91c1c", fontSize: 13, marginBottom: 12 }}>
      {children}
    </div>
  );
}

const heading: React.CSSProperties = { fontSize: 20, fontWeight: 800, color: "#1e3a8a", margin: "0 0 6px" };
const subtext: React.CSSProperties = { fontSize: 13, color: "#64748b", margin: "0 0 20px" };
const inp: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: 8,
  border: "1.5px solid #e2e8f0",
  fontSize: 14,
  boxSizing: "border-box",
  outline: "none",
};
const submitBtn: React.CSSProperties = {
  padding: "13px 0",
  background: "#1e3a8a",
  color: "white",
  border: "none",
  borderRadius: 10,
  fontWeight: 700,
  fontSize: 15,
  cursor: "pointer",
  width: "100%",
};
const outlineBtn: React.CSSProperties = {
  padding: "11px 0",
  background: "white",
  color: "#1e3a8a",
  border: "1.5px solid #e2e8f0",
  borderRadius: 10,
  fontWeight: 600,
  fontSize: 14,
  cursor: "pointer",
  width: "100%",
};
