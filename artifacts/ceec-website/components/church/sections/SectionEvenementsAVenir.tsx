import Link from "next/link";
import { ChevronRight, MapPin } from "lucide-react";
import ChurchSectionHeader from "./ChurchSectionHeader";

type EvenementConfig = {
  titre?: string;
  nombreItems?: number;
  voirPlusLabel?: string;
  bgColor?: string;
};

type Evenement = {
  id: number;
  titre: string;
  description?: string | null;
  lieu?: string | null;
  dateDebut: Date;
  dateFin?: Date | null;
  imageUrl?: string | null;
};

export default function SectionEvenementsAVenir({
  config,
  evenements,
}: {
  config: EvenementConfig;
  evenements: Evenement[];
}) {
  const { titre = "Prochains événements", voirPlusLabel = "Voir tous", bgColor = "#ffffff" } = config;

  if (evenements.length === 0) return null;

  return (
    <section className="py-20 px-4" style={{ background: bgColor }}>
      <div className="max-w-[920px] mx-auto">
        {/* En-tête avec lien */}
        <div className="flex justify-between items-end mb-8 flex-wrap gap-3">
          <ChurchSectionHeader badge="Agenda" title={titre} align="left" />
          <Link
            href="/c/evenements"
            className="font-semibold text-sm no-underline inline-flex items-center gap-1 mb-10 transition-all hover:gap-2"
            style={{ color: "var(--church-accent, #c59b2e)" }}
          >
            {voirPlusLabel} <ChevronRight size={14} />
          </Link>
        </div>

        {/* Liste */}
        <div className="flex flex-col gap-4">
          {evenements.map((evt) => (
            <Link key={evt.id} href={`/c/evenements/${evt.id}`} className="no-underline">
              <div className="card card-hover flex overflow-hidden">
                {/* Date badge */}
                <div
                  className="w-[90px] shrink-0 flex flex-col items-center justify-center text-white p-4"
                  style={{ background: "linear-gradient(135deg, var(--church-primary, #1e3a8a), color-mix(in srgb, var(--church-primary, #1e3a8a) 80%, black))" }}
                >
                  <div className="text-[28px] font-black leading-none">
                    {new Date(evt.dateDebut).getDate()}
                  </div>
                  <div className="text-xs opacity-85 mt-0.5">
                    {new Date(evt.dateDebut).toLocaleString("fr-FR", { month: "short" }).toUpperCase()}
                  </div>
                  <div className="text-[11px] opacity-65 mt-0.5">
                    {new Date(evt.dateDebut).getFullYear()}
                  </div>
                </div>

                {/* Image optionnelle */}
                {evt.imageUrl && (
                  <img
                    src={evt.imageUrl}
                    alt={evt.titre}
                    className="w-[120px] object-cover shrink-0 hidden sm:block"
                  />
                )}

                {/* Contenu */}
                <div className="p-5 flex-1">
                  <h3 className="font-bold text-foreground text-base mb-1.5">{evt.titre}</h3>
                  {evt.lieu && (
                    <p className="text-muted-foreground text-[13px] mb-1.5 flex items-center gap-1">
                      <MapPin size={12} /> {evt.lieu}
                    </p>
                  )}
                  {evt.description && (
                    <p className="text-slate-600 text-[13px] leading-relaxed m-0">
                      {evt.description.length > 140 ? evt.description.slice(0, 140) + "…" : evt.description}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
