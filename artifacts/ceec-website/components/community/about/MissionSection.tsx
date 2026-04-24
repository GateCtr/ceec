export default function MissionSection() {
  return (
    <section className="bg-white py-20 px-4">
      <div className="max-w-[1000px] mx-auto">
        <div className="text-center mb-12">
          <span className="inline-block text-[11px] font-bold tracking-[0.12em] uppercase text-primary bg-primary/8 rounded-[20px] px-3.5 py-1 mb-3">
            Ce qui nous anime
          </span>
          <h2 className="text-[clamp(1.5rem,3vw,2rem)] font-extrabold text-primary m-0">
            Nos Objectifs Officiels
          </h2>
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-7">
          <div className="bg-slate-50 rounded-2xl p-10 border border-border border-t-4 border-t-primary">
            <div className="text-[40px] mb-4">📖</div>
            <h3 className="text-xl font-extrabold text-primary mb-2">Prêcher l&apos;Évangile Éternel</h3>
            <p className="text-muted-foreground text-sm leading-[1.8] italic mb-3">
              &ldquo;Allez, faites de toutes les nations des disciples, les baptisant au nom du Père, du Fils et du Saint-Esprit.&rdquo;
            </p>
            <span className="text-xs font-bold text-primary uppercase tracking-[0.06em]">Matthieu 28:19-20</span>
          </div>

          <div className="bg-slate-50 rounded-2xl p-10 border border-border border-t-4 border-t-secondary">
            <div className="text-[40px] mb-4">🤝</div>
            <h3 className="text-xl font-extrabold text-primary mb-2">Promouvoir les Œuvres Sociales</h3>
            <p className="text-muted-foreground text-sm leading-[1.8] italic mb-3">
              &ldquo;La religion pure et sans tache devant Dieu consiste à visiter les orphelins et les veuves dans leur affliction.&rdquo;
            </p>
            <span className="text-xs font-bold text-secondary uppercase tracking-[0.06em]">Jacques 1:27</span>
          </div>

          <div className="bg-slate-50 rounded-2xl p-10 border border-border border-t-4 border-t-emerald-600">
            <div className="text-[40px] mb-4">🌍</div>
            <h3 className="text-xl font-extrabold text-primary mb-2">Rayonner jusqu&apos;au Monde Entier</h3>
            <p className="text-muted-foreground text-sm leading-[1.8] mb-3">
              Le champ d&apos;action de la CEEC s&apos;étend depuis la <strong>RDC</strong>, vers l&apos;<strong>Afrique</strong>,
              et enfin le <strong>monde entier</strong> — jusqu&apos;aux extrémités de la terre.
            </p>
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-[0.06em]">RDC · Afrique · Monde</span>
          </div>
        </div>
      </div>
    </section>
  );
}
