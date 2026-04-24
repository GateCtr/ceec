import { prisma } from "@/lib/db";
import Link from "next/link";
import { getVisibiliteFilter } from "@/lib/auth/visibility";
import { Megaphone } from "lucide-react";
import type { Metadata } from "next";
import { SITE_URL, SITE_NAME } from "@/lib/seo";
import { HeroSection, EmptyState, Pagination, CategoryFilter } from "@/components/community";

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
  if (p === "urgente") return { cls: "bg-red-100 text-red-600 border-red-300", label: "Urgent" };
  if (p === "haute") return { cls: "bg-amber-100 text-amber-600 border-amber-300", label: "Important" };
  return { cls: "bg-sky-100 text-sky-700 border-sky-300", label: "Information" };
};

type SearchParams = { page?: string; categorie?: string };

export default async function AnnoncesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const visibiliteFilter = await getVisibiliteFilter();

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
      <HeroSection
        badge="Actualités CEEC"
        title="Annonces & Nouvelles"
        description="Dernières communications officielles et avis importants de la Communauté des Églises Évangéliques au Congo."
        size="compact"
      />

      <section className="py-12 px-4 min-h-[50vh] bg-primary-50">
        <div className="max-w-[1000px] mx-auto">
          <CategoryFilter
            categories={catList}
            currentCategory={categorie}
            allLabel="Toutes"
            buildHref={(cat) =>
              cat ? `/annonces?categorie=${encodeURIComponent(cat)}` : "/annonces"
            }
          />

          {annoncesList.length === 0 ? (
            <EmptyState
              icon={<Megaphone size={52} strokeWidth={1.5} />}
              title="Aucune annonce pour le moment"
              description="Les nouvelles annonces de la CEEC seront publiées ici."
            />
          ) : (
            <>
              <div className="grid gap-5 grid-cols-[repeat(auto-fill,minmax(300px,1fr))]">
                {annoncesList.map((annonce) => {
                  const pStyle = prioriteStyle(annonce.priorite);
                  return (
                    <Link key={annonce.id} href={`/annonces/${annonce.id}`} className="no-underline">
                      <article className="card card-hover flex flex-col h-full">
                        {annonce.imageUrl && (
                          <div className="h-[180px] overflow-hidden shrink-0">
                            <img
                              src={annonce.imageUrl}
                              alt={annonce.titre}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="p-5 flex-1 flex flex-col">
                          <div className="flex justify-between items-start mb-2.5 gap-2">
                            <span className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${pStyle.cls}`}>
                              {pStyle.label}
                            </span>
                            <span className="text-xs shrink-0 text-slate-400">
                              {new Date(annonce.datePublication).toLocaleDateString("fr-FR", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                          <h2 className="font-bold text-base mb-2 leading-snug text-foreground">
                            {annonce.titre}
                          </h2>
                          <p className="text-[13px] leading-relaxed flex-1 text-slate-600">
                            {annonce.contenu.length > 160
                              ? annonce.contenu.slice(0, 160) + "…"
                              : annonce.contenu}
                          </p>
                          <div className="flex gap-1.5 mt-3 flex-wrap">
                            {annonce.categorie && (
                              <span className="text-[11px] font-semibold text-muted-foreground">
                                #{annonce.categorie}
                              </span>
                            )}
                            {annonce.videoUrl && (
                              <span className="badge badge-success text-[11px]">Vidéo</span>
                            )}
                          </div>
                        </div>
                      </article>
                    </Link>
                  );
                })}
              </div>

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                total={total}
                itemName="annonce"
                buildHref={(p) =>
                  `/annonces?page=${p}${categorie ? `&categorie=${encodeURIComponent(categorie)}` : ""}`
                }
              />
            </>
          )}
        </div>
      </section>
    </>
  );
}
