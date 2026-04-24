import Link from "next/link";
import { SectionLabel } from "@/components/community";

export default function CtaSection() {
  return (
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
        <h2 className="text-3xl md:text-5xl font-extrabold mb-6 leading-tight text-white font-display">
          Faites partie de notre{" "}
          <span className="text-secondary">communauté</span>
        </h2>
        <p className="text-base md:text-lg leading-relaxed mb-10"
          style={{ color: "rgba(255,255,255,0.7)" }}>
          Accédez aux ressources de votre église, restez informé des événements
          et connectez-vous à toute la communauté évangélique du Congo.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link href="/sign-up"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-base transition-all duration-200 hover:brightness-110 hover:scale-105 bg-secondary text-primary-900">
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
  );
}
