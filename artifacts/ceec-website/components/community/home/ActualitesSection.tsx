import Link from "next/link";
import { ChevronRight, AlertCircle } from "lucide-react";
import { SectionLabel, SectionTitle } from "@/components/community";

interface ActualitesSectionProps {
  annonces: any[];
  evenements: any[];
}

export default function ActualitesSection({ annonces, evenements }: ActualitesSectionProps) {
  return (
    <section className="py-24 px-6 bg-primary-50">
      <div className="max-w-[1280px] mx-auto">

        {/* En-tête */}
        <div className="text-center mb-14">
          <SectionLabel label="Actualités" />
          <SectionTitle>Annonces & Événements</SectionTitle>
          <p className="max-w-md mx-auto text-muted-foreground">
            Restez informé de la vie de la communauté CEEC
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* ── Annonces ── */}
          <div>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-lg flex items-center gap-2 text-primary font-display">
                <span className="w-2 h-6 rounded-full inline-block bg-secondary" />
                Annonces
              </h3>
              <Link href="/annonces" className="text-sm font-semibold transition-colors text-secondary inline-flex items-center gap-1">
                Tout voir <ChevronRight size={14} />
              </Link>
            </div>

            {annonces.length === 0 ? (
              <div className="py-10 px-6 rounded-2xl text-center text-sm bg-white text-muted-foreground"
                style={{ border: "1.5px dashed var(--color-primary-200)" }}>
                Aucune annonce pour le moment.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {annonces.map((annonce) => (
                  <div key={annonce.id}
                    className="rounded-2xl p-5 transition-shadow hover:shadow-md bg-white border border-primary-100">
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider"
                        style={annonce.priorite === "urgente"
                          ? { background: "var(--color-accent-100)", color: "var(--color-accent-700)" }
                          : { background: "var(--color-primary-100)", color: "var(--color-primary-700)" }
                        }>
                        {annonce.priorite === "urgente" ? <span className="inline-flex items-center gap-1"><AlertCircle size={11} /> Urgent</span> : "Info"}
                      </span>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm mb-1 text-foreground">
                          {annonce.titre}
                        </h4>
                        <p className="text-xs leading-relaxed text-muted-foreground">
                          {annonce.contenu.substring(0, 120)}
                          {annonce.contenu.length > 120 ? "…" : ""}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Événements ── */}
          <div>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-lg flex items-center gap-2 text-primary font-display">
                <span className="w-2 h-6 rounded-full inline-block bg-primary" />
                Événements à venir
              </h3>
              <Link href="/evenements" className="text-sm font-semibold transition-colors text-secondary inline-flex items-center gap-1">
                Tout voir <ChevronRight size={14} />
              </Link>
            </div>

            {evenements.length === 0 ? (
              <div className="py-10 px-6 rounded-2xl text-center text-sm bg-white text-muted-foreground"
                style={{ border: "1.5px dashed var(--color-primary-200)" }}>
                Aucun événement planifié pour le moment.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {evenements.map((evt) => (
                  <div key={evt.id}
                    className="rounded-2xl p-5 flex gap-4 items-start transition-shadow hover:shadow-md bg-white border border-primary-100">
                    {/* Calendrier */}
                    <div className="shrink-0 w-14 h-14 rounded-xl flex flex-col items-center justify-center text-white overflow-hidden bg-primary">
                      <span className="text-lg font-extrabold leading-none">
                        {new Date(evt.dateDebut).getDate()}
                      </span>
                      <span className="text-[9px] uppercase opacity-80 font-bold tracking-widest">
                        {new Date(evt.dateDebut).toLocaleString("fr-FR", { month: "short" })}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm mb-1 leading-snug text-foreground">
                        {evt.titre}
                      </h4>
                      {evt.lieu && (
                        <p className="text-xs flex items-center gap-1.5 text-muted-foreground">
                          <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3 shrink-0" stroke="currentColor" strokeWidth="2.5">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" strokeLinecap="round" />
                            <circle cx="12" cy="9" r="2.5" />
                          </svg>
                          {evt.lieu}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
