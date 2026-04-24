import { SectionLabel, SectionTitle } from "@/components/community";
import { valeurs } from "@/lib/data/community-home";

export default function ValeursSection() {
  return (
    <section className="py-24 px-6 bg-primary-50">
      <div className="max-w-[1280px] mx-auto">
        <div className="text-center mb-14">
          <SectionLabel label="Ce qui nous unit" />
          <SectionTitle>Nos valeurs fondamentales</SectionTitle>
          <p className="max-w-md mx-auto leading-relaxed text-muted-foreground">
            Ces valeurs guident chacune de nos églises et notre engagement
            envers Dieu et la nation.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {valeurs.map((valeur, i) => (
            <div key={valeur.titre}
              className="group rounded-2xl p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg bg-white border border-primary-100">
              {/* Numéro */}
              <div className="text-xs font-bold uppercase tracking-widest mb-4 text-secondary">
                0{i + 1}
              </div>
              {/* Icône */}
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform duration-200 group-hover:scale-110"
                style={{ background: valeur.fond, color: valeur.couleur }}>
                {valeur.icon}
              </div>
              <h3 className="font-bold mb-2 text-base text-primary">
                {valeur.titre}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {valeur.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
