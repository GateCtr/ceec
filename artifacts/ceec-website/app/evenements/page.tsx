import NavbarServer from "@/components/NavbarServer";
import Footer from "@/components/Footer";
import { prisma } from "@/lib/db";
import { CalendarDays, MapPin, ChevronRight } from "lucide-react";

async function getEvenements() {
  try {
    return await prisma.evenement.findMany({
      where: { statutContenu: "publie" as const },
      orderBy: { dateDebut: "asc" },
    });
  } catch {
    return [];
  }
}

export const metadata = {
  title: "Événements | CEEC",
};

export default async function EvenementsPage() {
  const evenementsList = await getEvenements();

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
            position: "absolute", top: "30%", left: "20%",
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
              Agenda communautaire
            </span>
            <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 900, margin: "0 0 20px", lineHeight: 1.15, color: "#fff" }}>
              Événements à venir
            </h1>
            <p style={{ fontSize: 18, opacity: 0.8, lineHeight: 1.7, margin: "0 auto", maxWidth: 580 }}>
              Retrouvez tous les événements organisés par les paroisses de la CEEC à travers
              la République Démocratique du Congo.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 32, flexWrap: "wrap" }}>
              <a href="#evenements" style={{
                padding: "12px 28px", borderRadius: 8, background: "#c59b2e",
                color: "#1e3a8a", fontWeight: 700, fontSize: 15, textDecoration: "none",
              }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>Voir les événements <ChevronRight size={16} /></span>
              </a>
              <a href="/paroisses" style={{
                padding: "12px 28px", borderRadius: 8, border: "1.5px solid rgba(255,255,255,0.35)",
                color: "white", fontWeight: 600, fontSize: 15, textDecoration: "none",
              }}>
                Nos églises
              </a>
            </div>
          </div>
        </section>

        <section id="evenements" style={{ padding: "4rem 1rem", background: "#f8fafc" }}>
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            {evenementsList.length === 0 ? (
              <div style={{
                textAlign: "center", padding: "4rem",
                background: "white", borderRadius: 16, border: "1px dashed #e2e8f0"
              }}>
                <div style={{ marginBottom: 16, display: "flex", justifyContent: "center" }}><CalendarDays size={48} style={{ color: "#94a3b8" }} /></div>
                <h3 style={{ color: "#1e3a8a", fontWeight: 700, marginBottom: 8 }}>Aucun événement à venir</h3>
                <p style={{ color: "#64748b" }}>Les prochains événements seront affichés ici.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {evenementsList.map((evt) => (
                  <div key={evt.id} style={{
                    background: "white", borderRadius: 14, overflow: "hidden",
                    border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    display: "flex"
                  }}>
                    <div style={{
                      width: 100, flexShrink: 0,
                      background: "linear-gradient(135deg, #1e3a8a, #1e2d6b)",
                      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                      color: "white", padding: "1rem"
                    }}>
                      <div style={{ fontSize: 32, fontWeight: 800 }}>
                        {new Date(evt.dateDebut).getDate()}
                      </div>
                      <div style={{ fontSize: 13, opacity: 0.8 }}>
                        {new Date(evt.dateDebut).toLocaleString("fr-FR", { month: "short" }).toUpperCase()}
                      </div>
                      <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>
                        {new Date(evt.dateDebut).getFullYear()}
                      </div>
                    </div>
                    <div style={{ padding: "1.5rem", flex: 1 }}>
                      <h2 style={{ fontWeight: 700, color: "#0f172a", marginBottom: 8, fontSize: 18 }}>
                        {evt.titre}
                      </h2>
                      {evt.lieu && (
                        <p style={{ color: "#64748b", fontSize: 14, marginBottom: 8, display: "flex", alignItems: "center", gap: 5 }}>
                          <MapPin size={13} /> {evt.lieu}
                        </p>
                      )}
                      {evt.description && (
                        <p style={{ color: "#475569", fontSize: 14, lineHeight: 1.7 }}>
                          {evt.description}
                        </p>
                      )}
                      {evt.dateFin && (
                        <p style={{ color: "#94a3b8", fontSize: 13, marginTop: 12 }}>
                          Jusqu&apos;au {new Date(evt.dateFin).toLocaleDateString("fr-FR", {
                            day: "numeric", month: "long", year: "numeric"
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
