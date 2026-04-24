import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function HeroAbout() {
  return (
    <section
      className="min-h-[70vh] flex flex-col items-center justify-center pt-32 pb-20 px-4 text-white relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #1e3a8a 0%, #1e2d6b 100%)" }}
    >
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      <div
        aria-hidden
        className="absolute top-1/4 right-[15%] w-[500px] h-[500px] rounded-full bg-secondary opacity-[0.06] blur-[120px]"
      />

      <div className="max-w-[760px] mx-auto text-center relative">
        <span className="inline-block text-xs font-bold tracking-[0.12em] uppercase text-secondary bg-secondary/12 rounded-[20px] px-4 py-1 mb-5">
          Communauté des Églises Évangéliques au Congo
        </span>

        <h1 className="text-[clamp(2rem,5vw,3rem)] font-black mb-5 leading-[1.15] text-white">
          À propos de la CEEC
        </h1>
        <p className="text-lg opacity-80 leading-[1.8] mx-auto mb-2 max-w-[620px]">
          Fondée le <strong className="text-white">12 janvier 2009</strong> à Kinshasa,
          la Communauté des Églises Évangéliques au Congo est une association sans but lucratif
          dont la vocation est de prêcher l&apos;Évangile éternel et de promouvoir les œuvres sociales
          depuis la RDC jusqu&apos;au monde entier.
        </p>
        <p className="text-sm opacity-55 italic mx-auto mb-8 max-w-[520px]">
          Matthieu 28:19-20 — Jacques 1:27
        </p>

        <div className="flex gap-3 justify-center flex-wrap">
          <Link href="/historique" className="px-7 py-3 rounded-lg bg-secondary text-primary font-bold text-[15px] no-underline">
            <span className="inline-flex items-center gap-1.5">
              Notre histoire <ChevronRight size={16} />
            </span>
          </Link>
          <Link href="/contact" className="px-7 py-3 rounded-lg border-[1.5px] border-white/35 text-white font-semibold text-[15px] no-underline">
            Nous contacter
          </Link>
        </div>
      </div>
    </section>
  );
}
