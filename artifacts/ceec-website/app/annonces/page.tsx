import NavbarServer from "@/components/NavbarServer";
import Footer from "@/components/Footer";
import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { Megaphone, ChevronLeft, ChevronRight } from "lucide-react";
import type { Metadata } from "next";

import { SITE_URL, SITE_NAME } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Annonces",
  description:
    "Dernières annonces et nouvelles de la Communauté des Églises Évangéliques au Congo.",
  openGraph: {
    title: `Annonces | ${SITE_NAME}`,
    description:
      "Restez informé des dernières nouvelles et annonces officielles de la CEEC et de ses paroisses.",
    url: `${SITE_URL}/annonces`,
    type: "website",
  },
  twitter: {
    card: "summary",
    title: `Annonces | ${SITE_NAME}`,
    description: "Dernières annonces et nouvelles de la CEEC.",
  },
};

const ITEMS_PER_PAGE = 12;

const prioriteStyle = (p: string) => {
  if (p === "urgente") return { bg: "#fee2e2", color: "#dc2626", label: "Urgent", border: "#fca5a5" };
  if (p === "haute") return { bg: "#fef3c7", color: "#d97706", label: "Important", border: "#fcd34d" };
  return { bg: "#e0f2fe", color: "#0369a1", label: "Information", border: "#7dd3fc" };
};

type SearchParams = { page?: string; categorie?: string };

