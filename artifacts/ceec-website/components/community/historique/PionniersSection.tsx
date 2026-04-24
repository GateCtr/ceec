import { categoriesPionniers } from "@/lib/data/community-history";

export default function PionniersSection() {
  return (
    <section className="bg-white py-20 px-4">
      <div className="max-w-[1080px] mx-auto">
        <div className="text-center mb-12">
          <span className="inline-block text-[11px] font-bold tracking-[0.12em] uppercase text-primary bg-primary/8 rounded-[20px] px-3.5 py-1 mb-3">
            Registre officiel
          </span>
          <h2 className="text-[clamp(1.5rem,3vw,2rem)] font-extrabold text-primary m-0 mb-2.5">
            Serviteurs de la Première Heure
          </h2>
          <p className="text-muted-foreground text-[15px] max-w-[620px] mx-auto">
            83 hommes et femmes qui, dès les premiers pas de la CEEC, ont dit oui à la vision —
            pasteurs, anciens, diacres, diaconesses et évangélistes.
          </p>
        </div>

        <div className="flex flex-col gap-8">
          {categoriesPionniers.map((cat) => (
            <div key={cat.label} className="border border-border rounded-2xl overflow-hidden">
              {/* En-tête de catégorie */}
              <div
                className={`border-b border-border px-6 py-3.5 flex items-center gap-2.5 ${
                  cat.couleur === "#c59b2e"
                    ? "bg-secondary/8"
                    : "bg-primary/6"
                }`}
              >
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: cat.couleur }}
                />
                <span
                  className="text-xs font-extrabold uppercase tracking-widest"
                  style={{ color: cat.couleur }}
                >
                  {cat.label}
                </span>
                <span className="text-[11px] text-slate-400 font-semibold">
                  — {cat.membres.length} {cat.membres.length > 1 ? "membres" : "membre"}
                </span>
              </div>

              {/* Grille des noms */}
              <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))]">
                {cat.membres.map((m, idx) => (
                  <div
                    key={m.n}
                    className={`px-5 py-3 border-r border-r-slate-100 border-b border-b-slate-100 flex gap-2.5 items-center ${
                      idx % 2 === 0 ? "bg-white" : "bg-[#fafbfc]"
                    }`}
                  >
                    <span className="text-[10px] font-bold text-[#cbd5e1] font-mono shrink-0 min-w-[22px]">
                      {m.n}
                    </span>
                    <span className="text-[13px] font-semibold text-surface leading-[1.4]">
                      {m.nom}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
