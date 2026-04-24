import { SectionLabel, SectionTitle } from "@/components/community";
import { missions } from "@/lib/data/community-home";

export default function MissionsSection() {
  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-[1280px] mx-auto">
        <div className="text-center mb-14">
          <SectionLabel label="Nos piliers" />
          <SectionTitle>Trois missions, un seul cœur</SectionTitle>
          <p className="max-w-xl mx-auto leading-relaxed text-muted-foreground">
            Trois engagements fondamentaux qui guident l&apos;action quotidienne
            de la CEEC au service de la nation congolaise.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {missions.map((mission, i) => (
            <div key={mission.titre}
              className={`group relative flex flex-col p-8 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-2 ${
                i === 1 ? "" : "bg-primary-50 border border-primary-100"
              }`}
              style={i === 1
                ? { background: "linear-gradient(155deg, var(--color-primary) 0%, var(--color-primary-900) 100%)", boxShadow: "0 12px 40px rgba(30,58,138,0.4)" }
                : undefined
              }>

              {/* Numéro en filigrane */}
              <span className="absolute top-4 right-5 text-6xl font-black leading-none select-none"
                style={{ color: i === 1 ? "rgba(255,255,255,0.07)" : "rgba(30,58,138,0.06)" }}>
                0{i + 1}
              </span>

              {/* Icône */}
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110 ${
                i === 1 ? "text-secondary" : "bg-primary-100 text-primary"
              }`}
                style={i === 1
                  ? { background: "rgba(197,155,46,0.2)" }
                  : undefined
                }>
                {mission.icon}
              </div>

              {/* Texte */}
              <h3 className={`text-xl font-bold mb-3 font-display ${
                i === 1 ? "text-white" : "text-primary"
              }`}>
                {mission.titre}
              </h3>
              <p className={`text-sm leading-relaxed flex-1 ${
                i === 1 ? "" : "text-muted-foreground"
              }`}
                style={i === 1 ? { color: "rgba(255,255,255,0.72)" } : undefined}>
                {mission.desc}
              </p>

              {i === 1 && (
                <div className="mt-6 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.15)" }}>
                  <span className="text-xs font-bold uppercase tracking-widest text-secondary">
                    Notre priorité
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
