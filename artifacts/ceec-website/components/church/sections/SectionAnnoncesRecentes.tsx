import Link from "next/link";

type AnnonceConfig = {
  titre?: string;
  nombreItems?: number;
  voirPlusLabel?: string;
  bgColor?: string;
};

type Annonce = {
  id: number;
  titre: string;
  contenu: string;
  priorite: string;
  datePublication: Date;
  imageUrl?: string | null;
};

const prioriteStyle = (p: string) => {
  if (p === "urgente") return { bg: "#fee2e2", color: "#dc2626", label: "Urgent" };
  if (p === "haute") return { bg: "#fef3c7", color: "#d97706", label: "Important" };
  return { bg: "#e0f2fe", color: "#0369a1", label: "Information" };
};

export default function SectionAnnoncesRecentes({
  config,
  annonces,
}: {
  config: AnnonceConfig;
  annonces: Annonce[];
}) {
  const { titre = "Dernières annonces", voirPlusLabel = "Voir toutes →", bgColor = "#f8fafc" } = config;

  if (annonces.length === 0) return null;

  return (
    <section style={{ background: bgColor, padding: "5rem 1rem" }}>
      <div style={{ maxWidth: 920, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32, flexWrap: "wrap", gap: 12 }}>
          <h2 style={{ fontWeight: 800, color: "var(--church-primary, #1e3a8a)", fontSize: "clamp(1.5rem,3vw,1.85rem)", margin: 0 }}>
            {titre}
          </h2>
          <Link href="/c/annonces" style={{ color: "var(--church-primary, #1e3a8a)", fontWeight: 600, fontSize: 14, textDecoration: "none" }}>
            {voirPlusLabel}
          </Link>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {annonces.map((annonce) => {
            const style = prioriteStyle(annonce.priorite);
            return (
              <Link key={annonce.id} href={`/c/annonces/${annonce.id}`} style={{ textDecoration: "none" }}>
                <div
                  style={{
                    background: "white", borderRadius: 14, overflow: "hidden",
                    border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                    display: "flex", transition: "box-shadow 0.2s",
                  }}
                >
                  {annonce.imageUrl && (
                    <img
                      src={annonce.imageUrl}
                      alt={annonce.titre}
                      style={{ width: 120, height: "100%", objectFit: "cover", flexShrink: 0, minHeight: 100 }}
                    />
                  )}
                  <div style={{ padding: "1.25rem", flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
                      <span style={{ display: "inline-block", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 100, background: style.bg, color: style.color }}>
                        {style.label}
                      </span>
                      <span style={{ color: "#94a3b8", fontSize: 12 }}>
                        {new Date(annonce.datePublication).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                      </span>
                    </div>
                    <h3 style={{ fontWeight: 700, color: "#0f172a", margin: "0 0 6px", fontSize: 16 }}>{annonce.titre}</h3>
                    <p style={{ color: "#475569", fontSize: 13, lineHeight: 1.65, margin: 0 }}>
                      {annonce.contenu.length > 180 ? annonce.contenu.slice(0, 180) + "…" : annonce.contenu}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
