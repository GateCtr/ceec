import Link from "next/link";
import { safeUrl } from "@/lib/sanitize-url";

type HeroConfig = {
  titre?: string;
  sousTitre?: string;
  description?: string;
  imageUrl?: string;
  bgColor?: string;
  overlayOpacity?: number;
  ctaLabel1?: string;
  ctaHref1?: string;
  ctaLabel2?: string;
  ctaHref2?: string;
};

export default function SectionHero({
  config,
  eglise,
}: {
  config: HeroConfig;
  eglise: { nom: string; ville: string; pasteur?: string | null; logoUrl?: string | null; description?: string | null };
}) {
  const titre = config.titre ?? eglise.nom;
  const sousTitre = config.sousTitre ?? `${eglise.ville}, République Démocratique du Congo`;
  const description = config.description ?? eglise.description ?? null;
  const imageUrl = config.imageUrl ?? null;
  const ctaLabel1 = config.ctaLabel1 ?? "Rejoindre l'église";
  const ctaHref1 = config.ctaHref1 ?? "/c/inscription";
  const ctaLabel2 = config.ctaLabel2 ?? "Voir les événements";
  const ctaHref2 = config.ctaHref2 ?? "/c/evenements";

  return (
    <section
      style={{
        position: "relative",
        overflow: "hidden",
        color: "white",
        padding: "7rem 1rem 5rem",
        textAlign: "center",
        minHeight: "clamp(480px, 60vh, 700px)",
        marginTop: -64,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {imageUrl ? (
        <div
          style={{
            position: "absolute", inset: 0,
            backgroundImage: `url(${imageUrl})`,
            backgroundSize: "cover", backgroundPosition: "center",
          }}
        />
      ) : null}
      <div
        style={{
          position: "absolute", inset: 0,
          background: imageUrl
            ? `rgba(15,23,42,${config.overlayOpacity ?? 0.6})`
            : "linear-gradient(135deg, var(--church-primary, #1e3a8a) 0%, #1e2d6b 60%, #0f172a 100%)",
        }}
      />
      {/* Cross pattern overlay */}
      <div
        style={{
          position: "absolute", inset: 0, opacity: 0.04,
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-rule='evenodd'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E\")",
        }}
      />
      <div style={{ maxWidth: 720, margin: "0 auto", position: "relative" }}>
        {eglise.logoUrl && (
          <img
            src={eglise.logoUrl}
            alt={eglise.nom}
            style={{
              width: 88, height: 88, borderRadius: "50%", objectFit: "cover",
              marginBottom: 24, border: "3px solid var(--church-accent, #c59b2e)",
              boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
            }}
          />
        )}
        <h1 style={{ fontSize: "clamp(2rem,5vw,3rem)", fontWeight: 900, marginBottom: 12, lineHeight: 1.15, letterSpacing: "-0.02em" }}>
          {titre}
        </h1>
        <p style={{ opacity: 0.85, fontSize: 17, marginBottom: 8 }}>{sousTitre}</p>
        {eglise.pasteur && (
          <p style={{ opacity: 0.65, fontSize: 14 }}>Pasteur : {eglise.pasteur}</p>
        )}
        {description && (
          <p style={{ marginTop: 20, opacity: 0.85, fontSize: 15, lineHeight: 1.75, maxWidth: 580, margin: "20px auto 0" }}>
            {description}
          </p>
        )}
        <div style={{ display: "flex", gap: 14, justifyContent: "center", marginTop: 32, flexWrap: "wrap" }}>
          <Link
            href={safeUrl(ctaHref1)}
            style={{
              padding: "13px 30px", borderRadius: 10,
              background: "var(--church-accent, #c59b2e)",
              color: "#1e3a8a", fontWeight: 700, fontSize: 15, textDecoration: "none",
              boxShadow: "0 4px 12px rgba(0,0,0,0.2)", transition: "opacity 0.15s",
            }}
          >
            {ctaLabel1}
          </Link>
          <Link
            href={safeUrl(ctaHref2)}
            style={{
              padding: "13px 30px", borderRadius: 10,
              background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.3)",
              color: "white", fontWeight: 600, fontSize: 15, textDecoration: "none",
              transition: "background 0.15s",
            }}
          >
            {ctaLabel2}
          </Link>
        </div>
      </div>
    </section>
  );
}
