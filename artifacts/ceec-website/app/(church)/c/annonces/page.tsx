import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db/index";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Annonces" };

const ITEMS_PER_PAGE = 12;

const prioriteStyle = (p: string) => {
  if (p === "urgente") return { bg: "#fee2e2", color: "#dc2626", label: "Urgent", border: "#fca5a5" };
  if (p === "haute") return { bg: "#fef3c7", color: "#d97706", label: "Important", border: "#fcd34d" };
  return { bg: "#e0f2fe", color: "#0369a1", label: "Information", border: "#7dd3fc" };
};

type SearchParams = { page?: string; categorie?: string };

export default async function ChurchAnnoncesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const headersList = await headers();
  const slug = headersList.get("x-eglise-slug");
  if (!slug) redirect("/");

  const eglise = await prisma.eglise.findUnique({ where: { slug } });
  if (!eglise) notFound();

  const { page: pageStr, categorie } = await searchParams;
  const currentPage = Math.max(1, parseInt(pageStr ?? "1", 10));
  const skip = (currentPage - 1) * ITEMS_PER_PAGE;

  const where = {
    egliseId: eglise.id,
    publie: true,
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
      where: { egliseId: eglise.id, publie: true, categorie: { not: null } },
      select: { categorie: true },
      distinct: ["categorie"],
    }),
  ]);

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
  const catList = categories.map((c) => c.categorie).filter(Boolean) as string[];

  return (
    <>
      {/* Header */}
      <section
        style={{
          background: "linear-gradient(135deg, var(--church-primary, #1e3a8a), #1e2d6b)",
          color: "white", padding: "4rem 1rem", textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: "clamp(1.8rem,4vw,2.5rem)", fontWeight: 900, marginBottom: 10 }}>Annonces</h1>
        <p style={{ opacity: 0.8, fontSize: 15 }}>Dernières nouvelles de {eglise.nom}</p>
      </section>

      <section style={{ padding: "3rem 1rem 5rem", background: "#f8fafc", minHeight: "60vh" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>

          {/* Category filters */}
          {catList.length > 0 && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 28 }}>
              <Link
                href="/c/annonces"
                style={{
                  padding: "5px 14px", borderRadius: 99, fontSize: 13, fontWeight: 600,
                  background: !categorie ? "var(--church-primary, #1e3a8a)" : "#e2e8f0",
                  color: !categorie ? "white" : "#475569", textDecoration: "none",
                }}
              >
                Toutes
              </Link>
              {catList.map((cat) => (
                <Link
                  key={cat}
                  href={`/c/annonces?categorie=${encodeURIComponent(cat)}`}
                  style={{
                    padding: "5px 14px", borderRadius: 99, fontSize: 13, fontWeight: 600,
                    background: categorie === cat ? "var(--church-primary, #1e3a8a)" : "#e2e8f0",
                    color: categorie === cat ? "white" : "#475569", textDecoration: "none",
                  }}
                >
                  {cat}
                </Link>
              ))}
            </div>
          )}

          {annoncesList.length === 0 ? (
            <div style={{ textAlign: "center", padding: "5rem", background: "white", borderRadius: 16, border: "1px dashed #e2e8f0" }}>
              <div style={{ fontSize: 52, marginBottom: 16 }}>📢</div>
              <h3 style={{ color: "var(--church-primary, #1e3a8a)", fontWeight: 700, marginBottom: 8 }}>
                Aucune annonce pour le moment
              </h3>
              <p style={{ color: "#64748b" }}>Les annonces de {eglise.nom} seront publiées ici.</p>
            </div>
          ) : (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.25rem" }}>
                {annoncesList.map((annonce) => {
                  const style = prioriteStyle(annonce.priorite);
                  return (
                    <Link key={annonce.id} href={`/c/annonces/${annonce.id}`} style={{ textDecoration: "none" }}>
                      <article
                        style={{
                          background: "white", borderRadius: 16, overflow: "hidden",
                          border: `1px solid #e2e8f0`, boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                          display: "flex", flexDirection: "column", height: "100%",
                          transition: "box-shadow 0.2s, transform 0.15s",
                        }}
                      >
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
                            <span
                              style={{
                                display: "inline-block", fontSize: 11, fontWeight: 700,
                                padding: "3px 10px", borderRadius: 99,
                                background: style.bg, color: style.color,
                                border: `1px solid ${style.border}`,
                              }}
                            >
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
                          {annonce.categorie && (
                            <span style={{ display: "inline-block", marginTop: 12, fontSize: 11, fontWeight: 600, color: "#64748b" }}>
                              # {annonce.categorie}
                            </span>
                          )}
                        </div>
                      </article>
                    </Link>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 40, flexWrap: "wrap" }}>
                  {currentPage > 1 && (
                    <Link
                      href={`/c/annonces?page=${currentPage - 1}${categorie ? `&categorie=${encodeURIComponent(categorie)}` : ""}`}
                      style={{ padding: "8px 16px", borderRadius: 8, background: "white", border: "1px solid #e2e8f0", color: "#334155", textDecoration: "none", fontSize: 14 }}
                    >
                      ← Précédent
                    </Link>
                  )}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <Link
                      key={p}
                      href={`/c/annonces?page=${p}${categorie ? `&categorie=${encodeURIComponent(categorie)}` : ""}`}
                      style={{
                        padding: "8px 16px", borderRadius: 8, fontSize: 14, textDecoration: "none",
                        background: p === currentPage ? "var(--church-primary, #1e3a8a)" : "white",
                        border: "1px solid #e2e8f0",
                        color: p === currentPage ? "white" : "#334155",
                        fontWeight: p === currentPage ? 700 : 400,
                      }}
                    >
                      {p}
                    </Link>
                  ))}
                  {currentPage < totalPages && (
                    <Link
                      href={`/c/annonces?page=${currentPage + 1}${categorie ? `&categorie=${encodeURIComponent(categorie)}` : ""}`}
                      style={{ padding: "8px 16px", borderRadius: 8, background: "white", border: "1px solid #e2e8f0", color: "#334155", textDecoration: "none", fontSize: 14 }}
                    >
                      Suivant →
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
    </>
  );
}
