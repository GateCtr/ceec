import Link from "next/link";

export default function CtaAbout() {
  return (
    <section
      className="py-18 px-4 text-center"
      style={{ background: "linear-gradient(135deg, #c59b2e, #a07c20)" }}
    >
      <div className="max-w-[640px] mx-auto">
        <h2 className="text-[clamp(1.4rem,3vw,2rem)] font-black text-primary mb-3">
          Rejoignez la famille CEEC
        </h2>
        <p className="text-primary/82 text-base mb-7 leading-[1.7]">
          Votre église ou votre famille est la bienvenue dans notre communauté fraternelle.
          L&apos;entrée est libre — Jésus-Christ vous attend.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link href="/paroisses" className="px-[30px] py-[13px] rounded-lg bg-primary text-white font-bold text-[15px] no-underline">
            Trouver ma paroisse
          </Link>
          <Link href="/historique" className="px-[30px] py-[13px] rounded-lg border-2 border-primary text-primary font-bold text-[15px] no-underline">
            Lire notre histoire
          </Link>
        </div>
      </div>
    </section>
  );
}
