import Link from "next/link";
import { notFound } from "next/navigation";
import NavbarServer from "@/components/NavbarServer";
import Footer from "@/components/Footer";
import { prisma } from "@/lib/db";

async function getEglise(id: number) {
  try {
    return await prisma.eglise.findUnique({ where: { id } });
  } catch {
    return null;
  }
}

async function getEgliseContent(egliseId: number) {
  try {
    const [annoncesList, evenementsList] = await Promise.all([
      prisma.annonce.findMany({
        where: { egliseId, statutContenu: "publie" },
        orderBy: { datePublication: "desc" },
        take: 5,
      }),
      prisma.evenement.findMany({
        where: { egliseId, statutContenu: "publie" },
        orderBy: { dateDebut: "asc" },
        take: 5,
      }),
    ]);
    return { annoncesList, evenementsList };
  } catch {
    return { annoncesList: [], evenementsList: [] };
  }
}

export default async function ParoisseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const egliseId = parseInt(id);
  if (isNaN(egliseId)) notFound();

  const eglise = await getEglise(egliseId);
  if (!eglise) notFound();

  const { annoncesList, evenementsList } = await getEgliseContent(egliseId);

  return (
    <>
      <NavbarServer />
      <main>
        <section style={{
          background: "linear-gradient(135deg, #1e3a8a 0%, #1e2d6b 100%)",
          color: "white",
          padding: "8rem 1rem 5rem",
          minHeight: "55vh",
          display: "flex",
          alignItems: "center",
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
            background: "#c59b2e", opacity: 0.06, filter: "blur(120px)",
            pointerEvents: "none",
          }} />

          <div style={{ maxWidth: 1000, margin: "0 auto", width: "100%", position: "relative" }}>
            <Link href="/paroisses" style={{
              color: "rgba(255,255,255,0.65)", fontSize: 14,
              marginBottom: 28, display: "inline-flex", alignItems: "center", gap: 6,
              textDecoration: "none", transition: "color 0.15s",
            }}>
              ← Retour aux paroisses
            </Link>
            <div style={{ display: "flex", alignItems: "center", gap: 28, flexWrap: "wrap" }}>
              <div style={{
                width: 88, height: 88, borderRadius: 18,
                background: "rgba(197,155,46,0.25)",
                border: "2px solid rgba(197,155,46,0.5)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 40, fontWeight: 800, color: "#fcd34d", flexShrink: 0,
              }}>
                {eglise.nom.charAt(0)}
              </div>
              <div>
                <span style={{
                  display: "inline-block", fontSize: 11, fontWeight: 700,
                  letterSpacing: "0.1em", textTransform: "uppercase",
                  color: "rgba(197,155,46,1)", background: "rgba(197,155,46,0.12)",
                  borderRadius: 20, padding: "3px 14px", marginBottom: 12,
                }}>
                  Paroisse CEEC
                </span>
                <h1 style={{ fontSize: "clamp(1.6rem, 4vw, 2.6rem)", fontWeight: 900, margin: "0 0 8px", lineHeight: 1.15 }}>
                  {eglise.nom}
                </h1>
                {eglise.ville && (
                  <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 15, fontWeight: 500, margin: 0 }}>
                    📍 {eglise.ville}
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        <section style={{ padding: "3rem 1rem" }}>
          <div style={{ maxWidth: 1000, margin: "0 auto" }}>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 32, flexWrap: "wrap" }}>
              <div>
                {eglise.description && (
                  <div style={{ marginBottom: 32 }}>
                    <h2 style={{ fontWeight: 700, color: "#1e3a8a", marginBottom: 12, fontSize: 20 }}>A propos</h2>
                    <p style={{ color: "#475569", lineHeight: 1.8 }}>{eglise.description}</p>
                  </div>
                )}

                <div style={{ marginBottom: 32 }}>
                  <h2 style={{ fontWeight: 700, color: "#1e3a8a", marginBottom: 16, fontSize: 20 }}>Annonces</h2>
                  {annoncesList.length === 0 ? (
                    <p style={{ color: "#64748b" }}>Aucune annonce pour cette eglise.</p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {annoncesList.map(annonce => (
                        <div key={annonce.id} style={{ padding: "1.25rem", borderRadius: 10, border: "1px solid #e2e8f0", background: "#f8fafc" }}>
                          <h4 style={{ fontWeight: 600, color: "#0f172a", marginBottom: 6 }}>{annonce.titre}</h4>
                          <p style={{ color: "#64748b", fontSize: 14, lineHeight: 1.6 }}>{annonce.contenu}</p>
                          <p style={{ color: "#94a3b8", fontSize: 12, marginTop: 8 }}>
                            {new Date(annonce.datePublication).toLocaleDateString("fr-FR")}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <h2 style={{ fontWeight: 700, color: "#1e3a8a", marginBottom: 16, fontSize: 20 }}>Evenements</h2>
                  {evenementsList.length === 0 ? (
                    <p style={{ color: "#64748b" }}>Aucun evenement prevu pour cette eglise.</p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {evenementsList.map(evt => (
                        <div key={evt.id} style={{ display: "flex", gap: 16, padding: "1.25rem", borderRadius: 10, border: "1px solid #e2e8f0", background: "#f8fafc" }}>
                          <div style={{ flexShrink: 0, width: 56, height: 56, background: "linear-gradient(135deg, #1e3a8a, #1e2d6b)", borderRadius: 10, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "white" }}>
                            <div style={{ fontSize: 18, fontWeight: 800 }}>{new Date(evt.dateDebut).getDate()}</div>
                            <div style={{ fontSize: 10 }}>{new Date(evt.dateDebut).toLocaleString("fr-FR", { month: "short" }).toUpperCase()}</div>
                          </div>
                          <div>
                            <h4 style={{ fontWeight: 600, color: "#0f172a", marginBottom: 4 }}>{evt.titre}</h4>
                            {evt.lieu && <p style={{ color: "#64748b", fontSize: 13 }}>&#128205; {evt.lieu}</p>}
                            {evt.description && <p style={{ color: "#475569", fontSize: 13, marginTop: 4 }}>{evt.description}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <div style={{ background: "#f8fafc", borderRadius: 14, border: "1px solid #e2e8f0", padding: "1.5rem", position: "sticky", top: 24 }}>
                  <h3 style={{ fontWeight: 700, color: "#1e3a8a", marginBottom: 16, fontSize: 17 }}>Informations de contact</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {eglise.pasteur && (
                      <div>
                        <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", marginBottom: 2 }}>Pasteur</div>
                        <div style={{ color: "#334155", fontWeight: 600 }}>{eglise.pasteur}</div>
                      </div>
                    )}
                    {eglise.adresse && (
                      <div>
                        <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", marginBottom: 2 }}>Adresse</div>
                        <div style={{ color: "#334155" }}>{eglise.adresse}</div>
                      </div>
                    )}
                    {eglise.telephone && (
                      <div>
                        <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", marginBottom: 2 }}>Telephone</div>
                        <a href={`tel:${eglise.telephone}`} style={{ color: "#1e3a8a", fontWeight: 600 }}>{eglise.telephone}</a>
                      </div>
                    )}
                    {eglise.email && (
                      <div>
                        <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", marginBottom: 2 }}>Email</div>
                        <a href={`mailto:${eglise.email}`} style={{ color: "#1e3a8a", fontWeight: 600, wordBreak: "break-all" }}>{eglise.email}</a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
