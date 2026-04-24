import Link from "next/link";
import { safeUrl } from "@/lib/sanitize-url";
import { ChevronDown } from "lucide-react";

type HeroConfig = {
  titre?: string;
  sousTitre?: string;
  description?: string;
  imageUrl?: string;
  bgColor?: string;
  overlayOpacity?: number;
  textAlign?: "center" | "left";
  textColor?: string;
  ctaLabel1?: string;
  ctaHref1?: string;
  ctaLabel2?: string;
  ctaHref2?: string;
};

type EgliseInfo = {
  nom: string;
  ville: string;
  pasteur?: string | null;
  logoUrl?: string | null;
  description?: string | null;
};

export default function SectionHero({
  config,
  eglise,
}: {
  config: HeroConfig;
  eglise: EgliseInfo;
}) {
  const titre = config.titre ?? eglise.nom;
  const sousTitre = config.sousTitre ?? `${eglise.ville}, République Démocratique du Congo`;
  const description = config.description ?? eglise.description ?? null;
  const imageUrl = config.imageUrl ?? null;
  const ctaLabel1 = config.ctaLabel1 ?? "Rejoindre l'église";
  const ctaHref1 = config.ctaHref1 ?? "/c/inscription";
  const ctaLabel2 = config.ctaLabel2 ?? "Voir les événements";
  const ctaHref2 = config.ctaHref2 ?? "/c/evenements";
  const textAlign = config.textAlign ?? "center";
  const textColor = config.textColor || "white";

  const rawOpacity = config.overlayOpacity ?? 60;
  const overlayOpacity = rawOpacity > 1 ? rawOpacity / 100 : rawOpacity;

  const overlayBg = imageUrl
    ? `rgba(15,23,42,${overlayOpacity})`
    : config.bgColor
      ? config.bgColor
      : "linear-gradient(135deg, var(--church-primary, #1e3a8a) 0%, color-mix(in srgb, var(--church-primary, #1e3a8a) 80%, black) 60%, #0f172a 100%)";

  const isCenter = textAlign === "center";

  return (
    <section
      className="relative overflow-hidden flex items-center justify-center -mt-16 pt-32 pb-20 px-4"
      style={{ color: textColor, minHeight: "clamp(480px, 60vh, 700px)", textAlign }}
    >
      {/* Image de fond */}
      {imageUrl && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${imageUrl})` }}
        />
      )}

      {/* Overlay */}
      <div className="absolute inset-0" style={{ background: overlayBg }} />

      {/* Motif croix */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.04]" aria-hidden>
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="church-hero-crosses" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M30 10v20M20 20h20" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#church-hero-crosses)" />
        </svg>
      </div>

      {/* Halo doré */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          top: "20%",
          right: "15%",
          width: 500,
          height: 500,
          background: "var(--church-accent, #c59b2e)",
          opacity: 0.06,
          filter: "blur(120px)",
        }}
      />

      {/* Contenu */}
      <div
        className={`relative max-w-[720px] ${isCenter ? "mx-auto" : ""}`}
        style={{ textAlign }}
      >
        {/* Badge communauté */}
        <span
          className="inline-block text-[11px] font-bold tracking-widest uppercase rounded-full px-4 py-1 mb-6"
          style={{
            color: "var(--church-accent, #c59b2e)",
            background: "rgba(197,155,46,0.12)",
            border: "1px solid rgba(197,155,46,0.3)",
          }}
        >
          Paroisse CEEC
        </span>

        {/* Logo */}
        {eglise.logoUrl && (
          <div className={`mb-6 ${isCenter ? "flex justify-center" : ""}`}>
            <img
              src={eglise.logoUrl}
              alt={eglise.nom}
              className="w-[88px] h-[88px] rounded-full object-cover border-[3px] shadow-xl"
              style={{ borderColor: "var(--church-accent, #c59b2e)" }}
            />
          </div>
        )}

        {/* Titre */}
        <h1
          className="font-black mb-3 leading-[1.15] tracking-tight text-[clamp(2rem,5vw,3rem)]"
          style={{ textShadow: imageUrl ? "0 4px 30px rgba(0,0,0,0.5)" : "none" }}
        >
          {titre}
        </h1>

        {/* Sous-titre */}
        <p className="text-[17px] opacity-85 mb-2">{sousTitre}</p>

        {/* Pasteur */}
        {eglise.pasteur && (
          <p className="text-sm opacity-65">Pasteur : {eglise.pasteur}</p>
        )}

        {/* Description */}
        {description && (
          <p
            className={`mt-5 opacity-85 text-[15px] leading-[1.75] ${isCenter ? "max-w-[580px] mx-auto" : "max-w-[580px]"}`}
          >
            {description}
          </p>
        )}

        {/* Boutons CTA */}
        <div
          className={`flex gap-3.5 mt-8 flex-wrap ${isCenter ? "justify-center" : ""}`}
        >
          <Link
            href={safeUrl(ctaHref1)}
            className="px-7 py-3.5 rounded-[10px] font-bold text-[15px] no-underline shadow-lg transition-all duration-200 hover:brightness-110 hover:scale-[1.02]"
            style={{
              background: "var(--church-accent, #c59b2e)",
              color: "var(--church-primary, #1e3a8a)",
            }}
          >
            {ctaLabel1}
          </Link>
          <Link
            href={safeUrl(ctaHref2)}
            className="px-7 py-3.5 rounded-[10px] font-semibold text-[15px] text-white no-underline transition-all duration-200 hover:bg-white/20 bg-white/14 border border-white/30"
          >
            {ctaLabel2}
          </Link>
        </div>
      </div>

      {/* Flèche scroll */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce opacity-40">
        <ChevronDown size={24} />
      </div>
    </section>
  );
}
