import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/db/index";

export const metadata: Metadata = { title: "Événements" };

const ITEMS_PER_PAGE = 12;

type SearchParams = { tab?: string; page?: string; categorie?: string };

export default async function ChurchEvenementsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const headersList = await headers();
  const slug = headersList.get("x-eglise-slug");
  if (!slug) redirect("/");

  const eglise = await prisma.eglise.findUnique({ where: { slug } });
  if (!eglise) notFound();

  const { tab = "avenir", page: pageStr, categorie } = await searchParams;
  const isPast = tab === "passes";
  const parsedPage = Number.parseInt(pageStr ?? "1", 10);
  const currentPage = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const skip = (currentPage - 1) * ITEMS_PER_PAGE;
  const now = new Date();

  const where = {
    egliseId: eglise.id,
    statutContenu: "publie",
    ...(isPast ? { dateDebut: { lt: now } } : { dateDebut: { gte: now } }),
    ...(categorie ? { categorie } : {}),
  };

  const [total, evenementsList, categories] = await Promise.all([
    prisma.evenement.count({ where }),
    prisma.evenement.findMany({
      where,
      orderBy: { dateDebut: isPast ? "desc" : "asc" },
      skip,
      take: ITEMS_PER_PAGE,
    }),
    prisma.evenement.findMany({
      where: { egliseId: eglise.id, statutContenu: "publie", categorie: { not: null } },
      select: { categorie: true },
      distinct: ["categorie"],
    }),
  ]);

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
  const catList = categories.map((c) => c.categorie).filter(Boolean) as string[];

  const buildHref = (overrides: Partial<Record<string, string | undefined>>) => {
    const params = new URLSearchParams();
    const merged: Record<string, string | undefined> = { tab, page: pageStr, categorie, ...overrides };
    if (merged.tab && merged.tab !== "avenir") params.set("tab", merged.tab);
    if (merged.page && merged.page !== "1") params.set("page", merged.page);
    if (merged.categorie) params.set("categorie", merged.categorie);
    const qs = params.toString();
    return `/c/evenements${qs ? `?${qs}` : ""}`;
  };

  return (
    <>
      {/* Header */}
      <section
        style={{
          background: "linear-gradient(135deg, var(--church-primary, #1e3a8a), #1e2d6b)",
          color: "white", padding: "4rem 1rem", textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: "clamp(1.8rem,4vw,2.5rem)", fontWeight: 900, marginBottom: 10 }}>Événements</h1>
        <p style={{ opacity: 0.8, fontSize: 15 }}>Activités et rassemblements de {eglise.nom}</p>
      </section>

      <section style={{ padding: "3rem 1rem 5rem", background: "#f8fafc", minHeight: "60vh" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 0, marginBottom: 28, border: "1px solid #e2e8f0", borderRadius: 12, overflow: "hidden", width: "fit-content", background: "white" }}>
            {[
              { key: "avenir", label: "À venir" },
              { key: "passes", label: "Passés" },
            ].map((t) => (
              <Link
                key={t.key}
                href={buildHref({ tab: t.key, page: "1" })}
                style={{
                  padding: "10px 28px", fontSize: 14, fontWeight: 600,
                  background: tab === t.key ? "var(--church-primary, #1e3a8a)" : "transparent",
                  color: tab === t.key ? "white" : "#64748b",
                  textDecoration: "none",
                }}
              >
                {t.label}
              </Link>
            ))}
          </div>

          {/* Category filters */}
          {catList.length > 0 && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 28 }}>
              <Link
                href={buildHref({ categorie: undefined, page: "1" })}
                style={{
                  padding: "5px 14px", borderRadius: 99, fontSize: 13, fontWeight: 600,
                  background: !categorie ? "var(--church-primary, #1e3a8a)" : "#e2e8f0",
                  color: !categorie ? "white" : "#475569", textDecoration: "none",
                }}
              >
                Tous
              </Link>
              {catList.map((cat) => (
                <Link
                  key={cat}
                  href={buildHref({ categorie: cat, page: "1" })}
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

          {evenementsList.length === 0 ? (
            <div style={{ textAlign: "center", padding: "5rem", background: "white", borderRadius: 16, border: "1px dashed #e2e8f0" }}>
              <div style={{ fontSize: 52, marginBottom: 16 }}>📅</div>
              <h3 style={{ color: "var(--church-primary, #1e3a8a)", fontWeight: 700, marginBottom: 8 }}>
                {isPast ? "Aucun événement passé" : "Aucun événement à venir"}
              </h3>
              <p style={{ color: "#64748b" }}>
                {isPast ? "Les événements précédents apparaîtront ici." : "Les prochains événements seront publiés ici."}
              </p>
            </div>
          ) : (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.25rem" }}>
                {evenementsList.map((evt) => (
                  <Link key={evt.id} href={`/c/evenements/${evt.id}`} style={{ textDecoration: "none" }}>
                    <article
                      style={{
                        background: "white", borderRadius: 16, overflow: "hidden",
                        border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                        display: "flex", flexDirection: "column", height: "100%",
                        opacity: isPast ? 0.8 : 1,
                      }}
                    >
                      {evt.imageUrl ? (
                        <div style={{ height: 180, overflow: "hidden", flexShrink: 0, position: "relative" }}>
                          <img src={evt.imageUrl} alt={evt.titre} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                          <div style={{
                            position: "absolute", top: 12, left: 12,
                            background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)",
                            color: "white", borderRadius: 10, padding: "6px 12px", textAlign: "center",
                          }}>
                            <div style={{ fontSize: 20, fontWeight: 900, lineHeight: 1 }}>{new Date(evt.dateDebut).getDate()}</div>
                            <div style={{ fontSize: 11, opacity: 0.85 }}>{new Date(evt.dateDebut).toLocaleString("fr-FR", { month: "short" }).toUpperCase()}</div>
                          </div>
                        </div>
                      ) : (
                        <div style={{
                          height: 90, background: "linear-gradient(135deg, var(--church-primary, #1e3a8a), #1e2d6b)",
                          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                        }}>
                          <div style={{ textAlign: "center", color: "white" }}>
                            <div style={{ fontSize: 28, fontWeight: 900, lineHeight: 1 }}>{new Date(evt.dateDebut).getDate()}</div>
                            <div style={{ fontSize: 13, opacity: 0.85 }}>{new Date(evt.dateDebut).toLocaleString("fr-FR", { month: "short", year: "numeric" })}</div>
                          </div>
                        </div>
                      )}
                      <div style={{ padding: "1.25rem", flex: 1, display: "flex", flexDirection: "column" }}>
                        <h2 style={{ fontWeight: 700, color: "#0f172a", margin: "0 0 8px", fontSize: 16, lineHeight: 1.35 }}>
                          {evt.titre}
                        </h2>
                        {evt.lieu && (
                          <p style={{ color: "#64748b", fontSize: 13, margin: "0 0 6px" }}>📍 {evt.lieu}</p>
                        )}
                        <p style={{ color: "#64748b", fontSize: 12, margin: "0 0 8px" }}>
                          🕐 {new Date(evt.dateDebut).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                          {!evt.imageUrl && ` – ${new Date(evt.dateDebut).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`}
                        </p>
                        {evt.description && (
                          <p style={{ color: "#475569", fontSize: 13, lineHeight: 1.65, margin: 0, flex: 1 }}>
                            {evt.description.length > 120 ? evt.description.slice(0, 120) + "…" : evt.description}
                          </p>
                        )}
                        {evt.categorie && (
                          <span style={{ display: "inline-block", marginTop: 12, fontSize: 11, fontWeight: 600, color: "#64748b" }}>
                            #{evt.categorie}
                          </span>
                        )}
                      </div>
                    </article>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 40, flexWrap: "wrap" }}>
                  {currentPage > 1 && (
                    <Link href={buildHref({ page: String(currentPage - 1) })} style={{ padding: "8px 16px", borderRadius: 8, background: "white", border: "1px solid #e2e8f0", color: "#334155", textDecoration: "none", fontSize: 14 }}>
                      ← Précédent
                    </Link>
                  )}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <Link key={p} href={buildHref({ page: String(p) })} style={{
                      padding: "8px 16px", borderRadius: 8, fontSize: 14, textDecoration: "none",
                      background: p === currentPage ? "var(--church-primary, #1e3a8a)" : "white",
                      border: "1px solid #e2e8f0",
                      color: p === currentPage ? "white" : "#334155",
                      fontWeight: p === currentPage ? 700 : 400,
                    }}>
                      {p}
                    </Link>
                  ))}
                  {currentPage < totalPages && (
                    <Link href={buildHref({ page: String(currentPage + 1) })} style={{ padding: "8px 16px", borderRadius: 8, background: "white", border: "1px solid #e2e8f0", color: "#334155", textDecoration: "none", fontSize: 14 }}>
                      Suivant →
                    </Link>
                  )}
                </div>
              )}
              <p style={{ textAlign: "center", color: "#94a3b8", fontSize: 13, marginTop: 20 }}>
                {total} événement{total > 1 ? "s" : ""}
              </p>
            </>
          )}
        </div>
      </section>
    </>
  );
}
