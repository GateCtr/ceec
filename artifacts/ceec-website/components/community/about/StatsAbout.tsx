import { CalendarDays, Church, MapPin, Users } from "lucide-react";
import type { CommunauteStats } from "@/lib/queries/community";

interface StatsAboutProps {
  stats: CommunauteStats;
}

export default function StatsAbout({ stats }: StatsAboutProps) {
  return (
    <section className="bg-white py-14 px-4 border-b border-slate-100">
      <div className="max-w-[900px] mx-auto grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))]">
        {[
          { valeur: stats.anneeFondation, label: "Année de fondation",  icon: <CalendarDays size={28} /> },
          { valeur: stats.nbEglises, label: "Paroisses membres", icon: <Church size={28} /> },
          { valeur: stats.nbProvinces,    label: "Provinces couvertes", icon: <MapPin size={28} /> },
          { valeur: stats.nbFideles,      label: "Fidèles",             icon: <Users size={28} /> },
        ].map((s, i) => (
          <div
            key={i}
            className={`text-center py-8 px-4 ${i < 3 ? "border-r border-slate-100" : ""}`}
          >
            <div className="mb-2 flex justify-center text-primary">{s.icon}</div>
            <div className="text-[32px] font-black text-primary leading-none">{s.valeur}</div>
            <div className="text-[13px] text-muted-foreground mt-1.5 font-medium">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
