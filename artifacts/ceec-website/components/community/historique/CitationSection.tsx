export default function CitationSection() {
  return (
    <section className="bg-slate-50 py-16 px-4">
      <div className="max-w-[700px] mx-auto text-center">
        <div className="text-[64px] text-primary/15 font-[Georgia,serif] leading-none -mb-4">&ldquo;</div>
        <p className="text-[clamp(1.1rem,2.5vw,1.35rem)] italic font-semibold text-primary leading-[1.75] m-0 mb-4">
          Allez, faites de toutes les nations des disciples, les baptisant au nom du Père,
          du Fils et du Saint-Esprit, et enseignez-leur à observer tout ce que je vous ai prescrit.
        </p>
        <div className="flex items-center justify-center gap-3">
          <div className="h-px w-10 bg-secondary" />
          <span className="text-[13px] font-bold text-secondary uppercase tracking-[0.08em]">
            Matthieu 28 : 19-20
          </span>
          <div className="h-px w-10 bg-secondary" />
        </div>
      </div>
    </section>
  );
}
