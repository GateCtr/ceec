import { departements } from "@/lib/data/community-about";

export default function DepartementsSection() {
  return (
    <section id="departements" className="bg-slate-50 py-20 px-4">
      <div className="max-w-[1100px] mx-auto">
        <div className="text-center mb-12">
          <span className="inline-block text-[11px] font-bold tracking-[0.12em] uppercase text-primary bg-primary/8 rounded-[20px] px-3.5 py-1 mb-3">
            Vie de l&apos;Église Locale
          </span>
          <h2 className="text-[clamp(1.5rem,3vw,2rem)] font-extrabold text-primary m-0">
            Départements de l&apos;Église Locale
          </h2>
          <p className="text-muted-foreground text-[15px] max-w-[560px] mx-auto mt-3">
            Chaque assemblée locale de la CEEC est organisée en {departements.length} départements ministériels.
          </p>
        </div>

        <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4.5">
          {departements.map((d) => (
            <div key={d.titre} className="bg-white rounded-xl py-5 px-5.5 border border-[#e8edf5] flex gap-3 items-start">
              <span className="w-10 h-10 shrink-0 rounded-[9px] bg-primary/7 flex items-center justify-center text-primary">
                {d.icon}
              </span>
              <div>
                <div className="text-sm font-extrabold text-primary mb-1">{d.titre}</div>
                <div className="text-[13px] text-muted-foreground leading-relaxed">{d.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
