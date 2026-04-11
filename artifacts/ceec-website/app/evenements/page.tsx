import NavbarServer from "@/components/NavbarServer";
import Footer from "@/components/Footer";
import { prisma } from "@/lib/db";

async function getEvenements() {
  try {
    return await prisma.evenement.findMany({
      where: { publie: true },
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
          background: "linear-gradient(135deg, #1e3a8a, #1e2d6b)",
          color: "white", padding: "4rem 1rem", textAlign: "center"
        }}>
          <h1 style={{ fontSize: "2.5rem", fontWeight: 800, marginBottom: 12 }}>Événements</h1>
          <p style={{ opacity: 0.8, fontSize: 16 }}>Tous les événements à venir dans nos paroisses</p>
        </section>

        <section style={{ padding: "4rem 1rem", background: "#f8fafc" }}>
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            {evenementsList.length === 0 ? (
              <div style={{
                textAlign: "center", padding: "4rem",
                background: "white", borderRadius: 16, border: "1px dashed #e2e8f0"
              }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🗓️</div>
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
                        <p style={{ color: "#64748b", fontSize: 14, marginBottom: 8 }}>
                          📍 {evt.lieu}
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
