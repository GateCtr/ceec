import NavbarServer from "@/components/NavbarServer";
import Footer from "@/components/Footer";
import { prisma } from "@/lib/db";

async function getAnnonces() {
  try {
    return await prisma.annonce.findMany({
      where: { statutContenu: "publie" as const },
      orderBy: { datePublication: "desc" },
    });
  } catch {
    return [];
  }
}

export const metadata = {
  title: "Annonces | CEEC",
};

export default async function AnnoncesPage() {
  const annoncesList = await getAnnonces();

  const prioriteStyle = (p: string) => {
    if (p === "urgente") return { bg: "#fee2e2", color: "#dc2626", label: "Urgent" };
    if (p === "haute") return { bg: "#fef3c7", color: "#d97706", label: "Important" };
    return { bg: "#e0f2fe", color: "#0369a1", label: "Information" };
  };

  return (
    <>
      <NavbarServer />
      <main>
        <section style={{
          background: "linear-gradient(135deg, #1e3a8a 0%, #1e2d6b 100%)",
          minHeight: "75vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "8rem 1rem 5rem",
          color: "white",
          position: "relative",
          overflow: "hidden",
        }}>
          {/* Motif de fond */}
          <div aria-hidden style={{
            position: "absolute", inset: 0, opacity: 0.04,
            backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }} />
          {/* Halo or */}
          <div aria-hidden style={{
            position: "absolute", top: "20%", right: "15%",
            width: 500, height: 500, borderRadius: "50%",
            background: "#c59b2e", opacity: 0.05, filter: "blur(120px)",
            pointerEvents: "none",
          }} />
          <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center", position: "relative" }}>
            <span style={{
              display: "inline-block", fontSize: 12, fontWeight: 700, letterSpacing: "0.12em",
              textTransform: "uppercase", color: "rgba(197,155,46,1)",
              background: "rgba(197,155,46,0.12)", borderRadius: 20, padding: "4px 16px", marginBottom: 20,
            }}>
              Actualités CEEC
            </span>
            <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 900, margin: "0 0 20px", lineHeight: 1.15, color: "#fff" }}>
              Annonces & Nouvelles
            </h1>
            <p style={{ fontSize: 18, opacity: 0.8, lineHeight: 1.7, margin: "0 auto", maxWidth: 580 }}>
              Restez informé des dernières nouvelles, communications officielles
              et avis importants de la Communauté des Églises Évangéliques au Congo.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 32, flexWrap: "wrap" }}>
              <a href="#annonces" style={{
                padding: "12px 28px", borderRadius: 8, background: "#c59b2e",
                color: "#1e3a8a", fontWeight: 700, fontSize: 15, textDecoration: "none",
              }}>
                Lire les annonces →
              </a>
              <a href="/evenements" style={{
                padding: "12px 28px", borderRadius: 8, border: "1.5px solid rgba(255,255,255,0.35)",
                color: "white", fontWeight: 600, fontSize: 15, textDecoration: "none",
              }}>
                Voir les événements
              </a>
            </div>
          </div>
        </section>

        <section id="annonces" style={{ padding: "4rem 1rem", background: "#f8fafc" }}>
          <div style={{ maxWidth: 800, margin: "0 auto" }}>
            {annoncesList.length === 0 ? (
              <div style={{
                textAlign: "center", padding: "4rem",
                background: "white", borderRadius: 16, border: "1px dashed #e2e8f0"
              }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📢</div>
                <h3 style={{ color: "#1e3a8a", fontWeight: 700, marginBottom: 8 }}>Aucune annonce pour le moment</h3>
                <p style={{ color: "#64748b" }}>Les nouvelles annonces seront publiées ici.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {annoncesList.map((annonce) => {
                  const style = prioriteStyle(annonce.priorite);
                  return (
                    <div key={annonce.id} style={{
                      background: "white", borderRadius: 14, padding: "1.75rem",
                      border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12, flexWrap: "wrap" as const, gap: 8 }}>
                        <span style={{
                          display: "inline-block", fontSize: 12, fontWeight: 700,
                          padding: "4px 12px", borderRadius: 100,
                          background: style.bg, color: style.color
                        }}>
                          {style.label}
                        </span>
                        <span style={{ color: "#94a3b8", fontSize: 13 }}>
                          {new Date(annonce.datePublication).toLocaleDateString("fr-FR", {
                            day: "numeric", month: "long", year: "numeric"
                          })}
                        </span>
                      </div>
                      <h2 style={{ fontWeight: 700, color: "#0f172a", marginBottom: 10, fontSize: 18 }}>
                        {annonce.titre}
                      </h2>
                      <p style={{ color: "#475569", lineHeight: 1.8 }}>{annonce.contenu}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
