import Link from "next/link";
import Image from "next/image";
import NavbarServer from "@/components/NavbarServer";
import Footer from "@/components/Footer";
import { prisma } from "@/lib/db";

async function getData() {
  try {
    const [eglisesList, annoncesList, evenementsList, nbEglises, configEntries] = await Promise.all([
      prisma.eglise.findMany({ where: { statut: "actif" }, take: 6, orderBy: { nom: "asc" } }),
      prisma.annonce.findMany({ where: { publie: true, egliseId: null }, orderBy: { datePublication: "desc" }, take: 3 }),
      prisma.evenement.findMany({ where: { publie: true, egliseId: null }, orderBy: { dateDebut: "asc" }, take: 3 }),
      prisma.eglise.count({ where: { statut: "actif" } }),
      prisma.communauteConfig.findMany(),
    ]);

    const cfg = Object.fromEntries(configEntries.map((c) => [c.cle, c]));

    const stats = [
      {
        valeur: String(nbEglises),
        label: "Églises membres",
        icon: "⛪",
      },
      {
        valeur: cfg["nb_provinces"]?.valeur ?? "26",
        label: cfg["nb_provinces"]?.label ?? "Provinces couvertes",
        icon: cfg["nb_provinces"]?.icone ?? "📍",
      },
      {
        valeur: cfg["nb_fideles"]?.valeur ?? "100 000+",
        label: cfg["nb_fideles"]?.label ?? "Fidèles",
        icon: cfg["nb_fideles"]?.icone ?? "🙏",
      },
      {
        valeur: cfg["annee_fondation"]?.valeur ?? "1960",
        label: cfg["annee_fondation"]?.label ?? "Année de fondation",
        icon: cfg["annee_fondation"]?.icone ?? "📖",
      },
    ];

    return { eglisesList, annoncesList, evenementsList, stats };
  } catch {
    return {
      eglisesList: [],
      annoncesList: [],
      evenementsList: [],
      stats: [
        { valeur: "0",        label: "Églises membres",    icon: "⛪" },
        { valeur: "26",       label: "Provinces couvertes", icon: "📍" },
        { valeur: "100 000+", label: "Fidèles",             icon: "🙏" },
        { valeur: "1960",     label: "Année de fondation",  icon: "📖" },
      ],
    };
  }
}

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
    desc: "Former des leaders chrétiens solides — pasteurs, diacres et laïcs — capables de servir avec intégrité et sagesse.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 7h6M9 11h4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    titre: "Service communautaire",
    desc: "Servir le peuple congolais à travers l'aide sociale, les soins médicaux et l'éducation dans toutes nos communautés.",
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
    desc: "Une foi solide fondée sur la Parole de Dieu, vécue au quotidien dans toutes nos communautés.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 2v8M12 14v8M4 12h16" strokeLinecap="round" />
      </svg>
    ),
    couleur: "var(--color-primary)",
    fond: "var(--color-primary-100)",
  },
  {
    titre: "La Fraternité",
    desc: "Des liens fraternels forts entre toutes les églises membres, unies dans un même esprit d'amour.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth="1.8">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeLinecap="round" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" />
      </svg>
    ),
    couleur: "var(--color-secondary-800)",
    fond: "var(--color-secondary-100)",
  },
  {
    titre: "Le Service",
    desc: "Un engagement constant au service de la nation congolaise, dans l'amour, le respect et la dignité.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth="1.8">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" strokeLinecap="round" />
      </svg>
    ),
    couleur: "var(--color-accent-700)",
    fond: "var(--color-accent-100)",
  },
  {
    titre: "La Prière",
    desc: "La prière comme fondement de notre vie communautaire et de chacune de nos actions quotidiennes.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth="1.8">
        <path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" strokeLinecap="round" />
        <line x1="6" y1="1" x2="6" y2="4" strokeLinecap="round" />
        <line x1="10" y1="1" x2="10" y2="4" strokeLinecap="round" />
        <line x1="14" y1="1" x2="14" y2="4" strokeLinecap="round" />
      </svg>
    ),
    couleur: "var(--color-primary-700)",
    fond: "var(--color-primary-50)",
  },
];

