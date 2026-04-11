type GalerieConfig = {
  titre?: string;
  images?: Array<{ url: string; legende?: string }>;
  bgColor?: string;
};

export default function SectionGalerie({ config }: { config: GalerieConfig }) {
  const { titre = "Galerie", images = [], bgColor = "#f8fafc" } = config;

  if (images.length === 0) return null;

  return (
    <section style={{ background: bgColor, padding: "5rem 1rem" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <h2 style={{ color: "var(--church-primary, #1e3a8a)", fontWeight: 800, fontSize: "clamp(1.5rem,3vw,2rem)", marginBottom: 36, textAlign: "center" }}>
          {titre}
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: "1rem",
          }}
        >
          {images.map((img, i) => (
            <div key={i} style={{ borderRadius: 12, overflow: "hidden", aspectRatio: "4/3" }}>
              <img
                src={img.url}
                alt={img.legende ?? `Photo ${i + 1}`}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
