import Link from "next/link";

export default function CtaHistorique() {
  return (
    <section
      className="py-16 px-4 text-center"
      style={{ background: "linear-gradient(135deg, #1e3a8a, #1e2d6b)" }}
    >
      <div className="max-w-[600px] mx-auto">
        <h2 className="text-[clamp(1.4rem,3vw,2rem)] font-black text-white m-0 mb-3">
          L&apos;histoire continue — rejoignez-nous
        </h2>
        <p className="text-white/70 text-base m-0 mb-7 leading-[1.7]">
          Chaque fidèle, chaque paroisse, chaque serviteur écrit un nouveau chapitre
          de l&apos;histoire de la CEEC.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link
            href="/paroisses"
            className="px-7 py-3 rounded-lg bg-secondary text-primary font-bold text-[15px] no-underline"
          >
            Trouver ma paroisse
          </Link>
          <Link
            href="/a-propos"
            className="px-7 py-3 rounded-lg border-[1.5px] border-white/35 text-white font-semibold text-[15px] no-underline"
          >
            À propos de la CEEC
          </Link>
        </div>
      </div>
    </section>
  );
}
