import Link from "next/link";
import { SectionLabel, SectionTitle } from "@/components/community";

interface EglisesSectionProps {
  eglises: any[];
}

export default function EglisesSection({ eglises }: EglisesSectionProps) {
  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-[1280px] mx-auto">

        {/* En-tête */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-12">
          <div>
            <SectionLabel label="Notre réseau" />
            <SectionTitle>Nos Églises membres</SectionTitle>
            <p className="text-muted-foreground">
              Découvrez les paroisses de la CEEC à travers le Congo
            </p>
          </div>
          <Link href="/paroisses"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 shrink-0 hover:text-white border-2 border-primary text-primary">
            Voir toutes les églises
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>

        {eglises.length === 0 ? (
          /* État vide */
          <div className="text-center py-20 rounded-2xl bg-primary-50"
            style={{ border: "2px dashed var(--color-primary-200)" }}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-primary-100 text-primary">
              <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" strokeLinecap="round" />
                <polyline points="9 22 9 12 15 12 15 22" strokeLinecap="round" />
              </svg>
            </div>
            <p className="font-semibold mb-1 text-primary">
              Aucune église enregistrée pour le moment
            </p>
            <p className="text-sm text-muted-foreground">
              Les paroisses apparaîtront ici dès qu&apos;elles seront ajoutées.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {eglises.map((eglise) => (
              <Link key={eglise.id} href={`/paroisses/${eglise.id}`}
                className="group block rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                {/* Barre tricolore CEEC */}
                <div className="h-1.5"
                  style={{ background: "linear-gradient(90deg, var(--color-primary) 0%, var(--color-secondary) 50%, var(--color-accent) 100%)" }} />
                {/* Visuel */}
                <div className="h-28 flex items-center justify-center text-5xl font-black text-white relative"
                  style={{ background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-900) 100%)" }}>
                  <span className="relative z-10">{eglise.nom.charAt(0)}</span>
                  {/* Halo */}
                  <div className="absolute inset-0 opacity-10"
                    style={{ background: "radial-gradient(circle at 30% 30%, var(--color-secondary), transparent 60%)" }} />
                </div>
                {/* Infos */}
                <div className="p-5 bg-white border border-primary-100 border-t-0">
                  <h3 className="font-bold text-base mb-2 transition-colors group-hover:text-blue-700 text-foreground">
                    {eglise.nom}
                  </h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-secondary-100 text-secondary-800">
                      <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3" stroke="currentColor" strokeWidth="2.5">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" strokeLinecap="round" />
                        <circle cx="12" cy="9" r="2.5" />
                      </svg>
                      {eglise.ville}
                    </span>
                    {eglise.pasteur && (
                      <span className="text-xs text-muted-foreground">
                        Pst. {eglise.pasteur}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