/* ─── Composant séparateur de section ───────────────── */
function SectionLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 justify-center mb-4">
      <div className="h-px w-10" style={{ background: "var(--color-secondary)" }} />
      <span className="text-xs font-bold uppercase tracking-widest"
        style={{ color: "var(--color-secondary)" }}>
        {label}
      </span>
      <div className="h-px w-10" style={{ background: "var(--color-secondary)" }} />
    </div>
  );
}

/* ─── Composant titre de section ─────────────────────── */
function SectionTitle({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return (
    <h2 className="text-3xl md:text-4xl font-bold mb-4"
      style={{
        color: light ? "#ffffff" : "var(--color-primary)",
        fontFamily: "var(--font-display)",
      }}>
      {children}
    </h2>
  );
}

/* ═══════════════════════════════════════════════════════
   PAGE PRINCIPALE
═══════════════════════════════════════════════════════ */
export default async function HomePage() {
  const { eglisesList, annoncesList, evenementsList, stats } = await getData();

  return (
    <>
      <NavbarServer />
      <main>

        {/* ══════════════════════════════════════════════
            1. HERO — Photo plein écran
        ══════════════════════════════════════════════ */}
        <section className="relative overflow-hidden text-white pt-48 pb-32 min-h-screen flex flex-col justify-center">
          {/* Photo d'arrière-plan */}
          <Image src="/church-hero.png" alt="Église de la CEEC" fill
            className="object-cover object-center" priority />

          {/* Overlay dégradé bleu CEEC */}
          <div className="absolute inset-0"
            style={{ background: "linear-gradient(150deg, rgba(30,58,138,0.82) 0%, rgba(14,23,60,0.92) 50%, rgba(6,10,22,0.97) 100%)" }} />

          {/* Motif croix */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.04]" aria-hidden>
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="hero-crosses" width="60" height="60" patternUnits="userSpaceOnUse">
                  <path d="M30 10v20M20 20h20" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#hero-crosses)" />
            </svg>
          </div>

          {/* Halo or */}
          <div className="absolute top-1/3 right-1/4 w-96 h-96 rounded-full pointer-events-none"
            style={{ background: "var(--color-secondary)", opacity: 0.06, filter: "blur(100px)" }} />

          {/* Contenu centré */}
          <div className="relative max-w-4xl mx-auto px-6 text-center">
            {/* Badge animé */}
            <div className="relative inline-flex items-center mb-8">
              <div className="absolute inset-0 rounded-full animate-ping opacity-40"
                style={{ background: "rgba(197,155,46,0.4)" }} />
              <div className="relative flex items-center gap-2 px-5 py-2 rounded-full text-xs font-semibold tracking-widest uppercase"
                style={{ background: "rgba(197,155,46,0.13)", border: "1px solid rgba(197,155,46,0.45)", color: "var(--color-gold)" }}>
                <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: "var(--color-secondary)" }} />
                Communauté des Églises Évangéliques au Congo
              </div>
            </div>

            {/* Titre principal */}
            <h1 className="font-extrabold leading-[1.1] mb-6 text-4xl sm:text-5xl lg:text-7xl"
              style={{ fontFamily: "var(--font-display)", textShadow: "0 4px 30px rgba(0,0,0,0.5)", color: "#ffffff" }}>
              Ensemble dans la Foi,
              <br />
              <span style={{ color: "var(--color-secondary)" }}>
                unis pour le Congo
              </span>
            </h1>

            {/* Sous-titre */}
            <p className="mx-auto mb-12 leading-relaxed max-w-2xl text-lg md:text-xl"
              style={{ color: "rgba(255,255,255,0.72)" }}>
              La CEEC fédère des dizaines d&apos;églises évangéliques à travers toutes les
              provinces du Congo — unies dans la foi, la prière et le service au peuple congolais.
            </p>

            {/* Boutons */}
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/paroisses"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-base transition-all duration-200 hover:brightness-110 hover:scale-105"
                style={{ background: "var(--color-secondary)", color: "var(--color-primary-900)" }}>
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" strokeLinecap="round" />
                  <polyline points="9 22 9 12 15 12 15 22" strokeLinecap="round" />
                </svg>
                Nos Églises
              </Link>
              <Link href="/sign-up"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-base text-white transition-all duration-200 hover:bg-white/20"
                style={{ background: "rgba(255,255,255,0.1)", border: "1.5px solid rgba(255,255,255,0.3)" }}>
                Rejoindre la CEEC
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Flèche scroll */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce opacity-50">
            <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-white" stroke="currentColor" strokeWidth="2">
              <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            2. À PROPOS — Identité et histoire de la CEEC
        ══════════════════════════════════════════════ */}
        <section className="py-24 px-6" style={{ background: "#ffffff" }}>
          <div className="max-w-[1280px] mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

              {/* Texte */}
              <div>
                <SectionLabel label="Qui sommes-nous" />
                <SectionTitle>Une communauté fondée sur la foi et l&apos;unité</SectionTitle>
                <p className="leading-relaxed mb-6 text-base" style={{ color: "#64748b" }}>
                  La <strong style={{ color: "var(--color-primary)" }}>Communauté des Églises Évangéliques au Congo</strong> (CEEC)
                  est un mouvement chrétien ancré dans les valeurs de l&apos;Évangile, présent dans toutes
                  les provinces de la République Démocratique du Congo depuis 1960.
                </p>
                <p className="leading-relaxed mb-8 text-base" style={{ color: "#64748b" }}>
                  Notre mission : rassembler, former et envoyer des chrétiens engagés au service de Dieu
                  et de la nation — à travers l&apos;évangélisation, la formation théologique et l&apos;action sociale.
                </p>

                {/* Points forts */}
                <div className="flex flex-col gap-3">
                  {[
                    "Mouvement œcuménique évangélique depuis plus de 60 ans",
                    "Réseau actif dans les 26 provinces du Congo",
                    "Formation de pasteurs, diacres et leaders laïcs",
                  ].map((point) => (
                    <div key={point} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ background: "var(--color-secondary)", color: "var(--color-primary-900)" }}>
                        <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3" stroke="currentColor" strokeWidth="3">
                          <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <span className="text-sm font-medium" style={{ color: "var(--color-foreground)" }}>{point}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-10">
                  <Link href="/a-propos"
                    className="inline-flex items-center gap-2 font-semibold text-sm transition-colors"
                    style={{ color: "var(--color-primary)" }}>
                    En savoir plus sur la CEEC
                    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Link>
                </div>
              </div>

              {/* Emblème + citation */}
              <div className="relative flex items-center justify-center">
                {/* Cercle décoratif de fond */}
                <div className="absolute w-80 h-80 rounded-full"
                  style={{ background: "var(--color-primary-50)", border: "2px dashed var(--color-primary-200)" }} />
                <div className="absolute w-64 h-64 rounded-full"
                  style={{ background: "var(--color-primary-100)" }} />

                {/* Logo central */}
                <div className="relative z-10 flex flex-col items-center gap-6">
                  <img src="/ceec-emblem.svg" alt="Emblème CEEC"
                    width={140} height={140}
                    className="drop-shadow-xl" />

                  {/* Filet or sous le logo */}
                  <div className="h-px w-24" style={{ background: "var(--color-secondary)" }} />

                  <div className="text-center max-w-xs">
                    <p className="font-bold text-lg italic"
                      style={{ color: "var(--color-primary)", fontFamily: "var(--font-display)" }}>
                      &ldquo;Que tous soient un&rdquo;
                    </p>
                    <p className="text-xs font-semibold uppercase tracking-widest mt-1"
                      style={{ color: "var(--color-secondary)" }}>
                      Jean 17 : 21
                    </p>
                  </div>
                </div>

                {/* Bulle décorative — année */}
                <div className="absolute -bottom-4 -right-4 lg:right-8 w-20 h-20 rounded-2xl flex flex-col items-center justify-center shadow-lg z-10"
                  style={{ background: "var(--color-secondary)", transform: "rotate(6deg)" }}>
                  <span className="text-xs font-bold uppercase tracking-wide"
                    style={{ color: "var(--color-primary-900)" }}>Depuis</span>
                  <span className="text-2xl font-extrabold leading-none"
                    style={{ color: "var(--color-primary-900)", fontFamily: "var(--font-display)" }}>1960</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            3. CHIFFRES CLÉ — Impact de la CEEC
        ══════════════════════════════════════════════ */}
        <section className="relative py-20 px-6 overflow-hidden"
          style={{ background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-900) 60%, #060c1e 100%)" }}>
          {/* Motif de fond */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.06]" aria-hidden>
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="stat-dots" width="32" height="32" patternUnits="userSpaceOnUse">
                  <circle cx="16" cy="16" r="1.5" fill="white" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#stat-dots)" />
            </svg>
          </div>

          {/* Halos */}
          <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full pointer-events-none"
            style={{ background: "var(--color-secondary)", opacity: 0.1, filter: "blur(70px)" }} />
          <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full pointer-events-none"
            style={{ background: "var(--color-secondary)", opacity: 0.07, filter: "blur(60px)" }} />

          <div className="relative max-w-[1280px] mx-auto">
            <div className="text-center mb-14">
              <SectionLabel label="Notre impact" />
              <h2 className="text-3xl md:text-4xl font-bold text-white"
                style={{ fontFamily: "var(--font-display)" }}>
                La CEEC en chiffres
              </h2>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {stats.map((stat) => (
                <div key={stat.label}
                  className="flex flex-col items-center text-center py-8 px-4 rounded-2xl"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <span className="text-3xl mb-3">{stat.icon}</span>
                  <span className="font-extrabold text-3xl md:text-4xl leading-none mb-2"
                    style={{ color: "var(--color-secondary)", fontFamily: "var(--font-display)" }}>
                    {stat.valeur}
                  </span>
                  <span className="text-xs font-medium uppercase tracking-widest"
                    style={{ color: "rgba(255,255,255,0.6)" }}>
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            4. NOS MISSIONS — 3 piliers
        ══════════════════════════════════════════════ */}
        <section className="py-24 px-6" style={{ background: "#ffffff" }}>
          <div className="max-w-[1280px] mx-auto">
            <div className="text-center mb-14">
              <SectionLabel label="Nos piliers" />
              <SectionTitle>Trois missions, un seul cœur</SectionTitle>
              <p className="max-w-xl mx-auto leading-relaxed" style={{ color: "#64748b" }}>
                Trois engagements fondamentaux qui guident l&apos;action quotidienne
                de la CEEC au service de la nation congolaise.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {missions.map((mission, i) => (
                <div key={mission.titre}
                  className="group relative flex flex-col p-8 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-2"
                  style={i === 1
                    ? { background: "linear-gradient(155deg, var(--color-primary) 0%, var(--color-primary-900) 100%)", boxShadow: "0 12px 40px rgba(30,58,138,0.4)" }
                    : { background: "var(--color-primary-50)", border: "1px solid var(--color-primary-100)" }
                  }>

                  {/* Numéro en filigrane */}
                  <span className="absolute top-4 right-5 text-6xl font-black leading-none select-none"
                    style={{ color: i === 1 ? "rgba(255,255,255,0.07)" : "rgba(30,58,138,0.06)" }}>
                    0{i + 1}
                  </span>

                  {/* Icône */}
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110"
                    style={i === 1
                      ? { background: "rgba(197,155,46,0.2)", color: "var(--color-secondary)" }
                      : { background: "var(--color-primary-100)", color: "var(--color-primary)" }
                    }>
                    {mission.icon}
                  </div>

                  {/* Texte */}
                  <h3 className="text-xl font-bold mb-3"
                    style={{ color: i === 1 ? "#ffffff" : "var(--color-primary)", fontFamily: "var(--font-display)" }}>
                    {mission.titre}
                  </h3>
                  <p className="text-sm leading-relaxed flex-1"
                    style={{ color: i === 1 ? "rgba(255,255,255,0.72)" : "#64748b" }}>
                    {mission.desc}
                  </p>

                  {i === 1 && (
                    <div className="mt-6 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.15)" }}>
                      <span className="text-xs font-bold uppercase tracking-widest"
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

        {/* ══════════════════════════════════════════════
            5. VERSET — Inspiration spirituelle
        ══════════════════════════════════════════════ */}
        <section className="relative py-20 px-6 overflow-hidden"
          style={{ background: "linear-gradient(135deg, var(--color-secondary-700) 0%, var(--color-secondary) 50%, var(--color-secondary-500) 100%)" }}>
          {/* Motif */}
          <div className="absolute inset-0 pointer-events-none opacity-10" aria-hidden>
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="verse-crosses" width="48" height="48" patternUnits="userSpaceOnUse">
                  <path d="M24 8v16M16 16h16" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#verse-crosses)" />
            </svg>
          </div>

          <div className="relative max-w-3xl mx-auto text-center">
            {/* Guillemet décoratif */}
            <div className="text-8xl font-black leading-none mb-2 select-none"
              style={{ color: "rgba(30,58,138,0.2)", fontFamily: "Georgia, serif" }}>
              &ldquo;
            </div>
            <p className="text-2xl md:text-3xl font-bold italic leading-snug mb-6"
              style={{ color: "var(--color-primary-900)", fontFamily: "var(--font-display)", marginTop: "-2rem" }}>
              Car là où deux ou trois sont assemblés en mon nom,
              je suis au milieu d&apos;eux.
            </p>
            <div className="flex items-center justify-center gap-3">
              <div className="h-px w-12" style={{ background: "rgba(30,58,138,0.4)" }} />
              <span className="text-sm font-bold uppercase tracking-widest"
                style={{ color: "var(--color-primary-800)" }}>
                Matthieu 18 : 20
              </span>
              <div className="h-px w-12" style={{ background: "rgba(30,58,138,0.4)" }} />
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            6. NOS VALEURS — 4 colonnes
        ══════════════════════════════════════════════ */}
        <section className="py-24 px-6" style={{ background: "var(--color-primary-50)" }}>
          <div className="max-w-[1280px] mx-auto">
            <div className="text-center mb-14">
              <SectionLabel label="Ce qui nous unit" />
              <SectionTitle>Nos valeurs fondamentales</SectionTitle>
              <p className="max-w-md mx-auto leading-relaxed" style={{ color: "#64748b" }}>
                Ces valeurs guident chacune de nos églises et notre engagement
                envers Dieu et la nation.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {valeurs.map((valeur, i) => (
                <div key={valeur.titre}
                  className="group rounded-2xl p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                  style={{ background: "#ffffff", border: "1px solid var(--color-primary-100)" }}>
                  {/* Numéro */}
                  <div className="text-xs font-bold uppercase tracking-widest mb-4"
                    style={{ color: "var(--color-secondary)" }}>
                    0{i + 1}
                  </div>
                  {/* Icône */}
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform duration-200 group-hover:scale-110"
                    style={{ background: valeur.fond, color: valeur.couleur }}>
                    {valeur.icon}
                  </div>
                  <h3 className="font-bold mb-2 text-base"
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

        {/* ══════════════════════════════════════════════
            7. RÉSEAU D'ÉGLISES
        ══════════════════════════════════════════════ */}
        <section className="py-24 px-6" style={{ background: "#ffffff" }}>
          <div className="max-w-[1280px] mx-auto">

            {/* En-tête */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-12">
              <div>
                <SectionLabel label="Notre réseau" />
                <SectionTitle>Nos Églises membres</SectionTitle>
                <p style={{ color: "#64748b" }}>
                  Découvrez les paroisses de la CEEC à travers le Congo
                </p>
              </div>
              <Link href="/paroisses"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex-shrink-0 hover:text-white"
                style={{ border: "2px solid var(--color-primary)", color: "var(--color-primary)" }}>
                Voir toutes les églises
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>

            {eglisesList.length === 0 ? (
              /* État vide */
              <div className="text-center py-20 rounded-2xl"
                style={{ background: "var(--color-primary-50)", border: "2px dashed var(--color-primary-200)" }}>
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ background: "var(--color-primary-100)", color: "var(--color-primary)" }}>
                  <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8" stroke="currentColor" strokeWidth="1.5">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" strokeLinecap="round" />
                    <polyline points="9 22 9 12 15 12 15 22" strokeLinecap="round" />
                  </svg>
                </div>
                <p className="font-semibold mb-1" style={{ color: "var(--color-primary)" }}>
                  Aucune église enregistrée pour le moment
                </p>
                <p className="text-sm" style={{ color: "#64748b" }}>
                  Les paroisses apparaîtront ici dès qu&apos;elles seront ajoutées.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {eglisesList.map((eglise) => (
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
                    <div className="p-5"
                      style={{ background: "#ffffff", border: "1px solid var(--color-primary-100)", borderTop: "none" }}>
                      <h3 className="font-bold text-base mb-2 transition-colors group-hover:text-blue-700"
                        style={{ color: "var(--color-foreground)" }}>
                        {eglise.nom}
                      </h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full"
                          style={{ background: "var(--color-secondary-100)", color: "var(--color-secondary-800)" }}>
                          <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3" stroke="currentColor" strokeWidth="2.5">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" strokeLinecap="round" />
                            <circle cx="12" cy="9" r="2.5" />
                          </svg>
                          {eglise.ville}
                        </span>
                        {eglise.pasteur && (
                          <span className="text-xs" style={{ color: "#64748b" }}>
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

        {/* ══════════════════════════════════════════════
            8. ACTUALITÉS — Annonces & Événements
        ══════════════════════════════════════════════ */}
        <section className="py-24 px-6" style={{ background: "var(--color-primary-50)" }}>
          <div className="max-w-[1280px] mx-auto">

            {/* En-tête */}
            <div className="text-center mb-14">
              <SectionLabel label="Actualités" />
              <SectionTitle>Annonces & Événements</SectionTitle>
              <p className="max-w-md mx-auto" style={{ color: "#64748b" }}>
                Restez informé de la vie de la communauté CEEC
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

              {/* ── Annonces ── */}
              <div>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-bold text-lg flex items-center gap-2"
                    style={{ color: "var(--color-primary)", fontFamily: "var(--font-display)" }}>
                    <span className="w-2 h-6 rounded-full inline-block"
                      style={{ background: "var(--color-secondary)" }} />
                    Annonces
                  </h3>
                  <Link href="/annonces" className="text-sm font-semibold transition-colors"
                    style={{ color: "var(--color-secondary)" }}>
                    Tout voir →
                  </Link>
                </div>

                {annoncesList.length === 0 ? (
                  <div className="py-10 px-6 rounded-2xl text-center text-sm"
                    style={{ background: "#ffffff", border: "1.5px dashed var(--color-primary-200)", color: "#64748b" }}>
                    Aucune annonce pour le moment.
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {annoncesList.map((annonce) => (
                      <div key={annonce.id}
                        className="rounded-2xl p-5 transition-shadow hover:shadow-md"
                        style={{ background: "#ffffff", border: "1px solid var(--color-primary-100)" }}>
                        <div className="flex items-start gap-3">
                          <span className="mt-0.5 flex-shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider"
                            style={annonce.priorite === "urgente"
                              ? { background: "var(--color-accent-100)", color: "var(--color-accent-700)" }
                              : { background: "var(--color-primary-100)", color: "var(--color-primary-700)" }
                            }>
                            {annonce.priorite === "urgente" ? "🔴 Urgent" : "ℹ Info"}
                          </span>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm mb-1"
                              style={{ color: "var(--color-foreground)" }}>
                              {annonce.titre}
                            </h4>
                            <p className="text-xs leading-relaxed" style={{ color: "#64748b" }}>
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
                  <h3 className="font-bold text-lg flex items-center gap-2"
                    style={{ color: "var(--color-primary)", fontFamily: "var(--font-display)" }}>
                    <span className="w-2 h-6 rounded-full inline-block"
                      style={{ background: "var(--color-primary)" }} />
                    Événements à venir
                  </h3>
                  <Link href="/evenements" className="text-sm font-semibold transition-colors"
                    style={{ color: "var(--color-secondary)" }}>
                    Tout voir →
                  </Link>
                </div>

                {evenementsList.length === 0 ? (
                  <div className="py-10 px-6 rounded-2xl text-center text-sm"
                    style={{ background: "#ffffff", border: "1.5px dashed var(--color-primary-200)", color: "#64748b" }}>
                    Aucun événement planifié pour le moment.
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {evenementsList.map((evt) => (
                      <div key={evt.id}
                        className="rounded-2xl p-5 flex gap-4 items-start transition-shadow hover:shadow-md"
                        style={{ background: "#ffffff", border: "1px solid var(--color-primary-100)" }}>
                        {/* Calendrier */}
                        <div className="flex-shrink-0 w-14 h-14 rounded-xl flex flex-col items-center justify-center text-white overflow-hidden"
                          style={{ background: "var(--color-primary)" }}>
                          <span className="text-lg font-extrabold leading-none">
                            {new Date(evt.dateDebut).getDate()}
                          </span>
                          <span className="text-[9px] uppercase opacity-80 font-bold tracking-widest">
                            {new Date(evt.dateDebut).toLocaleString("fr-FR", { month: "short" })}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm mb-1 leading-snug"
                            style={{ color: "var(--color-foreground)" }}>
                            {evt.titre}
                          </h4>
                          {evt.lieu && (
                            <p className="text-xs flex items-center gap-1.5" style={{ color: "#64748b" }}>
                              <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3 flex-shrink-0" stroke="currentColor" strokeWidth="2.5">
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

        {/* ══════════════════════════════════════════════
            9. CTA — Rejoindre la CEEC
        ══════════════════════════════════════════════ */}
        <section className="relative overflow-hidden py-28 px-6">
          {/* Fond bleu profond */}
          <div className="absolute inset-0"
            style={{ background: "linear-gradient(150deg, var(--color-primary) 0%, var(--color-primary-900) 55%, #060c1e 100%)" }} />

          {/* Halos dorés */}
          <div className="absolute -top-24 right-1/4 w-96 h-96 rounded-full pointer-events-none"
            style={{ background: "var(--color-secondary)", opacity: 0.12, filter: "blur(90px)" }} />
          <div className="absolute -bottom-24 -left-12 w-80 h-80 rounded-full pointer-events-none"
            style={{ background: "var(--color-secondary)", opacity: 0.08, filter: "blur(70px)" }} />

          {/* Motif points */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.06]" aria-hidden>
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="cta-dots" width="36" height="36" patternUnits="userSpaceOnUse">
                  <circle cx="18" cy="18" r="1.5" fill="white" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#cta-dots)" />
            </svg>
          </div>

          <div className="relative max-w-2xl mx-auto text-center">
            <SectionLabel label="Rejoignez-nous" />
            <h2 className="text-3xl md:text-5xl font-extrabold mb-6 leading-tight text-white"
              style={{ fontFamily: "var(--font-display)" }}>
              Faites partie de notre{" "}
              <span style={{ color: "var(--color-secondary)" }}>communauté</span>
            </h2>
            <p className="text-base md:text-lg leading-relaxed mb-10"
              style={{ color: "rgba(255,255,255,0.7)" }}>
              Accédez aux ressources de votre église, restez informé des événements
              et connectez-vous à toute la communauté évangélique du Congo.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/sign-up"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-base transition-all duration-200 hover:brightness-110 hover:scale-105"
                style={{ background: "var(--color-secondary)", color: "var(--color-primary-900)" }}>
                Créer mon compte
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <Link href="/contact"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-base text-white transition-all duration-200 hover:bg-white/20"
                style={{ background: "rgba(255,255,255,0.1)", border: "1.5px solid rgba(255,255,255,0.25)" }}>
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
