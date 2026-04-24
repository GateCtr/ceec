export default function VerseSection() {
  return (
    <section className="relative py-20 px-6 overflow-hidden"
      style={{ background: "linear-gradient(135deg, var(--color-secondary-700) 0%, var(--color-secondary) 50%, var(--color-secondary-500) 100%)" }}>
      {/* Motif */}
      <div className="absolute inset-0 pointer-events-none opacity-10" aria-hidden>
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="verse-crosses" width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M24 8v16M16 16h16" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#verse-crosses)" />
        </svg>
      </div>

      <div className="relative max-w-3xl mx-auto text-center">
        {/* Guillemet décoratif */}
        <div className="text-8xl font-black leading-none mb-2 select-none"
          style={{ color: "rgba(30,58,138,0.2)", fontFamily: "Georgia, serif" }}>
          &ldquo;
        </div>
        <p className="text-2xl md:text-3xl font-bold italic leading-snug mb-6 text-primary-900 font-display"
          style={{ marginTop: "-2rem" }}>
          La religion pure et sans tache devant Dieu notre Père consiste à visiter
          les orphelins et les veuves dans leur affliction.
        </p>
        <div className="flex items-center justify-center gap-3">
          <div className="h-px w-12" style={{ background: "rgba(30,58,138,0.4)" }} />
          <span className="text-sm font-bold uppercase tracking-widest text-primary-800">
            Jacques 1 : 27
          </span>
          <div className="h-px w-12" style={{ background: "rgba(30,58,138,0.4)" }} />
        </div>
      </div>
    </section>
  );
}
