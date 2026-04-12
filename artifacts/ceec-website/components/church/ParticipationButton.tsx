"use client";

import { useState } from "react";

interface Props {
  evenementId: number;
  initialParticipe: boolean;
  isSignedIn: boolean;
  isMembre: boolean;
}

export default function ParticipationButton({ evenementId, initialParticipe, isSignedIn, isMembre }: Props) {
  const [participe, setParticipe] = useState(initialParticipe);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleClick() {
    if (!isSignedIn) {
      window.location.href = "/c/connexion";
      return;
    }
    if (!isMembre) {
      window.location.href = "/c/inscription";
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      const method = participe ? "DELETE" : "POST";
      const res = await fetch(`/api/membre/evenements/${evenementId}/participer`, { method });
      if (res.ok) {
        setParticipe(!participe);
        setMessage(participe ? "Participation annulée." : "Vous participez à cet événement !");
      } else {
        const data = await res.json().catch(() => ({}));
        setMessage(data.error ?? "Une erreur est survenue.");
      }
    } finally {
      setLoading(false);
    }
  }

  const accent = "var(--church-accent, #c59b2e)";
  const primary = "var(--church-primary, #1e3a8a)";

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={loading}
        style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "11px 22px", borderRadius: 9, fontWeight: 700, fontSize: 14,
          cursor: loading ? "wait" : "pointer",
          border: participe ? `2px solid ${accent}` : "none",
          background: participe ? "transparent" : primary,
          color: participe ? primary : "white",
          transition: "all 0.15s",
          width: "100%", justifyContent: "center",
        }}
      >
        {loading ? "..." : participe ? "✓ Je participe — Annuler" : "🙋 Je participe"}
      </button>
      {message && (
        <p style={{ fontSize: 12, marginTop: 8, textAlign: "center", color: "#64748b" }}>
          {message}
        </p>
      )}
      {!isSignedIn && (
        <p style={{ fontSize: 12, marginTop: 8, textAlign: "center", color: "#64748b" }}>
          <a href="/c/connexion" style={{ color: primary, fontWeight: 600 }}>Connectez-vous</a> pour vous inscrire
        </p>
      )}
    </div>
  );
}
