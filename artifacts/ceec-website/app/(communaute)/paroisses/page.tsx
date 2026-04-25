import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { Church, MapPin, Users, ChevronRight } from "lucide-react";
import { SITE_URL, SITE_NAME } from "@/lib/seo";
import { HeroSection, EmptyState } from "@/components/community";

export const metadata: Metadata = {
  title: "Nos Paroisses",
  description:
    "Découvrez les paroisses de la Communauté des Églises Évangéliques au Congo (CEEC) à travers la République Démocratique du Congo.",
  openGraph: {
    title: `Nos Paroisses | ${SITE_NAME}`,
    description:
      "Retrouvez toutes les paroisses CEEC actives en RDC — adresses, pasteurs, activités et informations pratiques.",
    url: `${SITE_URL}/paroisses`,
    type: "website",
  },
  twitter: {
    card: "summary",
    title: `Nos Paroisses | ${SITE_NAME}`,
    description: "Retrouvez toutes les paroisses CEEC actives en RDC.",
  },
};

async function getData() {
  try {
    const eglises = await prisma.eglise.findMany({
      where: { statut: "actif" },
      orderBy: { nom: "asc" },
      include: { _count: { select: { membres: { where: { statut: "actif" } } } } },
    });
    return eglises;
  } catch {
    return [];
  }
}

export default async function ParoissesPage() {
  const eglises = await getData();

  const villes = [...new Set(eglises.map((e) => e.ville))].sort();
  const totalMembres = eglises.reduce((acc, e) => acc + e._count.membres, 0);

  return (
    <>
      <HeroSection
        badge="Réseau national"
        title="Nos Églises membres"
        description="Découvrez les paroisses de la Communauté des Églises Évangéliques au Congo, présentes dans toutes les provinces de la République Démocratique du Congo."
        actions={[
          { label: "Voir les églises", href: "#liste" },
          { label: "Nous contacter", href: "/contact", variant: "outline" },
        ]}
      />

      {/* Stats bar */}
      {eglises.length > 0 && (
        <section className="bg-white py-10 px-4 border-b border-slate-100">
          <div className="max-w-[900px] mx-auto flex justify-center gap-12 flex-wrap">
            {[
              { value: eglises.length, label: "Paroisses actives", icon: <Church size={24} /> },
              { value: villes.length, label: "Villes", icon: <MapPin size={24} /> },
              { value: totalMembres > 0 ? `${totalMembres}+` : "—", label: "Membres inscrits", icon: <Users size={24} /> },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="flex justify-center text-primary mb-1.5">{s.icon}</div>
                <div className="text-2xl font-black text-primary leading-none">{s.value}</div>
                <div className="text-xs text-muted-foreground mt-1 font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section id="liste" className="py-16 px-4 bg-primary-50">
        <div className="max-w-[1200px] mx-auto">
          {eglises.length === 0 ? (
            <EmptyState
              icon={<Church size={48} strokeWidth={1.5} />}
              title="Aucune église enregistrée"
              description="Les églises seront affichées ici une fois ajoutées par les administrateurs."
            />
          ) : (
            <>
              {/* Grouped by ville */}
              {villes.map((ville) => {
                const villeEglises = eglises.filter((e) => e.ville === ville);
                return (
                  <div key={ville} className="mb-12 last:mb-0">
                    <div className="flex items-center gap-3 mb-5">
                      <MapPin size={18} className="text-secondary" />
                      <h2 className="text-lg font-bold text-primary m-0">{ville}</h2>
                      <span className="text-xs text-muted-foreground bg-primary-100 px-2.5 py-0.5 rounded-full font-semibold">
                        {villeEglises.length} paroisse{villeEglises.length > 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                      {villeEglises.map((eglise) => (
                        <Link key={eglise.id} href={`/paroisses/${eglise.id}`} className="no-underline group">
                          <div className="card card-hover h-full overflow-hidden">
                            {/* Header avec initiale ou logo */}
                            <div className="h-24 flex items-center gap-4 px-5 text-white relative bg-linear-to-br from-primary to-primary-dark">
                              {eglise.logoUrl ? (
                                <img
                                  src={eglise.logoUrl}
                                  alt={eglise.nom}
                                  className="w-14 h-14 rounded-full object-cover border-2 border-secondary/50 shrink-0 relative z-10"
                                />
                              ) : (
                                <div className="w-14 h-14 rounded-full bg-secondary/20 flex items-center justify-center text-2xl font-black text-secondary shrink-0 relative z-10">
                                  {eglise.nom.charAt(0)}
                                </div>
                              )}
                              <div className="relative z-10 min-w-0">
                                <h3 className="font-bold text-base leading-tight text-white m-0 group-hover:text-secondary transition-colors">
                                  {eglise.nom}
                                </h3>
                                {eglise.pasteur && (
                                  <p className="text-xs text-white/60 mt-0.5 m-0">Pst. {eglise.pasteur}</p>
                                )}
                              </div>
                              {/* Halo */}
                              <div className="absolute inset-0 opacity-10" style={{ background: "radial-gradient(circle at 20% 50%, var(--color-secondary), transparent 60%)" }} />
                            </div>

                            {/* Body */}
                            <div className="p-5">
                              {eglise.adresse && (
                                <p className="text-[13px] text-muted-foreground flex items-start gap-1.5 mb-2">
                                  <MapPin size={13} className="shrink-0 mt-0.5 text-slate-400" />
                                  {eglise.adresse}
                                </p>
                              )}
                              {eglise.description && (
                                <p className="text-[13px] text-slate-600 leading-relaxed line-clamp-2 mb-3">
                                  {eglise.description}
                                </p>
                              )}
                              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                                <div className="flex items-center gap-3">
                                  {eglise._count.membres > 0 && (
                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                      <Users size={12} /> {eglise._count.membres}
                                    </span>
                                  )}
                                </div>
                                <span className="text-sm font-semibold text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                                  Détails <ChevronRight size={14} />
                                </span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </section>
    </>
  );
}
