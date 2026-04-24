import { Users, Heart, Shield, BookMarked } from "lucide-react";

export default function AdhesionSection() {
  return (
    <section className="bg-slate-50 py-20 px-4">
      <div className="max-w-[900px] mx-auto">
        <div className="text-center mb-12">
          <span className="inline-block text-[11px] font-bold tracking-[0.12em] uppercase text-primary bg-primary/8 rounded-[20px] px-3.5 py-1 mb-3">
            Nous rejoindre
          </span>
          <h2 className="text-[clamp(1.5rem,3vw,2rem)] font-extrabold text-primary m-0">
            Conditions d&apos;Adhésion
          </h2>
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-5">
          {[
            {
              icon: <Users size={24} />,
              titre: "Ouverte à Tous",
              texte: "L'adhésion est libre pour toute personne sans distinction de sexe, race, tribu, langue ou ethnie.",
            },
            {
              icon: <Heart size={24} />,
              titre: "Foi en Jésus-Christ",
              texte: "Croire et recevoir Jésus-Christ comme Seigneur et Sauveur — condition fondamentale d'appartenance à la communauté.",
            },
            {
              icon: <Shield size={24} />,
              titre: "Baptême par Immersion",
              texte: "Se faire baptiser par immersion et s'engager à participer à toutes les activités socio-spirituelles de l'assemblée.",
            },
            {
              icon: <BookMarked size={24} />,
              titre: "Trois Catégories de Membres",
              texte: "Membres effectifs (organe de décision), membres adhérents (baptisés), membres sympathisants (soutien matériel ou spirituel).",
            },
          ].map((item) => (
            <div key={item.titre} className="bg-white rounded-[14px] p-7 border border-border flex flex-col gap-2.5">
              <span className="text-primary">{item.icon}</span>
              <h3 className="text-base font-extrabold text-primary m-0">{item.titre}</h3>
              <p className="text-sm text-muted-foreground leading-[1.7] m-0">{item.texte}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
