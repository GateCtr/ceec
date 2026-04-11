type Departement = {
  nom: string;
  description?: string;
  icon?: string;
  responsable?: string;
};

type DepartementsConfig = {
  titre?: string;
  sousTitre?: string;
  items?: Departement[];
  bgColor?: string;
};

const DEFAULT_ICONS = ["⛪", "🙏", "📖", "🎵", "👨‍👩‍👧", "🤝", "✝️", "🌍", "💒", "🕊️"];

export default function SectionDepartements({ config }: { config: DepartementsConfig }) {
  const {
    titre = "Nos ministères",
    sousTitre,
    items = [],
    bgColor = "#f8fafc",
  } = config;

  if (items.length === 0) return null;

  return (
    <section style={{ background: bgColor, padding: "5rem 1rem" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          {sousTitre && (
            <p style={{ color: "var(--church-accent, #c59b2e)", fontWeight: 700, fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>
              {sousTitre}
            </p>
          )}
          <h2 style={{ color: "var(--church-primary, #1e3a8a)", fontWeight: 800, fontSize: "clamp(1.5rem,3vw,2rem)", margin: 0 }}>
            {titre}
          </h2>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {items.map((dept, i) => (
            <div
              key={i}
              style={{
                background: "white",
                borderRadius: 16,
                padding: "2rem 1.5rem",
                border: "1px solid #e2e8f0",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 40, marginBottom: 16 }}>
                {dept.icon || DEFAULT_ICONS[i % DEFAULT_ICONS.length]}
              </div>
              <h3 style={{ color: "var(--church-primary, #1e3a8a)", fontWeight: 700, fontSize: 17, margin: "0 0 10px" }}>
                {dept.nom}
              </h3>
              {dept.description && (
                <p style={{ color: "#64748b", fontSize: 13, lineHeight: 1.7, margin: 0 }}>
                  {dept.description}
                </p>
              )}
              {dept.responsable && (
                <p style={{ color: "var(--church-accent, #c59b2e)", fontSize: 12, fontWeight: 600, marginTop: 12, margin: "12px 0 0" }}>
                  {dept.responsable}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
