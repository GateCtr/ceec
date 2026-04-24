import Link from "next/link";
import Image from "next/image";

export default function HeroHome() {
  return (
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
          <div className="relative flex items-center gap-2 px-5 py-2 rounded-full text-xs font-semibold tracking-widest uppercase text-gold"
            style={{ background: "rgba(197,155,46,0.13)", border: "1px solid rgba(197,155,46,0.45)" }}>
            <span className="w-1.5 h-1.5 rounded-full inline-block bg-secondary" />
            Communauté des Églises Évangéliques au Congo
          </div>
        </div>

        {/* Titre principal */}
        <h1 className="font-extrabold leading-[1.1] mb-6 text-4xl sm:text-5xl lg:text-7xl font-display text-white"
          style={{ textShadow: "0 4px 30px rgba(0,0,0,0.5)" }}>
          Ensemble dans la Foi,
          <br />
          <span className="text-secondary">
            unis pour le Congo
          </span>
        </h1>

        {/* Sous-titre */}
        <p className="mx-auto mb-12 leading-relaxed max-w-2xl text-lg md:text-xl"
          style={{ color: "rgba(255,255,255,0.72)" }}>
          Plus de 50 paroisses unies — de Kinshasa à Lubumbashi, Kolwezi, Mulongo
          et Mbandaka — prêchant l&apos;Évangile et servant le peuple congolais.
        </p>

        {/* Boutons */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Link href="/paroisses"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-base transition-all duration-200 hover:brightness-110 hover:scale-105 bg-secondary text-primary-900">
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
  );
}
