import { organes, comite } from "@/lib/data/community-about";

const accentBorderClass: Record<string, string> = {
  primary: "border-t-4 border-t-primary",
  secondary: "border-t-4 border-t-secondary",
  emerald: "border-t-4 border-t-emerald-600",
};

const accentTextClass: Record<string, string> = {
  primary: "text-primary",
  secondary: "text-secondary",
  emerald: "text-emerald-600",
};

export default function GouvernanceSection() {
  return (
    <section id="gouvernance" className="bg-white py-20 px-4">
      <div className="max-w-[1000px] mx-auto">
        <div className="text-center mb-12">
          <span className="inline-block text-[11px] font-bold tracking-[0.12em] uppercase text-primary bg-primary/8 rounded-[20px] px-3.5 py-1 mb-3">
            Comment nous sommes organisés
          </span>
          <h2 className="text-[clamp(1.5rem,3vw,2rem)] font-extrabold text-primary m-0">
            Nos Organes de Gouvernance
          </h2>
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6 mb-12">
          {organes.map((o) => (
            <div
              key={o.titre}
              className={`bg-slate-50 rounded-2xl p-8 border border-border ${accentBorderClass[o.accent]}`}
            >
              <div className={`mb-3.5 ${accentTextClass[o.accent]}`}>{o.icon}</div>
              <h3 className="text-[17px] font-extrabold text-primary mb-2.5">{o.titre}</h3>
              <p className="text-sm text-muted-foreground leading-[1.75] m-0">{o.texte}</p>
            </div>
          ))}
        </div>

        {/* Comité Exécutif */}
        <div
          className="rounded-[20px] p-10 text-white"
          style={{ background: "linear-gradient(135deg, #1e3a8a 0%, #1e2d6b 100%)" }}
        >
          <h3 className="text-lg font-extrabold mb-6 text-secondary">
            Composition du Comité Exécutif
          </h3>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4">
            {comite.map((m, i) => (
              <div key={i} className="bg-white/[0.07] rounded-[10px] py-4 px-5 border border-white/10">
                <div className="text-xs text-secondary/90 font-semibold uppercase tracking-[0.06em] mb-1">
                  {m.role}
                </div>
                <div className="text-sm text-white font-bold">{m.nom}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
