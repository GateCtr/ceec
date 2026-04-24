import { MapPin } from "lucide-react";
import { provinces } from "@/lib/data/community-about";

export default function ProvincesSection() {
  return (
    <section className="bg-white py-20 px-4">
      <div className="max-w-[1100px] mx-auto">
        <div className="text-center mb-12">
          <span className="inline-block text-[11px] font-bold tracking-[0.12em] uppercase text-primary bg-primary/8 rounded-[20px] px-3.5 py-1 mb-3">
            Notre présence sur le terrain
          </span>
          <h2 className="text-[clamp(1.5rem,3vw,2rem)] font-extrabold text-primary m-0">
            Notre Présence en RDC
          </h2>
          <p className="text-muted-foreground text-[15px] max-w-[560px] mx-auto mt-3">
            {provinces.length} provinces — {provinces.reduce((acc, p) => acc + p.paroisses.length, 0)}+ paroisses répertoriées
          </p>
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-6">
          {provinces.map((prov) => (
            <div key={prov.nom} className="bg-slate-50 rounded-[14px] overflow-hidden border border-border">
              <div
                className="py-4 px-6 flex items-center gap-2.5"
                style={{ background: "linear-gradient(90deg, #1e3a8a, #1e2d6b)" }}
              >
                <MapPin size={18} className="text-secondary" />
                <span className="font-extrabold text-white text-sm">{prov.nom}</span>
                <span className="ml-auto bg-secondary/25 text-secondary rounded-[20px] px-2.5 py-0.5 text-xs font-bold">
                  {prov.paroisses.length} paroisses
                </span>
              </div>
              <ul className="m-0 py-3 px-6 list-none">
                {prov.paroisses.map((p) => (
                  <li key={p} className="py-[5px] text-[13px] text-slate-600 border-b border-slate-100 flex items-center gap-[7px]">
                    <span className="w-[5px] h-[5px] rounded-full bg-secondary shrink-0" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
