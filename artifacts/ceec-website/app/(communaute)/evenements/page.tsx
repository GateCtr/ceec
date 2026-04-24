import { prisma } from "@/lib/db";
import Link from "next/link";
import { getVisibiliteFilter } from "@/lib/auth/visibility";
import { Calendar, MapPin, Clock } from "lucide-react";
import type { Metadata } from "next";
import { SITE_URL, SITE_NAME } from "@/lib/seo";
import { HeroSection, EmptyState, Pagination, CategoryFilter } from "@/components/community";

export const metadata: Metadata = {
  title: "Événements",
  description:
    "Agenda des événements, rassemblements et activités organisés par les paroisses de la CEEC.",
  openGraph: {
    title: `Événements | ${SITE_NAME}`,
    description:
      "Agenda des événements, rassemblements et activités organisés par les paroisses de la CEEC en RDC.",
    url: `${SITE_URL}/evenements`,
    type: "website",
  },
  twitter: {
    card: "summary",
    title: `Événements | ${SITE_NAME}`,
    description: "Agenda des événements CEEC en RDC.",
  },
};

const ITEMS_PER_PAGE = 12;

type SearchParams = { tab?: string; page?: string; categorie?: string };

export default async function EvenementsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const visibiliteFilter = await getVisibiliteFilter();

  const { tab = "avenir", page: pageStr, categorie } = await searchParams;
  const isPast = tab === "passes";
  const parsedPage = Number.parseInt(pageStr ?? "1", 10);
  const currentPage = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const skip = (currentPage - 1) * ITEMS_PER_PAGE;
  const now = new Date();

  const where = {
    statutContenu: "publie" as const,
    visibilite: { in: visibiliteFilter },
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
      where: { statutContenu: "publie" as const, visibilite: { in: visibiliteFilter }, categorie: { not: null } },
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
    return `/evenements${qs ? `?${qs}` : ""}`;
  };

  return (
    <>
      <HeroSection
        badge="Agenda communautaire"
        title="Événements à venir"
        description="Retrouvez tous les événements organisés par les paroisses de la CEEC à travers la République Démocratique du Congo."
        size="compact"
      />

      <section className="py-12 px-4 min-h-[50vh] bg-primary-50">
        <div className="max-w-[1000px] mx-auto">
          {/* Tabs */}
          <div className="flex mb-7 rounded-xl overflow-hidden w-fit bg-white border border-border">
            {[
              { key: "avenir", label: "À venir" },
              { key: "passes", label: "Passés" },
            ].map((t) => (
              <Link
                key={t.key}
                href={buildHref({ tab: t.key, page: "1" })}
                className={`px-7 py-2.5 text-sm font-semibold transition-colors ${
                  tab === t.key ? "bg-primary text-white" : "text-muted-foreground"
                }`}
              >
                {t.label}
              </Link>
            ))}
          </div>

          <CategoryFilter
            categories={catList}
            currentCategory={categorie}
            buildHref={(cat) => buildHref({ categorie: cat, page: "1" })}
          />

          {evenementsList.length === 0 ? (
            <EmptyState
              icon={<Calendar size={52} strokeWidth={1.5} />}
              title={isPast ? "Aucun événement passé" : "Aucun événement à venir"}
              description={
                isPast
                  ? "Les événements précédents apparaîtront ici."
                  : "Les prochains événements seront publiés ici."
              }
            />
          ) : (
            <>
              <div className="grid gap-5 grid-cols-[repeat(auto-fill,minmax(300px,1fr))]">
                {evenementsList.map((evt) => (
                  <Link key={evt.id} href={`/evenements/${evt.id}`} className="no-underline">
                    <article
                      className={`card card-hover flex flex-col h-full ${isPast ? "opacity-80" : ""}`}
                    >
                      {evt.imageUrl ? (
                        <div className="h-[180px] overflow-hidden shrink-0 relative">
                          <img
                            src={evt.imageUrl}
                            alt={evt.titre}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-3 left-3 rounded-[10px] px-3 py-1.5 text-center text-white bg-black/65 backdrop-blur-sm">
                            <div className="text-xl font-black leading-none">
                              {new Date(evt.dateDebut).getDate()}
                            </div>
                            <div className="text-[11px] opacity-85">
                              {new Date(evt.dateDebut)
                                .toLocaleString("fr-FR", { month: "short" })
                                .toUpperCase()}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="h-[90px] flex items-center justify-center shrink-0 text-white bg-gradient-to-br from-primary to-primary-dark">
                          <div className="text-center">
                            <div className="text-[28px] font-black leading-none">
                              {new Date(evt.dateDebut).getDate()}
                            </div>
                            <div className="text-[13px] opacity-85">
                              {new Date(evt.dateDebut).toLocaleString("fr-FR", {
                                month: "short",
                                year: "numeric",
                              })}
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="p-5 flex-1 flex flex-col">
                        <h2 className="font-bold text-base mb-2 leading-snug text-foreground">
                          {evt.titre}
                        </h2>
                        {evt.lieu && (
                          <p className="text-[13px] mb-1.5 flex items-center gap-1.5 text-muted-foreground">
                            <MapPin size={13} />
                            {evt.lieu}
                          </p>
                        )}
                        <p className="text-xs mb-2 flex items-center gap-1.5 text-muted-foreground">
                          <Clock size={13} />
                          {new Date(evt.dateDebut).toLocaleDateString("fr-FR", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                        {evt.description && (
                          <p className="text-[13px] leading-relaxed flex-1 text-slate-600">
                            {evt.description.length > 120
                              ? evt.description.slice(0, 120) + "…"
                              : evt.description}
                          </p>
                        )}
                        <div className="flex gap-1.5 mt-3 flex-wrap items-center">
                          {evt.categorie && (
                            <span className="text-[11px] font-semibold text-muted-foreground">
                              #{evt.categorie}
                            </span>
                          )}
                          {evt.videoUrl && (
                            <span className="badge badge-success text-[11px]">Vidéo</span>
                          )}
                        </div>
                        {!isPast && (
                          <div className="mt-3.5">
                            <span className="btn btn-primary btn-sm">Voir les détails</span>
                          </div>
                        )}
                      </div>
                    </article>
                  </Link>
                ))}
              </div>

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                total={total}
                itemName="événement"
                buildHref={(p) => buildHref({ page: String(p) })}
              />
            </>
          )}
        </div>
      </section>
    </>
  );
}
