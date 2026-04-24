import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { Church } from "lucide-react";
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

async function getEglises() {
  try {
    return await prisma.eglise.findMany({ where: { statut: "actif" }, orderBy: { nom: "asc" } });
  } catch {
    return [];
  }
}

export default async function ParoissesPage() {
  const eglisesList = await getEglises();

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

      <section id="liste" className="py-16 px-4 bg-primary-50">
        <div className="max-w-[1200px] mx-auto">
          {eglisesList.length === 0 ? (
            <EmptyState
              icon={<Church size={48} strokeWidth={1.5} />}
              title="Aucune église enregistrée"
              description="Les églises seront affichées ici une fois ajoutées par les administrateurs."
            />
          ) : (
            <div className="grid gap-6 grid-cols-[repeat(auto-fill,minmax(320px,1fr))]">
              {eglisesList.map((eglise) => (
                <Link key={eglise.id} href={`/paroisses/${eglise.id}`} className="no-underline">
                  <div className="card card-hover h-full">
                    <div className="h-[180px] flex items-center justify-center text-white text-6xl font-extrabold bg-gradient-to-br from-primary to-primary-dark">
                      {eglise.nom.charAt(0)}
                    </div>
                    <div className="p-6">
                      <h2 className="font-bold text-lg mb-1.5 text-foreground">
                        {eglise.nom}
                      </h2>
                      <p className="text-sm font-semibold mb-3 text-secondary">{eglise.ville}</p>
                      {eglise.pasteur && (
                        <div className="flex items-center gap-1.5 mb-2">
                          <span className="text-sm text-muted-foreground">Pasteur :</span>
                          <span className="text-sm font-semibold text-slate-700">
                            {eglise.pasteur}
                          </span>
                        </div>
                      )}
                      {eglise.adresse && (
                        <p className="text-[13px] leading-relaxed text-muted-foreground">
                          {eglise.adresse}
                        </p>
                      )}
                      {eglise.description && (
                        <p className="text-[13px] mt-3 leading-relaxed text-slate-600">
                          {eglise.description.substring(0, 120)}...
                        </p>
                      )}
                      <div className="mt-4 pt-3 flex items-center justify-between border-t border-slate-100">
                        <span className="text-sm font-semibold text-primary">Voir les détails</span>
                        <span className="text-primary">→</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
