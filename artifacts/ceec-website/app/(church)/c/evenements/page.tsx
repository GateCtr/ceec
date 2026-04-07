import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

async function getEvenements(egliseId: number) {
  try {
    return await prisma.evenement.findMany({
      where: { egliseId, publie: true },
      orderBy: { dateDebut: "asc" },
    });
  } catch {
    return [];
  }
}

export default async function ChurchEvenementsPage() {
  const headersList = await headers();
  const slug = headersList.get("x-eglise-slug");
  if (!slug) redirect("/");

  const eglise = await prisma.eglise.findUnique({ where: { slug } });
  if (!eglise) redirect("/eglise-introuvable");

  const evenementsList = await getEvenements(eglise.id);
  const now = new Date();

  const upcoming = evenementsList.filter((e) => new Date(e.dateDebut) >= now);
  const past = evenementsList.filter((e) => new Date(e.dateDebut) < now);

  return (
    <>
      <section style={{
        background: "linear-gradient(135deg, #1e3a8a, #1e2d6b)",
        color: "white", padding: "3.5rem 1rem", textAlign: "center",
      }}>
        <h1 style={{ fontSize: "2.25rem", fontWeight: 800, marginBottom: 10 }}>Événements</h1>
        <p style={{ opacity: 0.8, fontSize: 15 }}>
          Tous les événements de {eglise.nom}
        </p>
      </section>

      <section style={{ padding: "4rem 1rem", background: "#f8fafc" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          {evenementsList.length === 0 ? (
            <div style={{
              textAlign: "center", padding: "4rem",
              background: "white", borderRadius: 16, border: "1px dashed #e2e8f0",
            }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🗓️</div>
              <h3 style={{ color: "#1e3a8a", fontWeight: 700, marginBottom: 8 }}>
                Aucun événement à venir
              </h3>
              <p style={{ color: "#64748b" }}>
                Les événements de {eglise.nom} seront affichés ici.
              </p>
            </div>
          ) : (
            <>
              {upcoming.length > 0 && (
                <div style={{ marginBottom: 40 }}>
                  <h2 style={{ fontWeight: 700, color: "#1e3a8a", fontSize: "1.4rem", marginBottom: 20 }}>
                    À venir
                  </h2>
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {upcoming.map((evt) => (
                      <EventCard key={evt.id} evt={evt} />
                    ))}
                  </div>
                </div>
              )}
              {past.length > 0 && (
                <div>
                  <h2 style={{ fontWeight: 700, color: "#64748b", fontSize: "1.2rem", marginBottom: 20 }}>
                    Événements passés
                  </h2>
                  <div style={{ display: "flex", flexDirection: "column", gap: 16, opacity: 0.7 }}>
                    {past.map((evt) => (
                      <EventCard key={evt.id} evt={evt} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}

function EventCard({ evt }: { evt: { id: number; titre: string; lieu: string | null; description: string | null; dateDebut: Date; dateFin: Date | null } }) {
  return (
    <div style={{
      background: "white", borderRadius: 14, overflow: "hidden",
      border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
      display: "flex",
    }}>
      <div style={{
        width: 100, flexShrink: 0,
        background: "linear-gradient(135deg, #1e3a8a, #1e2d6b)",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        color: "white", padding: "1rem",
      }}>
        <div style={{ fontSize: 30, fontWeight: 800 }}>
          {new Date(evt.dateDebut).getDate()}
        </div>
        <div style={{ fontSize: 12, opacity: 0.85 }}>
          {new Date(evt.dateDebut).toLocaleString("fr-FR", { month: "short" }).toUpperCase()}
        </div>
        <div style={{ fontSize: 11, opacity: 0.7, marginTop: 3 }}>
          {new Date(evt.dateDebut).getFullYear()}
        </div>
      </div>
      <div style={{ padding: "1.25rem", flex: 1 }}>
        <h3 style={{ fontWeight: 700, color: "#0f172a", marginBottom: 6, fontSize: 17, margin: "0 0 6px" }}>
          {evt.titre}
        </h3>
        {evt.lieu && (
          <p style={{ color: "#64748b", fontSize: 13, margin: "0 0 6px" }}>
            📍 {evt.lieu}
          </p>
        )}
        {evt.description && (
          <p style={{ color: "#475569", fontSize: 13, lineHeight: 1.7, margin: 0 }}>
            {evt.description}
          </p>
        )}
        {evt.dateFin && (
          <p style={{ color: "#94a3b8", fontSize: 12, marginTop: 10, margin: "10px 0 0" }}>
            Jusqu&apos;au {new Date(evt.dateFin).toLocaleDateString("fr-FR", {
              day: "numeric", month: "long", year: "numeric",
            })}
          </p>
        )}
      </div>
    </div>
  );
}
