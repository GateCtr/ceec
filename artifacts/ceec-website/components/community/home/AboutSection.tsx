import Link from "next/link";
import { Check, User, ArrowRight } from "lucide-react";
import { SectionLabel, SectionTitle } from "@/components/community";

const highlights = [
  "Fondée le 12 janvier 2009 — ASBL, Pers. juridique N°609/Cab/JU & DH/2011",
  "Paroisses à Kinshasa, Haut-Katanga, Lualaba, Haut Lomami et Équateur",
  "Formation de pasteurs, diacres et leaders laïcs",
];

export default function AboutSection() {
  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-[1280px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Texte */}
          <div>
            <SectionLabel label="Qui sommes-nous" />
            <SectionTitle>Une communauté fondée sur la foi et l&apos;unité</SectionTitle>
            <p className="leading-relaxed mb-6 text-base text-muted-foreground">
              La <strong className="text-primary">Communauté des Églises Évangéliques au Congo</strong> (CEEC)
              est une association sans but lucratif fondée le <strong className="text-primary">12 janvier 2009</strong> à
              Kinshasa, ancrée dans les valeurs de l&apos;Évangile et présente à travers la République Démocratique du Congo.
            </p>
            <p className="leading-relaxed mb-6 text-base text-muted-foreground">
              Notre mission : prêcher l&apos;Évangile éternel, faire des disciples de Jésus-Christ
              et promouvoir les œuvres sociales — depuis la RDC jusqu&apos;à l&apos;Afrique et le monde entier
              (Matthieu 28&nbsp;: 19-20&nbsp;; Jacques 1&nbsp;: 27).
            </p>

            {/* Points forts */}
            <div className="flex flex-col gap-3 mb-8">
              {highlights.map((point) => (
                <div key={point} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 bg-secondary text-primary-900">
                    <Check size={12} strokeWidth={3} />
                  </div>
                  <span className="text-sm font-medium text-foreground">{point}</span>
                </div>
              ))}
            </div>

            {/* Leadership */}
            <div className="rounded-xl px-5 py-4 flex items-center gap-4 bg-primary-50 border border-primary-100">
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-primary text-white">
                <User size={20} strokeWidth={1.8} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-0.5 text-secondary-800">
                  Président Communautaire &amp; Représentant Légal
                </p>
                <p className="text-sm font-semibold text-primary">
                  Évêque Missionnaire MPANGA MUKUTU Pozard
                </p>
                <p className="text-xs mt-0.5 text-muted-foreground">
                  N°04 bis, Av. SAULONA, Q/Musey, C/Ngaliema — Kinshasa, RDC
                </p>
              </div>
            </div>

            <div className="mt-10">
              <Link
                href="/a-propos"
                className="inline-flex items-center gap-2 font-semibold text-sm transition-colors text-primary hover:text-primary-800"
              >
                En savoir plus sur la CEEC
                <ArrowRight size={16} strokeWidth={2.5} />
              </Link>
            </div>
          </div>

          {/* Emblème + citation */}
          <div className="relative flex items-center justify-center">
            {/* Cercle décoratif de fond */}
            <div className="absolute w-80 h-80 rounded-full bg-primary-50 border-2 border-dashed border-primary-200" />
            <div className="absolute w-64 h-64 rounded-full bg-primary-100" />

            {/* Logo central */}
            <div className="relative z-10 flex flex-col items-center gap-6">
              <img
                src="/ceec-emblem.svg"
                alt="Emblème CEEC"
                width={140}
                height={140}
                className="drop-shadow-xl"
              />

              {/* Filet or sous le logo */}
              <div className="h-px w-24 bg-secondary" />

              <div className="text-center max-w-xs">
                <p className="font-bold text-lg italic text-primary font-display">
                  &ldquo;Allez, faites de toutes les nations des disciples&rdquo;
                </p>
                <p className="text-xs font-semibold uppercase tracking-widest mt-1 text-secondary">
                  Matthieu 28 : 19-20
                </p>
              </div>
            </div>

            {/* Bulle décorative — année */}
            <div
              className="absolute -bottom-4 -right-4 lg:right-8 w-20 h-20 rounded-2xl flex flex-col items-center justify-center shadow-lg z-10 bg-secondary"
              style={{ transform: "rotate(6deg)" }}
            >
              <span className="text-xs font-bold uppercase tracking-wide text-primary-900">Depuis</span>
              <span className="text-2xl font-extrabold leading-none text-primary-900 font-display">2009</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
