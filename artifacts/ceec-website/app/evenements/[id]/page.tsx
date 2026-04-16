import NavbarServer from "@/components/NavbarServer";
import Footer from "@/components/Footer";
import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, MapPin, Calendar, Clock, Tag, ExternalLink } from "lucide-react";
import type { Metadata } from "next";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const evt = await prisma.evenement.findUnique({ where: { id: parseInt(id, 10) }, select: { titre: true } });
  return { title: evt ? `${evt.titre} | CEEC` : "Événement | CEEC" };
}

export default async function EvenementDetailPage({ params }: Props) {
  const { id } = await params;
  const numId = parseInt(id, 10);
  if (isNaN(numId)) notFound();

  const { userId } = await auth();

  let visibiliteFilter: string[] = ["public"];
  if (userId) {
    const member = await prisma.membre.findFirst({ where: { clerkUserId: userId, statut: "actif" } });
    if (member) visibiliteFilter = ["public", "communaute"];
  }

  const evt = await prisma.evenement.findFirst({
    where: { id: numId, statutContenu: "publie", visibilite: { in: visibiliteFilter } },
  });
  if (!evt) notFound();

  const now = new Date();
  const isPast = new Date(evt.dateDebut) < now;

  const autres = await prisma.evenement.findMany({
    where: {
      id: { not: numId },
      statutContenu: "publie",
      visibilite: { in: visibiliteFilter },
      dateDebut: { gte: now },
    },
    orderBy: { dateDebut: "asc" },
    take: 3,
  });

  const formatDate = (d: Date | string) =>
    new Date(d).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const formatTime = (d: Date | string) =>
    new Date(d).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

  return (
    <>
      <NavbarServer />
      <main style={{ background: "#f8fafc", minHeight: "100vh", paddingTop: 80 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem 1rem 5rem" }}>

          {/* Back */}
          <Link href="/evenements" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#64748b", fontSize: 14, textDecoration: "none", marginBottom: 24 }}>
            <ChevronLeft size={16} /> Tous les événements
          </Link>

          <div style={{ display: "grid", gridTemplateColumns: autres.length > 0 ? "1fr 300px" : "1fr", gap: "2rem", alignItems: "start" }}>

            {/* Main */}
            <div>
              <div style={{ background: "white", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.07)", marginBottom: 16 }}>
                {evt.imageUrl ? (
                  <div style={{ position: "relative" }}>
                    <img src={evt.imageUrl} alt={evt.titre} style={{ width: "100%", maxHeight: 400, objectFit: "cover", display: "block" }} />
                    {isPast && (
                      <div style={{ position: "absolute", top: 16, right: 16, background: "rgba(0,0,0,0.6)", color: "white", fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 99 }}>
                        Passé
                      </div>
                    )}
                  </div>
                ) : null}
                {evt.videoUrl && (
                  <div style={{ padding: "1.5rem 1.5rem 0" }}>
                    <video
                      src={evt.videoUrl}
                      controls
                      style={{ width: "100%", borderRadius: 10, display: "block", background: "#000", maxHeight: 400 }}
                    />
                  </div>
                )}
                <div style={{ padding: "2rem" }}>
                  {isPast && !evt.imageUrl && (
                    <span style={{ display: "inline-block", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99, background: "#f1f5f9", color: "#64748b", marginBottom: 12 }}>
                      Événement passé
                    </span>
                  )}
                  <h1 style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)", fontWeight: 800, color: "#0f172a", margin: "0 0 20px", lineHeight: 1.3 }}>
                    {evt.titre}
                  </h1>

                  {/* Info grid */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 24 }}>
                    <div style={{ background: "#f8fafc", borderRadius: 10, padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#1e3a8a", fontWeight: 700, fontSize: 13, marginBottom: 4 }}>
                        <Calendar size={14} /> Date de début
                      </div>
                      <p style={{ color: "#0f172a", fontSize: 14, margin: 0, fontWeight: 600 }}>{formatDate(evt.dateDebut)}</p>
                      <p style={{ color: "#64748b", fontSize: 13, margin: 0 }}>{formatTime(evt.dateDebut)}</p>
                    </div>
                    {evt.dateFin && (
                      <div style={{ background: "#f8fafc", borderRadius: 10, padding: "12px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#1e3a8a", fontWeight: 700, fontSize: 13, marginBottom: 4 }}>
                          <Clock size={14} /> Date de fin
                        </div>
                        <p style={{ color: "#0f172a", fontSize: 14, margin: 0, fontWeight: 600 }}>{formatDate(evt.dateFin)}</p>
                        <p style={{ color: "#64748b", fontSize: 13, margin: 0 }}>{formatTime(evt.dateFin)}</p>
                      </div>
                    )}
                    {evt.lieu && (
                      <div style={{ background: "#f8fafc", borderRadius: 10, padding: "12px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#1e3a8a", fontWeight: 700, fontSize: 13, marginBottom: 4 }}>
                          <MapPin size={14} /> Lieu
                        </div>
                        <p style={{ color: "#0f172a", fontSize: 14, margin: 0, fontWeight: 600 }}>{evt.lieu}</p>
                      </div>
                    )}
                    {evt.categorie && (
                      <div style={{ background: "#f8fafc", borderRadius: 10, padding: "12px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#1e3a8a", fontWeight: 700, fontSize: 13, marginBottom: 4 }}>
                          <Tag size={14} /> Catégorie
                        </div>
                        <p style={{ color: "#0f172a", fontSize: 14, margin: 0, fontWeight: 600 }}>{evt.categorie}</p>
                      </div>
                    )}
                  </div>

                  {evt.description && (
                    <div style={{ color: "#374151", fontSize: 16, lineHeight: 1.85, whiteSpace: "pre-wrap" }}>
                      {evt.description}
                    </div>
                  )}

                  {evt.lienInscription && !isPast && (
                    <div style={{ marginTop: 28 }}>
                      <a
                        href={evt.lienInscription}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "inline-flex", alignItems: "center", gap: 8,
                          padding: "12px 28px", borderRadius: 10,
                          background: "#1e3a8a", color: "white", fontWeight: 700, fontSize: 15,
                          textDecoration: "none",
                        }}
                      >
                        <ExternalLink size={16} /> S&apos;inscrire à l&apos;événement
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            {autres.length > 0 && (
              <aside>
                <h3 style={{ fontWeight: 700, color: "#0f172a", fontSize: 15, marginBottom: 14 }}>Prochains événements</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {autres.map((a) => (
                    <Link key={a.id} href={`/evenements/${a.id}`} style={{ textDecoration: "none" }}>
                      <div style={{ background: "white", borderRadius: 12, overflow: "hidden", border: "1px solid #e2e8f0", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", display: "flex", gap: 12, alignItems: "center", padding: 12 }}>
                        {a.imageUrl ? (
                          <img src={a.imageUrl} alt={a.titre} style={{ width: 52, height: 52, objectFit: "cover", borderRadius: 8, flexShrink: 0 }} />
                        ) : (
                          <div style={{ width: 52, height: 52, background: "linear-gradient(135deg, #1e3a8a, #1e2d6b)", borderRadius: 8, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "white", flexShrink: 0 }}>
                            <div style={{ fontSize: 16, fontWeight: 800, lineHeight: 1 }}>{new Date(a.dateDebut).getDate()}</div>
                            <div style={{ fontSize: 9 }}>{new Date(a.dateDebut).toLocaleString("fr-FR", { month: "short" }).toUpperCase()}</div>
                          </div>
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontWeight: 700, color: "#0f172a", fontSize: 13, margin: "0 0 3px", lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.titre}</p>
                          {a.lieu && <p style={{ color: "#64748b", fontSize: 11, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.lieu}</p>}
                          <p style={{ color: "#94a3b8", fontSize: 11, margin: 0 }}>
                            {new Date(a.dateDebut).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </aside>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
