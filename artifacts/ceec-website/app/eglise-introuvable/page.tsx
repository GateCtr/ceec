import Link from "next/link";

export default function EgliseIntrouvablePage() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem 1rem",
      background: "#f8fafc",
    }}>
      <div style={{
        textAlign: "center",
        maxWidth: 520,
        padding: "3rem 2rem",
        background: "white",
        borderRadius: 20,
        border: "1px solid #e2e8f0",
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
      }}>
        <div style={{
          width: 80, height: 80, borderRadius: "50%",
          background: "#fee2e2",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 24px",
          fontSize: 36,
        }}>
          🔍
        </div>

        <h1 style={{
          fontSize: "1.75rem", fontWeight: 800, color: "#0f172a",
          marginBottom: 12,
        }}>
          Espace introuvable
        </h1>

        <p style={{
          color: "#64748b", lineHeight: 1.7, fontSize: 15,
          marginBottom: 28,
        }}>
          L&apos;espace d&apos;église que vous cherchez n&apos;existe pas ou n&apos;est pas encore
          enregistré dans la plateforme <strong style={{ color: "#1e3a8a" }}>CEEC</strong>.
        </p>

        <Link href="/" style={{
          padding: "11px 28px", borderRadius: 8,
          background: "#1e3a8a", color: "white",
          fontWeight: 700, fontSize: 14, textDecoration: "none",
          display: "inline-block",
        }}>
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}
