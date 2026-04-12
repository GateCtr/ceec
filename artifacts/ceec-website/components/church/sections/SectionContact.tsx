"use client";

import { useState } from "react";

type ContactConfig = {
  titre?: string;
  texte?: string;
  bgColor?: string;
};

type ContactData = {
  adresse?: string | null;
  telephone?: string | null;
  email?: string | null;
  ville?: string;
};

type ChampsActifs = {
  telephone?: boolean;
  sujet?: boolean;
};

export default function SectionContact({
  config,
  eglise,
  egliseId,
  contactConfig,
}: {
  config: ContactConfig;
  eglise: ContactData;
  egliseId?: number;
  contactConfig?: { champsActifs?: ChampsActifs; messageConfirmation?: string };
}) {
  const { titre = "Nous contacter", texte, bgColor = "var(--church-primary, #1e3a8a)" } = config;
  const champsActifs: ChampsActifs = contactConfig?.champsActifs ?? { telephone: false, sujet: true };

  const useDark =
    bgColor === "var(--church-primary, #1e3a8a)" ||
    bgColor.startsWith("#1e3") ||
    bgColor.startsWith("#0f1") ||
    bgColor.startsWith("#1e2");

  const textColor = useDark ? "white" : "var(--church-primary, #1e3a8a)";
  const subColor = useDark ? "rgba(255,255,255,0.8)" : "#475569";
  const infoColor = useDark ? "rgba(255,255,255,0.9)" : "#334155";

  const [form, setForm] = useState({ nom: "", email: "", telephone: "", sujet: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [confirmation, setConfirmation] = useState("");

  function updateField(key: keyof typeof form, val: string) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!egliseId) return;
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/church/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          egliseId,
          nom: form.nom,
          email: form.email,
          telephone: champsActifs.telephone ? form.telephone : undefined,
          sujet: champsActifs.sujet ? form.sujet : undefined,
          message: form.message,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error ?? "Une erreur est survenue.");
        setStatus("error");
        return;
      }
      setConfirmation(data.confirmation ?? "Merci pour votre message !");
      setStatus("success");
      setForm({ nom: "", email: "", telephone: "", sujet: "", message: "" });
    } catch {
      setErrorMsg("Impossible d'envoyer le message. Veuillez réessayer.");
      setStatus("error");
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 14px",
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.3)",
    background: useDark ? "rgba(255,255,255,0.12)" : "white",
    color: useDark ? "white" : "#0f172a",
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 12,
    fontWeight: 600,
    marginBottom: 4,
    color: subColor,
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
  };

  return (
    <section style={{ background: bgColor, padding: "4rem 1rem" }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <h2 style={{ fontWeight: 800, fontSize: "clamp(1.5rem,3vw,2rem)", marginBottom: 12, color: textColor }}>
            {titre}
          </h2>
          {texte && (
            <p style={{ fontSize: 15, lineHeight: 1.75, color: subColor, maxWidth: 560, margin: "0 auto" }}>
              {texte}
            </p>
          )}
        </div>

        {(eglise.adresse || eglise.telephone || eglise.email) && (
          <div style={{ display: "flex", gap: 24, justifyContent: "center", flexWrap: "wrap", fontSize: 15, marginBottom: 36 }}>
            {eglise.adresse && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: infoColor }}>
                <span style={{ fontSize: 20 }}>📍</span>
                <span>{eglise.adresse}{eglise.ville ? `, ${eglise.ville}` : ""}</span>
              </div>
            )}
            {eglise.telephone && (
              <a href={`tel:${eglise.telephone}`} style={{ display: "flex", alignItems: "center", gap: 8, color: infoColor, textDecoration: "none" }}>
                <span style={{ fontSize: 20 }}>📞</span>
                <span>{eglise.telephone}</span>
              </a>
            )}
            {eglise.email && (
              <a href={`mailto:${eglise.email}`} style={{ display: "flex", alignItems: "center", gap: 8, color: infoColor, textDecoration: "none" }}>
                <span style={{ fontSize: 20 }}>✉️</span>
                <span>{eglise.email}</span>
              </a>
            )}
          </div>
        )}

        {egliseId && status !== "success" && (
          <form onSubmit={handleSubmit} style={{ background: useDark ? "rgba(255,255,255,0.08)" : "white", borderRadius: 16, padding: "2rem", border: useDark ? "1px solid rgba(255,255,255,0.15)" : "1px solid #e2e8f0", maxWidth: 560, margin: "0 auto" }}>
            <h3 style={{ fontWeight: 700, fontSize: 16, color: textColor, marginBottom: 20, textAlign: "center" }}>
              Envoyez-nous un message
            </h3>

            {status === "error" && (
              <div style={{ background: "#fee2e2", color: "#b91c1c", padding: "10px 14px", borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
                {errorMsg}
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              <div>
                <label style={labelStyle}>Nom *</label>
                <input
                  required
                  value={form.nom}
                  onChange={(e) => updateField("nom", e.target.value)}
                  placeholder="Votre nom"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Email *</label>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  placeholder="votre@email.com"
                  style={inputStyle}
                />
              </div>
            </div>

            {champsActifs.telephone && (
              <div style={{ marginBottom: 12 }}>
                <label style={labelStyle}>Téléphone</label>
                <input
                  value={form.telephone}
                  onChange={(e) => updateField("telephone", e.target.value)}
                  placeholder="+243 XXX XXX XXX"
                  style={inputStyle}
                />
              </div>
            )}

            {champsActifs.sujet && (
              <div style={{ marginBottom: 12 }}>
                <label style={labelStyle}>Sujet</label>
                <input
                  value={form.sujet}
                  onChange={(e) => updateField("sujet", e.target.value)}
                  placeholder="Objet de votre message"
                  style={inputStyle}
                />
              </div>
            )}

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Message *</label>
              <textarea
                required
                value={form.message}
                onChange={(e) => updateField("message", e.target.value)}
                placeholder="Écrivez votre message ici…"
                rows={5}
                style={{ ...inputStyle, resize: "vertical", minHeight: 100 }}
              />
            </div>

            <button
              type="submit"
              disabled={status === "loading"}
              style={{
                width: "100%",
                padding: "12px 24px",
                borderRadius: 10,
                background: useDark ? "white" : "var(--church-primary, #1e3a8a)",
                color: useDark ? "var(--church-primary, #1e3a8a)" : "white",
                border: "none",
                fontWeight: 700,
                fontSize: 14,
                cursor: status === "loading" ? "not-allowed" : "pointer",
                opacity: status === "loading" ? 0.7 : 1,
              }}
            >
              {status === "loading" ? "Envoi en cours…" : "Envoyer le message"}
            </button>
          </form>
        )}

        {egliseId && status === "success" && (
          <div style={{
            background: useDark ? "rgba(255,255,255,0.1)" : "#dcfce7",
            color: useDark ? "white" : "#15803d",
            padding: "2rem",
            borderRadius: 16,
            textAlign: "center",
            maxWidth: 560,
            margin: "0 auto",
            border: useDark ? "1px solid rgba(255,255,255,0.2)" : "1px solid #bbf7d0",
          }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>✓</div>
            <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>Message envoyé !</p>
            <p style={{ fontSize: 14, opacity: 0.9 }}>{confirmation}</p>
          </div>
        )}
      </div>
    </section>
  );
}