export default async function AnnoncesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { userId } = await auth();

  let visibiliteFilter: string[] = ["public"];
  if (userId) {
    const member = await prisma.membre.findFirst({ where: { clerkUserId: userId, statut: "actif" } });
    if (member) visibiliteFilter = ["public", "communaute"];
  }

  const { page: pageStr, categorie } = await searchParams;
  const parsedPage = Number.parseInt(pageStr ?? "1", 10);
  const currentPage = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const skip = (currentPage - 1) * ITEMS_PER_PAGE;

  const where = {
    statutContenu: "publie" as const,
    visibilite: { in: visibiliteFilter },
    ...(categorie ? { categorie } : {}),
  };

  const [total, annoncesList, categories] = await Promise.all([
    prisma.annonce.count({ where }),
    prisma.annonce.findMany({
      where,
      orderBy: [{ priorite: "asc" }, { datePublication: "desc" }],
      skip,
      take: ITEMS_PER_PAGE,
    }),
    prisma.annonce.findMany({
      where: { statutContenu: "publie" as const, visibilite: { in: visibiliteFilter }, categorie: { not: null } },
      select: { categorie: true },
      distinct: ["categorie"],
    }),
  ]);

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
  const catList = categories.map((c) => c.categorie).filter(Boolean) as string[];

  return (
    <>
      <NavbarServer />
      <main>
        {/* Hero */}
        <section style={{
          background: "linear-gradient(135deg, #1e3a8a 0%, #1e2d6b 100%)",
          padding: "7rem 1rem 4rem",
          color: "white", textAlign: "center", position: "relative", overflow: "hidden",
          ["--color-foreground" as string]: "white",
        } as React.CSSProperties}>
          <div aria-hidden style={{
            position: "absolute", inset: 0, opacity: 0.04,
            backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }} />
          <div aria-hidden style={{
            position: "absolute", top: "20%", right: "15%",
            width: 400, height: 400, borderRadius: "50%",
            background: "#c59b2e", opacity: 0.06, filter: "blur(100px)", pointerEvents: "none",
          }} />
          <div style={{ position: "relative", maxWidth: 680, margin: "0 auto" }}>
            <span style={{
              display: "inline-block", fontSize: 12, fontWeight: 700, letterSpacing: "0.12em",
              textTransform: "uppercase", color: "#c59b2e",
              background: "rgba(197,155,46,0.12)", borderRadius: 20, padding: "4px 16px", marginBottom: 20,
            }}>
              Actualités CEEC
            </span>
            <h1 className="hero-title" style={{ fontSize: "clamp(2rem, 5vw, 2.8rem)", fontWeight: 900, margin: "0 0 16px", lineHeight: 1.15 }}>
              Annonces & Nouvelles
            </h1>
            <p style={{ fontSize: 16, opacity: 0.8, lineHeight: 1.7, margin: 0 }}>
              Dernières communications officielles et avis importants de la Communauté des Églises Évangéliques au Congo.
            </p>
          </div>
        </section>

        {/* Content */}
        <section style={{ padding: "3rem 1rem 5rem", background: "#f8fafc", minHeight: "50vh" }}>
          <div style={{ maxWidth: 1000, margin: "0 auto" }}>

            {/* Category filters */}
            {catList.length > 0 && (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 28 }}>
                <Link href="/annonces" style={{
                  padding: "5px 14px", borderRadius: 99, fontSize: 13, fontWeight: 600, textDecoration: "none",
                  background: !categorie ? "#1e3a8a" : "#e2e8f0",
                  color: !categorie ? "white" : "#475569",
                }}>Toutes</Link>
                {catList.map((cat) => (
                  <Link key={cat} href={`/annonces?categorie=${encodeURIComponent(cat)}`} style={{
                    padding: "5px 14px", borderRadius: 99, fontSize: 13, fontWeight: 600, textDecoration: "none",
                    background: categorie === cat ? "#1e3a8a" : "#e2e8f0",
                    color: categorie === cat ? "white" : "#475569",
                  }}>{cat}</Link>
                ))}
              </div>
            )}

            {annoncesList.length === 0 ? (
              <div style={{ textAlign: "center", padding: "5rem", background: "white", borderRadius: 16, border: "1px dashed #e2e8f0" }}>
                <div style={{ marginBottom: 16, display: "flex", justifyContent: "center" }}>
                  <Megaphone size={52} color="#1e3a8a" strokeWidth={1.5} />
                </div>
                <h3 style={{ color: "#1e3a8a", fontWeight: 700, marginBottom: 8 }}>Aucune annonce pour le moment</h3>
                <p style={{ color: "#64748b" }}>Les nouvelles annonces de la CEEC seront publiées ici.</p>
              </div>
            ) : (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.25rem" }}>
                  {annoncesList.map((annonce) => {
                    const style = prioriteStyle(annonce.priorite);
                    return (
                      <Link key={annonce.id} href={`/annonces/${annonce.id}`} style={{ textDecoration: "none" }}>
                        <article style={{
                          background: "white", borderRadius: 16, overflow: "hidden",
                          border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                          display: "flex", flexDirection: "column", height: "100%",
                          transition: "box-shadow 0.2s, transform 0.15s",
                        }}>
                          {annonce.imageUrl && (
                            <div style={{ height: 180, overflow: "hidden", flexShrink: 0 }}>
                              <img
                                src={annonce.imageUrl}
                                alt={annonce.titre}
                                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                              />
                            </div>
                          )}
                          <div style={{ padding: "1.25rem", flex: 1, display: "flex", flexDirection: "column" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10, gap: 8 }}>
                              <span style={{
                                display: "inline-block", fontSize: 11, fontWeight: 700,
                                padding: "3px 10px", borderRadius: 99,
                                background: style.bg, color: style.color, border: `1px solid ${style.border}`,
                              }}>
                                {style.label}
                              </span>
                              <span style={{ color: "#94a3b8", fontSize: 12, flexShrink: 0 }}>
                                {new Date(annonce.datePublication).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                              </span>
                            </div>
                            <h2 style={{ fontWeight: 700, color: "#0f172a", margin: "0 0 8px", fontSize: 16, lineHeight: 1.35 }}>
                              {annonce.titre}
                            </h2>
                            <p style={{ color: "#475569", fontSize: 13, lineHeight: 1.7, margin: 0, flex: 1 }}>
                              {annonce.contenu.length > 160 ? annonce.contenu.slice(0, 160) + "…" : annonce.contenu}
                            </p>
                            <div style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap" }}>
                              {annonce.categorie && (
                                <span style={{ fontSize: 11, fontWeight: 600, color: "#64748b" }}>#{annonce.categorie}</span>
                              )}
                              {annonce.videoUrl && (
                                <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 99, background: "#f0fdf4", color: "#166534", fontWeight: 600 }}>Vidéo</span>
                              )}
                            </div>
                          </div>
                        </article>
                      </Link>
                    );
                  })}
                </div>

                {totalPages > 1 && (
                  <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 40, flexWrap: "wrap" }}>
                    {currentPage > 1 && (
                      <Link href={`/annonces?page=${currentPage - 1}${categorie ? `&categorie=${encodeURIComponent(categorie)}` : ""}`}
                        style={{ padding: "8px 16px", borderRadius: 8, background: "white", border: "1px solid #e2e8f0", color: "#334155", textDecoration: "none", fontSize: 14, display: "inline-flex", alignItems: "center", gap: 6 }}>
                        <ChevronLeft size={14} /> Précédent
                      </Link>
                    )}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <Link key={p} href={`/annonces?page=${p}${categorie ? `&categorie=${encodeURIComponent(categorie)}` : ""}`}
                        style={{
                          padding: "8px 16px", borderRadius: 8, fontSize: 14, textDecoration: "none",
                          background: p === currentPage ? "#1e3a8a" : "white",
                          border: "1px solid #e2e8f0",
                          color: p === currentPage ? "white" : "#334155",
                          fontWeight: p === currentPage ? 700 : 400,
                        }}>
                        {p}
                      </Link>
                    ))}
                    {currentPage < totalPages && (
                      <Link href={`/annonces?page=${currentPage + 1}${categorie ? `&categorie=${encodeURIComponent(categorie)}` : ""}`}
                        style={{ padding: "8px 16px", borderRadius: 8, background: "white", border: "1px solid #e2e8f0", color: "#334155", textDecoration: "none", fontSize: 14, display: "inline-flex", alignItems: "center", gap: 6 }}>
                        Suivant <ChevronRight size={14} />
                      </Link>
                    )}
                  </div>
                )}
                <p style={{ textAlign: "center", color: "#94a3b8", fontSize: 13, marginTop: 20 }}>
                  {total} annonce{total > 1 ? "s" : ""} au total
                </p>
              </>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
