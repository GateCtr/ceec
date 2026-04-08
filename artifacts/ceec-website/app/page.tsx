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
  { valeur: "50+",  label: "Églises membres" },
  { valeur: "26",   label: "Villes couvertes" },
  { valeur: "100k+",label: "Fidèles" },
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

        {/* ═══════════════════════════════════════
            HERO — Photo + overlay bleu CEEC
        ═══════════════════════════════════════ */}
        <section className="relative overflow-hidden text-white pt-44 pb-24 min-h-screen flex flex-col justify-center">
          <Image
            src="/church-hero.png"
            alt="Église de la CEEC"
            fill
            className="object-cover object-center"
            priority
          />
          {/* Overlay dégradé */}
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(135deg,rgba(30,58,138,0.88) 0%,rgba(14,23,60,0.93) 55%,rgba(8,12,28,0.97) 100%)" }}
          />
          {/* Motif croix */}
          <div className="absolute inset-0 pointer-events-none" aria-hidden>
            <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="crosses" width="60" height="60" patternUnits="userSpaceOnUse">
                  <path d="M30 10v20M20 20h20" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#crosses)" />
            </svg>
            <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full opacity-[0.07]"
              style={{ background: "var(--color-secondary)", filter: "blur(80px)" }} />
          </div>

          {/* Contenu */}
          <div className="relative max-w-3xl mx-auto px-4 text-center">
            {/* Badge */}
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 rounded-full animate-ping opacity-50"
                style={{ background: "rgba(197,155,46,0.3)" }} />
              <div className="relative text-xs font-semibold tracking-widest uppercase px-5 py-1.5 rounded-full border"
                style={{ background: "rgba(197,155,46,0.12)", borderColor: "rgba(197,155,46,0.4)", color: "var(--color-gold)" }}>
                Communauté des Églises Évangéliques au Congo
              </div>
            </div>

            <h1 className="font-extrabold leading-tight mb-5 text-4xl sm:text-5xl lg:text-6xl"
              style={{ textShadow: "0 2px 20px rgba(0,0,0,0.4)" }}>
              Ensemble dans la Foi,
              <br />
              <span style={{ color: "var(--color-secondary)" }}>unis pour le Congo</span>
            </h1>

            <p className="mx-auto mb-10 leading-relaxed max-w-xl text-base md:text-lg"
              style={{ color: "rgba(255,255,255,0.78)" }}>
              La CEEC regroupe des dizaines d&apos;églises évangéliques à travers toutes les
              provinces du Congo, toutes unies dans la foi, la prière et le service au peuple congolais.
            </p>

            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/paroisses"
                className="px-8 py-3.5 rounded-lg font-bold text-base transition-all duration-200 hover:brightness-110"
                style={{ background: "var(--color-secondary)", color: "var(--color-primary-900)" }}>
                Nos Églises
              </Link>
              <Link href="/sign-up"
                className="px-8 py-3.5 rounded-lg font-semibold text-base text-white transition-all duration-200"
                style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.28)" }}>
                Rejoindre la CEEC
              </Link>
            </div>
          </div>

          {/* Bande stats */}
          <div className="relative max-w-4xl mx-auto px-4 mt-14">
            <div className="grid grid-cols-2 md:grid-cols-4 rounded-2xl overflow-hidden"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}>
              {stats.map((stat, idx) => (
                <div key={stat.label}
                  className="flex flex-col items-center justify-center py-5 px-4 text-center"
                  style={{ borderRight: idx < stats.length - 1 ? "1px solid rgba(255,255,255,0.12)" : "none" }}>
                  <span className="font-extrabold text-2xl md:text-3xl leading-none mb-1"
                    style={{ color: "var(--color-secondary)" }}>
                    {stat.valeur}
                  </span>
                  <span className="text-xs font-medium uppercase tracking-wide"
                    style={{ color: "rgba(255,255,255,0.6)" }}>
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            NOS MISSIONS
        ═══════════════════════════════════════ */}
        <section className="py-20 px-4" style={{ background: "#ffffff" }}>
          <div className="max-w-[1280px] mx-auto">
            {/* En-tête */}
            <div className="text-center mb-14">
              <p className="text-xs font-bold uppercase tracking-widest mb-3"
                style={{ color: "var(--color-secondary)" }}>
                Nos piliers
              </p>
              <h2 className="text-3xl md:text-4xl font-bold mb-4"
                style={{ color: "var(--color-primary)", fontFamily: "var(--font-display)" }}>
                Nos Missions
              </h2>
              {/* Ligne décorative or */}
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="h-px w-16" style={{ background: "var(--color-secondary)" }} />
                <div className="w-2 h-2 rounded-full" style={{ background: "var(--color-secondary)" }} />
                <div className="h-px w-16" style={{ background: "var(--color-secondary)" }} />
              </div>
              <p className="max-w-lg mx-auto leading-relaxed" style={{ color: "#64748b" }}>
                Trois engagements fondamentaux qui guident l&apos;action de la CEEC
                au service de la nation congolaise.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {missions.map((mission, i) => (
                <div key={mission.titre}
                  className="group flex flex-col p-8 rounded-2xl transition-all duration-300 hover:-translate-y-1"
                  style={i === 1
                    ? { background: "linear-gradient(160deg, var(--color-primary) 0%, var(--color-primary-900) 100%)", boxShadow: "0 8px 32px rgba(30,58,138,0.35)" }
                    : { background: "var(--color-primary-50)", border: "1px solid var(--color-primary-100)" }
                  }>
                  {/* Icône */}
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-transform duration-200 group-hover:scale-110"
                    style={i === 1
                      ? { background: "rgba(197,155,46,0.2)", color: "var(--color-secondary)" }
                      : { background: "var(--color-primary-100)", color: "var(--color-primary)" }
                    }>
                    {mission.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3"
                    style={{ color: i === 1 ? "#ffffff" : "var(--color-primary)", fontFamily: "var(--font-display)" }}>
                    {mission.titre}
                  </h3>
                  <p className="text-sm leading-relaxed"
                    style={{ color: i === 1 ? "rgba(255,255,255,0.75)" : "#64748b" }}>
                    {mission.desc}
                  </p>
                  {i === 1 && (
                    <div className="mt-6 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.15)" }}>
                      <span className="text-xs font-semibold uppercase tracking-widest"
                        style={{ color: "var(--color-secondary)" }}>
                        Notre priorité
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            NOS VALEURS — fond bleu clair CEEC
        ═══════════════════════════════════════ */}
        <section className="py-20 px-4" style={{ background: "var(--color-primary-50)" }}>
          <div className="max-w-[1280px] mx-auto">
            <div className="text-center mb-14">
              <p className="text-xs font-bold uppercase tracking-widest mb-3"
                style={{ color: "var(--color-secondary)" }}>
                Ce qui nous unit
              </p>
              <h2 className="text-3xl md:text-4xl font-bold mb-4"
                style={{ color: "var(--color-primary)", fontFamily: "var(--font-display)" }}>
                Nos Valeurs Fondamentales
              </h2>
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="h-px w-16" style={{ background: "var(--color-secondary)" }} />
                <div className="w-2 h-2 rounded-full" style={{ background: "var(--color-secondary)" }} />
                <div className="h-px w-16" style={{ background: "var(--color-secondary)" }} />
              </div>
              <p className="max-w-md mx-auto leading-relaxed" style={{ color: "#64748b" }}>
                Ces valeurs guident chacune de nos églises et notre engagement
                envers Dieu et la nation.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {valeurs.map((valeur, i) => (
                <div key={valeur.titre}
                  className="rounded-2xl p-7 text-center transition-all duration-200 hover:-translate-y-1"
                  style={{
                    background: "#ffffff",
                    border: "1px solid var(--color-primary-100)",
                    boxShadow: "0 2px 8px rgba(30,58,138,0.06)",
                  }}>
                  {/* Numéro */}
                  <div className="text-xs font-bold uppercase tracking-widest mb-3"
                    style={{ color: "var(--color-secondary)" }}>
                    0{i + 1}
                  </div>
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4"
                    style={{ background: "var(--color-primary-100)", color: "var(--color-primary)" }}>
                    {valeur.icon}
                  </div>
                  <h3 className="text-base font-bold mb-2"
                    style={{ color: "var(--color-primary)" }}>
                    {valeur.titre}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#64748b" }}>
                    {valeur.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            NOS ÉGLISES
        ═══════════════════════════════════════ */}
        <section className="py-20 px-4" style={{ background: "#ffffff" }}>
          <div className="max-w-[1280px] mx-auto">
            <div className="flex justify-between items-end mb-12 flex-wrap gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-2"
                  style={{ color: "var(--color-secondary)" }}>
                  Notre réseau
                </p>
                <h2 className="text-3xl md:text-4xl font-bold"
                  style={{ color: "var(--color-primary)", fontFamily: "var(--font-display)" }}>
                  Nos Églises
                </h2>
                <p className="mt-1" style={{ color: "#64748b" }}>
                  Découvrez les églises membres de la CEEC
                </p>
              </div>
              <Link href="/paroisses"
                className="px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 hover:text-white"
                style={{ border: "2px solid var(--color-primary)", color: "var(--color-primary)" }}
              >
                Voir toutes les églises →
              </Link>
            </div>

            {eglisesList.length === 0 ? (
              <div className="text-center py-16 rounded-2xl"
                style={{ background: "var(--color-primary-50)", border: "2px dashed var(--color-primary-200)" }}>
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ background: "var(--color-primary-100)", color: "var(--color-primary)" }}>
                  <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8" stroke="currentColor" strokeWidth="1.5">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" strokeLinecap="round" />
                    <polyline points="9 22 9 12 15 12 15 22" strokeLinecap="round" />
                  </svg>
                </div>
                <p className="font-medium" style={{ color: "#64748b" }}>
                  Les églises seront affichées ici une fois ajoutées par les administrateurs.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {eglisesList.map((eglise) => (
                  <Link key={eglise.id} href={`/paroisses/${eglise.id}`}
                    className="group block rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-1"
                    style={{ border: "1px solid var(--color-primary-100)", boxShadow: "0 2px 8px rgba(30,58,138,0.06)" }}>
                    {/* Barre tricolore */}
                    <div className="h-1.5"
                      style={{ background: "linear-gradient(90deg, var(--color-primary), var(--color-secondary), var(--color-accent))" }} />
                    {/* Initiale */}
                    <div className="h-32 flex items-center justify-center text-5xl font-black text-white"
                      style={{ background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-900) 100%)" }}>
                      {eglise.nom.charAt(0)}
                    </div>
                    <div className="p-5" style={{ background: "#ffffff" }}>
                      <h3 className="font-bold text-base mb-2 transition-colors"
                        style={{ color: "var(--color-foreground)" }}>
                        {eglise.nom}
                      </h3>
                      <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full mb-2"
                        style={{ background: "var(--color-secondary-100)", color: "var(--color-secondary-800)" }}>
                        {eglise.ville}
                      </span>
                      {eglise.pasteur && (
                        <p className="text-xs mt-1" style={{ color: "#64748b" }}>
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

        {/* ═══════════════════════════════════════
            ANNONCES & ÉVÉNEMENTS
        ═══════════════════════════════════════ */}
        <section className="py-20 px-4" style={{ background: "var(--color-primary-50)" }}>
          <div className="max-w-[1280px] mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

              {/* ── Annonces ── */}
              <div>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest mb-0.5"
                      style={{ color: "var(--color-secondary)" }}>
                      Informations
                    </p>
                    <h2 className="text-xl font-bold"
                      style={{ color: "var(--color-primary)", fontFamily: "var(--font-display)" }}>
                      Annonces
                    </h2>
                  </div>
                  <Link href="/annonces" className="text-sm font-semibold transition-colors"
                    style={{ color: "var(--color-secondary)" }}>
                    Tout voir →
                  </Link>
                </div>

                {annoncesList.length === 0 ? (
                  <div className="py-8 px-5 rounded-xl text-sm"
                    style={{ background: "#ffffff", border: "1px dashed var(--color-primary-200)", color: "#64748b" }}>
                    Aucune annonce pour le moment.
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {annoncesList.map((annonce) => (
                      <div key={annonce.id} className="rounded-xl p-5 transition-shadow hover:shadow-md"
                        style={{ background: "#ffffff", border: "1px solid var(--color-primary-100)" }}>
                        <div className="flex items-start gap-3">
                          <span className="mt-0.5 flex-shrink-0 text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide"
                            style={annonce.priorite === "urgente"
                              ? { background: "var(--color-accent-100)", color: "var(--color-accent-700)" }
                              : { background: "var(--color-primary-100)", color: "var(--color-primary-700)" }
                            }>
                            {annonce.priorite === "urgente" ? "Urgent" : "Info"}
                          </span>
                          <div>
                            <h4 className="font-semibold text-sm mb-1"
                              style={{ color: "var(--color-foreground)" }}>
                              {annonce.titre}
                            </h4>
                            <p className="text-xs leading-relaxed" style={{ color: "#64748b" }}>
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

              {/* ── Événements ── */}
              <div>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest mb-0.5"
                      style={{ color: "var(--color-secondary)" }}>
                      Agenda
                    </p>
                    <h2 className="text-xl font-bold"
                      style={{ color: "var(--color-primary)", fontFamily: "var(--font-display)" }}>
                      Événements
                    </h2>
                  </div>
                  <Link href="/evenements" className="text-sm font-semibold transition-colors"
                    style={{ color: "var(--color-secondary)" }}>
                    Tout voir →
                  </Link>
                </div>

                {evenementsList.length === 0 ? (
                  <div className="py-8 px-5 rounded-xl text-sm"
                    style={{ background: "#ffffff", border: "1px dashed var(--color-primary-200)", color: "#64748b" }}>
                    Aucun événement planifié pour le moment.
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {evenementsList.map((evt) => (
                      <div key={evt.id}
                        className="rounded-xl p-5 flex gap-4 items-start transition-shadow hover:shadow-md"
                        style={{ background: "#ffffff", border: "1px solid var(--color-primary-100)" }}>
                        {/* Bloc date */}
                        <div className="flex-shrink-0 w-14 h-14 rounded-xl flex flex-col items-center justify-center text-white"
                          style={{ background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-900) 100%)" }}>
                          <span className="text-lg font-extrabold leading-none">
                            {new Date(evt.dateDebut).getDate()}
                          </span>
                          <span className="text-[9px] uppercase opacity-75 font-semibold tracking-wide">
                            {new Date(evt.dateDebut).toLocaleString("fr-FR", { month: "short" })}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm mb-1 leading-snug"
                            style={{ color: "var(--color-foreground)" }}>
                            {evt.titre}
                          </h4>
                          {evt.lieu && (
                            <p className="text-xs flex items-center gap-1" style={{ color: "#64748b" }}>
                              <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3 flex-shrink-0" stroke="currentColor" strokeWidth="2">
                                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
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

        {/* ═══════════════════════════════════════
            CTA — Appel à rejoindre la CEEC
        ═══════════════════════════════════════ */}
        <section className="relative overflow-hidden py-24 px-4">
          {/* Fond dégradé bleu profond */}
          <div className="absolute inset-0"
            style={{ background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-900) 60%, #060c1e 100%)" }} />
          {/* Halo or */}
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-20 pointer-events-none"
            style={{ background: "var(--color-secondary)", filter: "blur(80px)" }} />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full opacity-10 pointer-events-none"
            style={{ background: "var(--color-secondary)", filter: "blur(60px)" }} />
          {/* Motif points */}
          <div className="absolute inset-0 pointer-events-none opacity-10" aria-hidden>
            <svg className="absolute w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="dots-cta" width="40" height="40" patternUnits="userSpaceOnUse">
                  <circle cx="20" cy="20" r="1.5" fill="white" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#dots-cta)" />
            </svg>
          </div>

          <div className="relative max-w-2xl mx-auto text-center">
            {/* Filet or */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="h-px w-12" style={{ background: "var(--color-secondary)" }} />
              <div className="w-2 h-2 rounded-full" style={{ background: "var(--color-secondary)" }} />
              <div className="h-px w-12" style={{ background: "var(--color-secondary)" }} />
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4 leading-tight text-white"
              style={{ fontFamily: "var(--font-display)" }}>
              Faites partie de notre{" "}
              <span style={{ color: "var(--color-secondary)" }}>communauté</span>
            </h2>
            <p className="text-base leading-relaxed mb-10" style={{ color: "rgba(255,255,255,0.72)" }}>
              Rejoignez la CEEC, accédez aux ressources de votre église, restez informé
              des événements et annonces de toute la communauté évangélique du Congo.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/sign-up"
                className="px-8 py-3.5 rounded-lg font-bold text-base transition-all duration-200 hover:brightness-110"
                style={{ background: "var(--color-secondary)", color: "var(--color-primary-900)" }}>
                Créer mon compte
              </Link>
              <Link href="/contact"
                className="px-8 py-3.5 rounded-lg font-semibold text-base text-white transition-all duration-200"
                style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.25)" }}>
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
