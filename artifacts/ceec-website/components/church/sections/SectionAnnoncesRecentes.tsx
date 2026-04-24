import Link from "next/link";
import { ChevronRight } from "lucide-react";
import ChurchSectionHeader from "./ChurchSectionHeader";

type AnnonceConfig = {
  titre?: string;
  nombreItems?: number;
  voirPlusLabel?: string;
  bgColor?: string;
};

type Annonce = {
  id: number;
  titre: string;
  contenu: string;
  priorite: string;
  datePublication: Date;
  imageUrl?: string | null;
};

const prioriteClass = (p: string) => {
  if (p === "urgente") return { cls: "bg-red-100 text-red-600", label: "Urgent" };
  if (p === "haute") return { cls: "bg-amber-100 text-amber-600", label: "Important" };
  return { cls: "bg-sky-100 text-sky-700", label: "Information" };
};

export default function SectionAnnoncesRecentes({
  config,
  annonces,
}: {
  config: AnnonceConfig;
  annonces: Annonce[];
}) {
  const { titre = "Dernières annonces", voirPlusLabel = "Voir toutes", bgColor = "#f8fafc" } = config;

  if (annonces.length === 0) return null;

  return (
    <section className="py-20 px-4" style={{ background: bgColor }}>
      <div className="max-w-[920px] mx-auto">
        {/* En-tête avec lien */}
        <div className="flex justify-between items-end mb-8 flex-wrap gap-3">
          <ChurchSectionHeader badge="Actualités" title={titre} align="left" />
          <Link
            href="/c/annonces"
            className="font-semibold text-sm no-underline inline-flex items-center gap-1 mb-10 transition-all hover:gap-2"
            style={{ color: "var(--church-accent, #c59b2e)" }}
          >
            {voirPlusLabel} <ChevronRight size={14} />
          </Link>
        </div>

        {/* Liste */}
        <div className="flex flex-col gap-4">
          {annonces.map((annonce) => {
            const pStyle = prioriteClass(annonce.priorite);
            return (
              <Link key={annonce.id} href={`/c/annonces/${annonce.id}`} className="no-underline">
                <div className="card card-hover flex overflow-hidden">
                  {annonce.imageUrl && (
                    <img
                      src={annonce.imageUrl}
                      alt={annonce.titre}
                      className="w-[120px] min-h-[100px] object-cover shrink-0 hidden sm:block"
                    />
                  )}
                  <div className="p-5 flex-1">
                    <div className="flex justify-between items-start mb-2.5 flex-wrap gap-2">
                      <span className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full ${pStyle.cls}`}>
                        {pStyle.label}
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(annonce.datePublication).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                      </span>
                    </div>
                    <h3 className="font-bold text-foreground text-base mb-1.5">{annonce.titre}</h3>
                    <p className="text-slate-600 text-[13px] leading-relaxed m-0">
                      {annonce.contenu.length > 180 ? annonce.contenu.slice(0, 180) + "…" : annonce.contenu}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
