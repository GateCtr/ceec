import ChurchSectionHeader from "./ChurchSectionHeader";

type Departement = {
  nom: string;
  description?: string;
  icon?: string;
  responsable?: string;
};

type DepartementsConfig = {
  titre?: string;
  sousTitre?: string;
  items?: Departement[];
  bgColor?: string;
};

const DEFAULT_ICONS = ["⛪", "🙏", "📖", "🎵", "👨‍👩‍👧", "🤝", "✝️", "🌍", "💒", "🕊️"];

export default function SectionDepartements({ config }: { config: DepartementsConfig }) {
  const {
    titre = "Nos ministères",
    sousTitre,
    items = [],
    bgColor = "#f8fafc",
  } = config;

  if (items.length === 0) return null;

  return (
    <section className="py-20 px-4" style={{ background: bgColor }}>
      <div className="max-w-[1100px] mx-auto">
        <ChurchSectionHeader
          badge={sousTitre ?? "Vie de l'église"}
          title={titre}
          description={`${items.length} départements au service de la communauté`}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((dept, i) => (
            <div
              key={i}
              className="card p-6 flex gap-4 items-start transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="text-[32px] shrink-0 leading-none mt-0.5">
                {dept.icon || DEFAULT_ICONS[i % DEFAULT_ICONS.length]}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-[15px] mb-1" style={{ color: "var(--church-primary, #1e3a8a)" }}>
                  {dept.nom}
                </h3>
                {dept.description && (
                  <p className="text-muted-foreground text-[13px] leading-relaxed m-0">
                    {dept.description}
                  </p>
                )}
                {dept.responsable && (
                  <p className="text-xs font-semibold mt-2" style={{ color: "var(--church-accent, #c59b2e)" }}>
                    {dept.responsable}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
