import NavbarServer from "@/components/NavbarServer";
import Footer from "@/components/Footer";
import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Calendar, Tag } from "lucide-react";
import type { Metadata } from "next";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const annonce = await prisma.annonce.findUnique({ where: { id: parseInt(id, 10) }, select: { titre: true } });
  return { title: annonce ? `${annonce.titre} | CEEC` : "Annonce | CEEC" };
}

const prioriteStyle = (p: string) => {
  if (p === "urgente") return { bg: "#fee2e2", color: "#dc2626", label: "Urgent", border: "#fca5a5" };
  if (p === "haute") return { bg: "#fef3c7", color: "#d97706", label: "Important", border: "#fcd34d" };
  return { bg: "#e0f2fe", color: "#0369a1", label: "Information", border: "#7dd3fc" };
};

export default async function AnnonceDetailPage({ params }: Props) {
  const { id } = await params;
  const numId = parseInt(id, 10);
  if (isNaN(numId)) notFound();

  const { userId } = await auth();

  let visibiliteFilter: string[] = ["public"];
  if (userId) {
    const member = await prisma.membre.findFirst({ where: { clerkUserId: userId, statut: "actif" } });
    if (member) visibiliteFilter = ["public", "communaute"];
  }

  const annonce = await prisma.annonce.findFirst({
    where: { id: numId, statutContenu: "publie", visibilite: { in: visibiliteFilter } },
  });
  if (!annonce) notFound();

  const style = prioriteStyle(annonce.priorite);

  const autres = await prisma.annonce.findMany({
    where: { id: { not: numId }, statutContenu: "publie", visibilite: { in: visibiliteFilter } },
    orderBy: { datePublication: "desc" },
    take: 3,
  });

  return (
    <>
      <NavbarServer />
      <main style={{ background: "#f8fafc", minHeight: "100vh", paddingTop: 80 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem 1rem 5rem" }}>

          {/* Back */}
          <Link href="/annonces" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#64748b", fontSize: 14, textDecoration: "none", marginBottom: 24 }}>
            <ChevronLeft size={16} /> Toutes les annonces
          </Link>

          <div style={{ display: "grid", gridTemplateColumns: autres.length > 0 ? "1fr 300px" : "1fr", gap: "2rem", alignItems: "start" }}>

            {/* Main */}
            <div>
              <div style={{ background: "white", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}>
                {annonce.imageUrl && (
                  <img
                    src={annonce.imageUrl}
                    alt={annonce.titre}
                    style={{ width: "100%", maxHeight: 400, objectFit: "cover", display: "block" }}
                  />
                )}
                {annonce.videoUrl && (
                  <div style={{ padding: "1.5rem 1.5rem 0" }}>
                    <video
                      src={annonce.videoUrl}
                      controls
                      style={{ width: "100%", borderRadius: 10, display: "block", background: "#000", maxHeight: 400 }}
                    />
                  </div>
                )}
                <div style={{ padding: "2rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 99,
                      background: style.bg, color: style.color, border: `1px solid ${style.border}`,
                    }}>
                      {style.label}
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: 5, color: "#94a3b8", fontSize: 13 }}>
                      <Calendar size={13} />
                      {new Date(annonce.datePublication).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                    </span>
                    {annonce.categorie && (
                      <span style={{ display: "flex", alignItems: "center", gap: 5, color: "#64748b", fontSize: 13 }}>
                        <Tag size={13} /> {annonce.categorie}
                      </span>
                    )}
                  </div>
                  <h1 style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)", fontWeight: 800, color: "#0f172a", margin: "0 0 20px", lineHeight: 1.3 }}>
                    {annonce.titre}
                  </h1>
                  <div style={{ color: "#374151", fontSize: 16, lineHeight: 1.85, whiteSpace: "pre-wrap" }}>
                    {annonce.contenu}
                  </div>
                  {annonce.dateExpiration && (
                    <p style={{ marginTop: 24, fontSize: 13, color: "#94a3b8", borderTop: "1px solid #f1f5f9", paddingTop: 16 }}>
                      Expire le {new Date(annonce.dateExpiration).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            {autres.length > 0 && (
              <aside>
                <h3 style={{ fontWeight: 700, color: "#0f172a", fontSize: 15, marginBottom: 14 }}>Autres annonces</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {autres.map((a) => {
                    const s = prioriteStyle(a.priorite);
                    return (
                      <Link key={a.id} href={`/annonces/${a.id}`} style={{ textDecoration: "none" }}>
                        <div style={{ background: "white", borderRadius: 12, overflow: "hidden", border: "1px solid #e2e8f0", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                          {a.imageUrl && (
                            <img src={a.imageUrl} alt={a.titre} style={{ width: "100%", height: 100, objectFit: "cover", display: "block" }} />
                          )}
                          <div style={{ padding: "12px" }}>
                            <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: s.bg, color: s.color }}>
                              {s.label}
                            </span>
                            <p style={{ fontWeight: 700, color: "#0f172a", fontSize: 13, marginTop: 6, marginBottom: 4, lineHeight: 1.3 }}>{a.titre}</p>
                            <p style={{ color: "#94a3b8", fontSize: 11 }}>
                              {new Date(a.datePublication).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                            </p>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
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
