import { Scale, CalendarDays, MapPin, Globe } from "lucide-react";

export default function IdentiteSection() {
  return (
    <section className="bg-slate-50 py-16 px-4">
      <div className="max-w-[960px] mx-auto">
        <div className="text-center mb-9">
          <span className="inline-block text-[11px] font-bold tracking-[0.12em] uppercase text-primary bg-primary/8 rounded-[20px] px-3.5 py-1 mb-3">
            Reconnaissance Légale
          </span>
          <h2 className="text-[clamp(1.5rem,3vw,2rem)] font-extrabold text-primary m-0">
            Statut Juridique &amp; Siège Social
          </h2>
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-5">
          {[
            { icon: <Scale size={22} />, titre: "Personnalité Juridique", val: "N°609/Cab/JU&DH/2011", sub: "Ministère de la Justice & Droits Humains, RDC" },
            { icon: <CalendarDays size={22} />, titre: "Date de Fondation", val: "12 Janvier 2009", sub: "Kinshasa, Commune de Ngaliema" },
            { icon: <MapPin size={22} />, titre: "Siège Social", val: "N°04 bis, Av. Saulona", sub: "Quartier Musey, Commune de Ngaliema, Kinshasa" },
            { icon: <Globe size={22} />, titre: "Champ d'Action", val: "RDC → Afrique → Monde", sub: "Durée indéterminée selon les Statuts (Titre I, Ch. IV)" },
          ].map((item) => (
            <div key={item.titre} className="bg-white rounded-[14px] p-6 border border-border flex gap-3.5 items-start">
              <span className="w-11 h-11 rounded-[10px] shrink-0 bg-primary/8 flex items-center justify-center text-primary">
                {item.icon}
              </span>
              <div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-[0.06em] mb-1">{item.titre}</div>
                <div className="text-[15px] font-extrabold text-primary mb-1">{item.val}</div>
                <div className="text-[13px] text-muted-foreground leading-normal">{item.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
