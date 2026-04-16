import Link from "next/link";
import { ChevronRight, MapPin } from "lucide-react";

type EvenementConfig = {
  titre?: string;
  nombreItems?: number;
  voirPlusLabel?: string;
  bgColor?: string;
};

type Evenement = {
  id: number;
  titre: string;
  description?: string | null;
  lieu?: string | null;
  dateDebut: Date;
  dateFin?: Date | null;
  imageUrl?: string | null;
};

export default function SectionEvenementsAVenir({
  config,
  evenements,
}: {
  config: EvenementConfig;
  evenements: Evenement[];
}) {
  const { titre = "Prochains événements", voirPlusLabel = "Voir tous", bgColor = "#ffffff" } = config;

  if (evenements.length === 0) return null;

  return (
    <section style={{ background: bgColor, padding: "5rem 1rem" }}>
      <div style={{ maxWidth: 920, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32, flexWrap: "wrap", gap: 12 }}>
          <h2 style={{ fontWeight: 800, color: "var(--church-primary, #1e3a8a)", fontSize: "clamp(1.5rem,3vw,1.85rem)", margin: 0 }}>
            {titre}
          </h2>
          <Link href="/c/evenements" style={{ color: "var(--church-primary, #1e3a8a)", fontWeight: 600, fontSize: 14, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}>
            {voirPlusLabel} <ChevronRight size={14} />
          </Link>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {evenements.map((evt) => (
            <Link key={evt.id} href={`/c/evenements/${evt.id}`} style={{ textDecoration: "none" }}>
              <div
                style={{
                  background: "white", borderRadius: 14, overflow: "hidden",
                  border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  display: "flex", transition: "box-shadow 0.2s",
                }}
              >
                <div
                  style={{
                    width: 90, flexShrink: 0,
                    background: "linear-gradient(135deg, var(--church-primary, #1e3a8a), #1e2d6b)",
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    color: "white", padding: "1rem",
                  }}
                >
                  <div style={{ fontSize: 28, fontWeight: 900, lineHeight: 1 }}>
                    {new Date(evt.dateDebut).getDate()}
                  </div>
                  <div style={{ fontSize: 12, opacity: 0.85, marginTop: 2 }}>
                    {new Date(evt.dateDebut).toLocaleString("fr-FR", { month: "short" }).toUpperCase()}
                  </div>
                  <div style={{ fontSize: 11, opacity: 0.65, marginTop: 2 }}>
                    {new Date(evt.dateDebut).getFullYear()}
                  </div>
                </div>
                {evt.imageUrl && (
                  <img
                    src={evt.imageUrl}
                    alt={evt.titre}
                    style={{ width: 120, height: "auto", objectFit: "cover", flexShrink: 0 }}
                  />
                )}
                <div style={{ padding: "1.25rem", flex: 1 }}>
                  <h3 style={{ fontWeight: 700, color: "#0f172a", margin: "0 0 6px", fontSize: 16 }}>{evt.titre}</h3>
                  {evt.lieu && (
                    <p style={{ color: "#64748b", fontSize: 13, margin: "0 0 6px", display: "flex", alignItems: "center", gap: 4 }}>
                      <MapPin size={12} /> {evt.lieu}
                    </p>
                  )}
                  {evt.description && (
                    <p style={{ color: "#475569", fontSize: 13, lineHeight: 1.65, margin: 0 }}>
                      {evt.description.length > 140 ? evt.description.slice(0, 140) + "…" : evt.description}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
