import { doctrine } from "@/lib/data/community-about";

export default function DoctrineSection() {
  return (
    <section id="doctrine" className="bg-slate-50 py-20 px-4">
      <div className="max-w-[1100px] mx-auto">
        <div className="text-center mb-12">
          <span className="inline-block text-[11px] font-bold tracking-[0.12em] uppercase text-primary bg-primary/8 rounded-[20px] px-3.5 py-1 mb-3">
            Ce en quoi nous croyons
          </span>
          <h2 className="text-[clamp(1.5rem,3vw,2rem)] font-extrabold text-primary m-0">
            Notre Doctrine
          </h2>
          <p className="text-muted-foreground text-[15px] max-w-[580px] mx-auto mt-3">
            La CEEC propose l&apos;évangile des saintes Écritures basées sur la foi chrétienne.
          </p>
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-6">
          {doctrine.map((d) => (
            <div key={d.titre} className="bg-white rounded-[14px] p-7 border border-border shadow-[0_2px_10px_rgba(30,58,138,0.05)]">
              <div className="w-12 h-12 rounded-xl mb-4 bg-primary/8 flex items-center justify-center text-primary">
                {d.icon}
              </div>
              <div className="text-[11px] font-bold text-secondary uppercase tracking-[0.08em] mb-1.5">{d.ref}</div>
              <h3 className="text-base font-extrabold text-primary mb-2.5">{d.titre}</h3>
              <p className="text-sm text-slate-600 leading-[1.75] m-0">{d.texte}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
