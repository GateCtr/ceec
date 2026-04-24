import { narration } from "@/lib/data/community-history";

export default function NarrationSection() {
  return (
    <section className="bg-white py-20 px-4">
      <div className="max-w-[800px] mx-auto">
        <div className="text-center mb-10">
          <span className="inline-block text-[11px] font-bold tracking-[0.12em] uppercase text-primary bg-primary/8 rounded-[20px] px-3.5 py-1 mb-3">
            Récit officiel
          </span>
          <h2 className="text-[clamp(1.4rem,3vw,1.9rem)] font-extrabold text-primary m-0">
            L&apos;histoire de la CEEC
          </h2>
        </div>

        <div className="border-l-[3px] border-l-secondary pl-7 flex flex-col gap-5">
          {narration.split("\n\n").map((para, i) => (
            <p key={i} className="text-base text-slate-700 leading-[1.9] m-0">
              {para}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
