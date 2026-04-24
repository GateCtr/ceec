import { SectionLabel } from "@/components/community";

interface StatsSectionProps {
  stats: { valeur: string; label: string; icon: React.ReactNode }[];
}

export default function StatsSection({ stats }: StatsSectionProps) {
  return (
    <section className="relative py-20 px-6 overflow-hidden"
      style={{ background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-900) 60%, #060c1e 100%)" }}>
      {/* Motif de fond */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.06]" aria-hidden>
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="stat-dots" width="32" height="32" patternUnits="userSpaceOnUse">
              <circle cx="16" cy="16" r="1.5" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#stat-dots)" />
        </svg>
      </div>

      {/* Halos */}
      <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full pointer-events-none"
        style={{ background: "var(--color-secondary)", opacity: 0.1, filter: "blur(70px)" }} />
      <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full pointer-events-none"
        style={{ background: "var(--color-secondary)", opacity: 0.07, filter: "blur(60px)" }} />

      <div className="relative max-w-[1280px] mx-auto">
        <div className="text-center mb-14">
          <SectionLabel label="Notre impact" />
          <h2 className="text-3xl md:text-4xl font-bold text-white font-display">
            La CEEC en chiffres
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat) => (
            <div key={stat.label}
              className="flex flex-col items-center text-center py-8 px-4 rounded-2xl"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <span className="mb-3 flex justify-center">{stat.icon}</span>
              <span className="font-extrabold text-3xl md:text-4xl leading-none mb-2 text-secondary font-display">
                {stat.valeur}
              </span>
              <span className="text-xs font-medium uppercase tracking-widest"
                style={{ color: "rgba(255,255,255,0.6)" }}>
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
