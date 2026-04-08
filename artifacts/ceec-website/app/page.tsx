import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { prisma } from "@/lib/db";

async function getData() {
  try {
    const [eglisesList, annoncesList, evenementsList] = await Promise.all([
      prisma.eglise.findMany({ where: { statut: "actif" }, take: 6, orderBy: { nom: "asc" } }),
      prisma.annonce.findMany({ where: { publie: true }, orderBy: { datePublication: "desc" }, take: 3 }),
      prisma.evenement.findMany({ where: { publie: true }, orderBy: { dateDebut: "asc" }, take: 3 }),
    ]);
    return { eglisesList, annoncesList, evenementsList };
  } catch {
    return { eglisesList: [], annoncesList: [], evenementsList: [] };
  }
}

const stats = [
  { valeur: "50+", label: "Églises membres" },
  { valeur: "26", label: "Villes couvertes" },
  { valeur: "100k+", label: "Fidèles" },
  { valeur: "1960", label: "Année de fondation" },
];

const missions = [
  {
    titre: "Évangélisation",
    desc: "Partager la Bonne Nouvelle dans toutes les provinces du Congo, des grandes villes aux villages les plus reculés.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    titre: "Formation",
    desc: "Former des leaders chrétiens solides, des pasteurs et diacres capables de servir avec intégrité et sagesse.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 7h6M9 11h4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    titre: "Service communautaire",
    desc: "Servir le peuple congolais à travers l'aide sociale, les soins médicaux et l'éducation dans nos communautés.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="currentColor" strokeWidth="1.8">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="9" cy="7" r="4" strokeLinecap="round" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

const valeurs = [
  {
    titre: "La Foi",
    desc: "Une foi solide fondée sur la Parole de Dieu, vécue au quotidien dans nos communautés à travers tout le Congo.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 2v8M12 14v8M4 12h16" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    titre: "La Fraternité",
    desc: "Des liens fraternels forts entre toutes les églises membres de la CEEC, unies dans un même esprit.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="currentColor" strokeWidth="1.8">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeLinecap="round" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    titre: "Le Service",
    desc: "Un engagement constant au service de la communauté congolaise, dans le respect, l'amour et la dignité.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="currentColor" strokeWidth="1.8">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    titre: "La Prière",
    desc: "La prière comme fondement de notre vie communautaire et de chacune de nos actions quotidiennes.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="currentColor" strokeWidth="1.8">
        <path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" strokeLinecap="round" />
        <line x1="6" y1="1" x2="6" y2="4" strokeLinecap="round" />
        <line x1="10" y1="1" x2="10" y2="4" strokeLinecap="round" />
        <line x1="14" y1="1" x2="14" y2="4" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default async function HomePage() {
  const { eglisesList, annoncesList, evenementsList } = await getData();

  return (
    <>
      <Navbar />
      <main>

        {/* ——— HERO ——— */}
        {/* -mt-16 tire le hero sous la navbar sticky (h-16) pour un fond continu */}
        <section className="relative overflow-hidden text-white -mt-16 pt-44 pb-24 min-h-[80vh] flex flex-col justify-center">
          {/* Photo de l'église */}
          <Image
            src="/church-hero.png"
            alt="Église de la CEEC"
            fill
            className="object-cover object-center"
            priority
          />

          {/* Superposition dégradée bleu CEEC */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg,rgba(30,58,138,0.88) 0%,rgba(14,23,60,0.93) 55%,rgba(8,12,28,0.97) 100%)",
            }}
          />

          {/* Motif croix en overlay subtil */}
          <div className="absolute inset-0 pointer-events-none" aria-hidden>
            <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="crosses" width="60" height="60" patternUnits="userSpaceOnUse">
                  <path d="M30 10v20M20 20h20" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#crosses)" />
            </svg>
            {/* Halo or en bas à droite */}
            <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full opacity-[0.06] bg-secondary blur-[80px]" />
          </div>

          <div className="relative max-w-3xl mx-auto px-4 text-center">
            {/* Badge animé */}
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 rounded-full bg-secondary/30 animate-ping opacity-60" />
              <div className="relative text-xs font-semibold tracking-widest uppercase px-5 py-1.5 rounded-full bg-secondary/15 border border-secondary/45 text-gold">
                Communauté des Églises Évangéliques au Congo
              </div>
            </div>

            <h1
              className="font-extrabold leading-tight mb-5 text-3xl sm:text-4xl md:text-5xl lg:text-6xl [text-shadow:0_2px_16px_rgba(0,0,0,0.3)]"
            >
              Ensemble dans la Foi,
              <br />
              <span className="text-gold">unis pour le Congo</span>
            </h1>

            <p className="mx-auto mb-10 leading-relaxed text-white/80 max-w-xl text-base md:text-lg">
              La CEEC regroupe des dizaines d&apos;églises évangéliques à travers toutes les
              provinces du Congo, toutes unies dans la foi, la prière et le service au peuple congolais.
            </p>

            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/paroisses"
                className="px-8 py-3.5 rounded-lg font-bold text-base text-primary bg-secondary transition-all duration-200 hover:brightness-110"
              >
                Nos Églises
              </Link>
              <Link
                href="/sign-up"
                className="px-8 py-3.5 rounded-lg font-semibold text-base text-white bg-white/[0.12] border border-white/[0.28] transition-all duration-200 hover:bg-white/25"
              >
                Rejoindre la CEEC
              </Link>
            </div>
          </div>

          {/* Bande stats */}
          <div className="relative max-w-4xl mx-auto px-4 mt-14">
            <div className="grid grid-cols-2 md:grid-cols-4 bg-white/[0.06] border border-white/[0.12] rounded-2xl overflow-hidden">
              {stats.map((stat, idx) => (
                <div
                  key={stat.label}
                  className={`flex flex-col items-center justify-center py-5 px-4 text-center ${
                    idx < stats.length - 1 ? "border-r border-white/[0.12]" : ""
                  }`}
                >
                  <span className="font-extrabold text-2xl md:text-3xl leading-none mb-1 text-gold">
                    {stat.valeur}
                  </span>
                  <span className="text-xs text-white/60 font-medium uppercase tracking-wide">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ——— NOS MISSIONS ——— */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-[1280px] mx-auto">
            <div className="text-center mb-12">
              <p className="text-xs font-bold uppercase tracking-widest mb-2 text-secondary">
                Nos piliers
              </p>
              <h2 className="text-3xl font-bold mb-3 text-primary">
                Nos Missions
              </h2>
              <p className="text-slate-500 max-w-lg mx-auto leading-relaxed">
                Trois engagements fondamentaux qui guident l&apos;action de la CEEC
                au service de la nation congolaise.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {missions.map((mission, i) => (
                <div
                  key={mission.titre}
                  className={`group flex flex-col p-7 rounded-2xl transition-all duration-200 hover:shadow-lg border ${
                    i === 1
                      ? "bg-primary border-transparent"
                      : "bg-muted border-border"
                  }`}
                >
                  <div
                    className={`w-14 h-14 rounded-xl flex items-center justify-center mb-5 ${
                      i === 1
                        ? "bg-secondary/20 text-gold"
                        : "bg-primary/8 text-primary"
                    }`}
                  >
                    {mission.icon}
                  </div>
                  <h3
                    className={`text-lg font-bold mb-3 ${
                      i === 1 ? "text-white" : "text-foreground"
                    }`}
                  >
                    {mission.titre}
                  </h3>
                  <p
                    className={`text-sm leading-relaxed ${
                      i === 1 ? "text-white/70" : "text-slate-500"
                    }`}
                  >
                    {mission.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ——— VALEURS ——— */}
        <section className="py-20 px-4 bg-muted">
          <div className="max-w-[1280px] mx-auto">
            <div className="text-center mb-12">
              <p className="text-xs font-bold uppercase tracking-widest mb-2 text-secondary">
                Ce qui nous unit
              </p>
              <h2 className="text-3xl font-bold mb-3 text-primary">
                Nos Valeurs Fondamentales
              </h2>
              <p className="text-slate-500 max-w-md mx-auto leading-relaxed">
                Ces valeurs guident chacune de nos églises et notre engagement
                envers Dieu et la nation.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {valeurs.map((valeur) => (
                <div
                  key={valeur.titre}
                  className="bg-white rounded-2xl p-7 text-center border border-border transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
                >
                  <div className="w-14 h-14 rounded-xl bg-primary/7 text-primary flex items-center justify-center mx-auto mb-4">
                    {valeur.icon}
                  </div>
                  <h3 className="text-base font-bold mb-2 text-primary">
                    {valeur.titre}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    {valeur.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ——— ÉGLISES ——— */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-[1280px] mx-auto">
            <div className="flex justify-between items-end mb-10 flex-wrap gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-1 text-secondary">
                  Notre réseau
                </p>
                <h2 className="text-3xl font-bold text-primary">Nos Églises</h2>
                <p className="text-slate-500 mt-1">
                  Découvrez les églises membres de la CEEC
                </p>
              </div>
              <Link
                href="/paroisses"
                className="px-5 py-2.5 rounded-lg text-sm font-semibold border-2 border-primary text-primary transition-all duration-200 hover:bg-primary hover:text-white"
              >
                Voir toutes les églises →
              </Link>
            </div>

            {eglisesList.length === 0 ? (
              <div className="text-center py-16 rounded-2xl bg-muted border-2 border-dashed border-border">
                <div className="w-16 h-16 rounded-full bg-primary/7 text-primary flex items-center justify-center mx-auto mb-4">
                  <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8" stroke="currentColor" strokeWidth="1.5">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" strokeLinecap="round" />
                    <polyline points="9 22 9 12 15 12 15 22" strokeLinecap="round" />
                  </svg>
                </div>
                <p className="text-slate-500 font-medium">
                  Les églises seront affichées ici une fois ajoutées par les administrateurs.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {eglisesList.map((eglise) => (
                  <Link
                    key={eglise.id}
                    href={`/paroisses/${eglise.id}`}
                    className="group block rounded-2xl overflow-hidden border border-border transition-all duration-200 hover:shadow-xl hover:-translate-y-1"
                  >
                    {/* Barre couleur CEEC */}
                    <div className="h-2 bg-[linear-gradient(90deg,var(--color-primary),var(--color-secondary))]" />
                    {/* Initiale */}
                    <div className="h-32 flex items-center justify-center text-6xl font-black text-white bg-[linear-gradient(135deg,var(--color-primary)_0%,var(--color-primary-dark)_100%)]">
                      {eglise.nom.charAt(0)}
                    </div>
                    <div className="p-5 bg-white">
                      <h3 className="font-bold text-base text-slate-900 mb-2 group-hover:text-primary transition-colors">
                        {eglise.nom}
                      </h3>
                      <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full mb-2 bg-secondary/12 text-secondary">
                        {eglise.ville}
                      </span>
                      {eglise.pasteur && (
                        <p className="text-slate-500 text-xs mt-1">
                          Pasteur : {eglise.pasteur}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ——— ANNONCES & ÉVÉNEMENTS ——— */}
        <section className="py-20 px-4 bg-muted">
          <div className="max-w-[1280px] mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

              {/* Annonces */}
              <div>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest mb-0.5 text-secondary">
                      Informations
                    </p>
                    <h2 className="text-xl font-bold text-primary">Annonces</h2>
                  </div>
                  <Link
                    href="/annonces"
                    className="text-sm font-semibold text-secondary hover:text-primary transition-colors"
                  >
                    Tout voir →
                  </Link>
                </div>

                {annoncesList.length === 0 ? (
                  <div className="py-8 px-5 rounded-xl text-sm text-slate-500 bg-white border border-dashed border-border">
                    Aucune annonce pour le moment.
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {annoncesList.map((annonce) => (
                      <div
                        key={annonce.id}
                        className="bg-white rounded-xl p-5 border border-border transition-shadow hover:shadow-sm"
                      >
                        <div className="flex items-start gap-3">
                          <span
                            className={`mt-0.5 flex-shrink-0 text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide ${
                              annonce.priorite === "urgente"
                                ? "bg-red-100 text-red-600"
                                : "bg-sky-100 text-sky-700"
                            }`}
                          >
                            {annonce.priorite === "urgente" ? "Urgent" : "Info"}
                          </span>
                          <div>
                            <h4 className="font-semibold text-slate-900 text-sm mb-1">
                              {annonce.titre}
                            </h4>
                            <p className="text-slate-500 text-xs leading-relaxed">
                              {annonce.contenu.substring(0, 110)}
                              {annonce.contenu.length > 110 ? "…" : ""}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Événements */}
              <div>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest mb-0.5 text-secondary">
                      Agenda
                    </p>
                    <h2 className="text-xl font-bold text-primary">Événements</h2>
                  </div>
                  <Link
                    href="/evenements"
                    className="text-sm font-semibold text-secondary hover:text-primary transition-colors"
                  >
                    Tout voir →
                  </Link>
                </div>

                {evenementsList.length === 0 ? (
                  <div className="py-8 px-5 rounded-xl text-sm text-slate-500 bg-white border border-dashed border-border">
                    Aucun événement planifié pour le moment.
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {evenementsList.map((evt) => (
                      <div
                        key={evt.id}
                        className="bg-white rounded-xl p-5 border border-border flex gap-4 items-start transition-shadow hover:shadow-sm"
                      >
                        <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-primary flex flex-col items-center justify-center text-white">
                          <span className="text-lg font-extrabold leading-none">
                            {new Date(evt.dateDebut).getDate()}
                          </span>
                          <span className="text-[9px] uppercase opacity-70 font-semibold tracking-wide">
                            {new Date(evt.dateDebut).toLocaleString("fr-FR", { month: "short" })}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-slate-900 text-sm mb-1 leading-snug">
                            {evt.titre}
                          </h4>
                          {evt.lieu && (
                            <p className="text-slate-500 text-xs flex items-center gap-1">
                              <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3" stroke="currentColor" strokeWidth="2">
                                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                                <circle cx="12" cy="9" r="2.5"/>
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

        {/* ——— CTA ——— */}
        <section className="relative overflow-hidden py-20 px-4 bg-[linear-gradient(135deg,var(--color-secondary)_0%,var(--color-secondary-light)_60%,#b8882a_100%)]">
          {/* Décoration points */}
          <div className="absolute inset-0 pointer-events-none opacity-10" aria-hidden>
            <svg className="absolute w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="dots-cta" width="40" height="40" patternUnits="userSpaceOnUse">
                  <circle cx="20" cy="20" r="1.5" fill="var(--color-primary)" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#dots-cta)" />
            </svg>
          </div>

          <div className="relative max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4 leading-tight text-primary">
              Faites partie de notre communauté
            </h2>
            <p className="text-base leading-relaxed mb-10 text-primary/80">
              Rejoignez la CEEC, accédez aux ressources de votre église, restez informé
              des événements et annonces de toute la communauté évangélique du Congo.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/sign-up"
                className="px-8 py-3.5 rounded-lg font-bold text-base text-white bg-primary transition-all duration-200 hover:brightness-110"
              >
                Créer mon compte
              </Link>
              <Link
                href="/contact"
                className="px-8 py-3.5 rounded-lg font-semibold text-base text-primary bg-primary/8 border-2 border-primary/25 transition-all duration-200 hover:bg-primary/15"
              >
                Nous contacter
              </Link>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
