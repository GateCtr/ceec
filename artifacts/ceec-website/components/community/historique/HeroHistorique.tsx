import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function HeroHistorique() {
  return (
    <section
      className="min-h-[72vh] flex flex-col items-center justify-center pt-32 pb-20 px-4 text-white relative overflow-hidden"
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
        className="absolute top-1/4 left-[15%] w-[500px] h-[500px] rounded-full bg-secondary opacity-5 blur-[120px]"
      />

      <div className="max-w-[720px] mx-auto text-center relative">
        <span className="inline-block text-xs font-bold tracking-[0.12em] uppercase text-secondary bg-secondary/12 rounded-[20px] px-4 py-1 mb-5">
          Fondée le 12 janvier 2009
        </span>
        <h1 className="text-[clamp(2rem,5vw,3rem)] font-black mb-5 leading-[1.15] text-white">
          Notre Histoire
        </h1>
        <p className="text-lg opacity-80 leading-[1.75] mx-auto mb-8 max-w-[580px]">
          De Ngaliema à Mbandaka, de Lubumbashi à Mulongo — quinze ans de foi, de service
          et de témoignage évangélique à travers la République Démocratique du Congo.
        </p>

        <div className="flex gap-3 justify-center flex-wrap">
          <Link
            href="/a-propos"
            className="px-7 py-3 rounded-lg bg-secondary text-primary font-bold text-[15px] no-underline"
          >
            <span className="inline-flex items-center gap-1.5">
              À propos de la CEEC <ChevronRight size={16} />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
