type TexTeImageConfig = {
  titre?: string;
  sousTitre?: string;
  texte?: string;
  imageUrl?: string;
  disposition?: "image_droite" | "image_gauche";
  bgColor?: string;
  ctaLabel?: string;
  ctaHref?: string;
};

export default function SectionTexteImage({ config }: { config: TexTeImageConfig }) {
  const {
    titre = "",
    sousTitre,
    texte = "",
    imageUrl,
    disposition = "image_droite",
    bgColor = "#ffffff",
    ctaLabel,
    ctaHref,
  } = config;

  const imageFirst = disposition === "image_gauche";

  return (
    <section style={{ background: bgColor, padding: "5rem 1rem" }}>
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: imageUrl ? "repeat(2, 1fr)" : "1fr",
          gap: "3.5rem",
          alignItems: "center",
        }}
      >
        {imageFirst && imageUrl && (
          <div style={{ borderRadius: 20, overflow: "hidden", boxShadow: "0 8px 40px rgba(0,0,0,0.12)" }}>
            <img src={imageUrl} alt={titre} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", maxHeight: 420 }} />
          </div>
        )}

        <div>
          {sousTitre && (
            <p style={{ color: "var(--church-accent, #c59b2e)", fontWeight: 700, fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>
              {sousTitre}
            </p>
          )}
          {titre && (
            <h2 style={{ color: "var(--church-primary, #1e3a8a)", fontWeight: 800, fontSize: "clamp(1.5rem,3vw,2.25rem)", marginBottom: 20, lineHeight: 1.2 }}>
              {titre}
            </h2>
          )}
          {texte && (
            <div style={{ color: "#475569", fontSize: 16, lineHeight: 1.85 }}>
              {texte.split("\n").map((line, i) => (
                <p key={i} style={{ marginBottom: 12 }}>{line}</p>
              ))}
            </div>
          )}
          {ctaLabel && ctaHref && (
            <a
              href={ctaHref}
              style={{
                display: "inline-block", marginTop: 24,
                padding: "11px 26px", borderRadius: 8,
                background: "var(--church-primary, #1e3a8a)",
                color: "white", fontWeight: 600, fontSize: 15, textDecoration: "none",
              }}
            >
              {ctaLabel}
            </a>
          )}
        </div>

        {!imageFirst && imageUrl && (
          <div style={{ borderRadius: 20, overflow: "hidden", boxShadow: "0 8px 40px rgba(0,0,0,0.12)" }}>
            <img src={imageUrl} alt={titre} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", maxHeight: 420 }} />
          </div>
        )}
      </div>
    </section>
  );
}
