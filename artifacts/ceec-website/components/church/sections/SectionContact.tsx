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

export default function SectionContact({
  config,
  eglise,
}: {
  config: ContactConfig;
  eglise: ContactData;
}) {
  const { titre = "Nous contacter", texte, bgColor = "var(--church-primary, #1e3a8a)" } = config;

  if (!eglise.adresse && !eglise.telephone && !eglise.email) return null;

  const useDark = bgColor === "var(--church-primary, #1e3a8a)" || bgColor.startsWith("#1e3") || bgColor.startsWith("#0f1") || bgColor.startsWith("#1e2");

  return (
    <section style={{ background: bgColor, padding: "4rem 1rem" }}>
      <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
        <h2 style={{ fontWeight: 800, fontSize: "clamp(1.5rem,3vw,2rem)", marginBottom: 12, color: useDark ? "white" : "var(--church-primary, #1e3a8a)" }}>
          {titre}
        </h2>
        {texte && (
          <p style={{ fontSize: 15, lineHeight: 1.75, marginBottom: 28, color: useDark ? "rgba(255,255,255,0.8)" : "#475569" }}>
            {texte}
          </p>
        )}
        <div style={{ display: "flex", gap: 24, justifyContent: "center", flexWrap: "wrap", fontSize: 15 }}>
          {eglise.adresse && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: useDark ? "rgba(255,255,255,0.9)" : "#334155" }}>
              <span style={{ fontSize: 20 }}>📍</span>
              <span>{eglise.adresse}{eglise.ville ? `, ${eglise.ville}` : ""}</span>
            </div>
          )}
          {eglise.telephone && (
            <a href={`tel:${eglise.telephone}`} style={{ display: "flex", alignItems: "center", gap: 8, color: useDark ? "rgba(255,255,255,0.9)" : "#334155", textDecoration: "none" }}>
              <span style={{ fontSize: 20 }}>📞</span>
              <span>{eglise.telephone}</span>
            </a>
          )}
          {eglise.email && (
            <a href={`mailto:${eglise.email}`} style={{ display: "flex", alignItems: "center", gap: 8, color: useDark ? "rgba(255,255,255,0.9)" : "#334155", textDecoration: "none" }}>
              <span style={{ fontSize: 20 }}>✉️</span>
              <span>{eglise.email}</span>
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
