import { jalons } from "@/lib/data/community-history";

export default function TimelineSection() {
  return (
    <section className="bg-slate-50 py-20 px-4">
      <div className="max-w-[940px] mx-auto">
        <div className="text-center mb-14">
          <span className="inline-block text-[11px] font-bold tracking-[0.12em] uppercase text-primary bg-primary/8 rounded-[20px] px-3.5 py-1 mb-3">
            Chronologie
          </span>
          <h2 className="text-[clamp(1.5rem,3vw,2rem)] font-extrabold text-primary m-0">
            Les grandes étapes
          </h2>
        </div>

        <div className="relative">
          {/* Ligne centrale */}
          <div
            className="absolute top-0 bottom-0 w-0.5 opacity-20"
            style={{
              left: "calc(50% - 1px)",
              background: "linear-gradient(to bottom, #c59b2e, #1e3a8a, #c59b2e)",
            }}
          />

          <div className="flex flex-col gap-12">
            {jalons.map((j, i) => (
              <div
                key={i}
                className="grid grid-cols-[1fr_52px_1fr] items-start gap-5"
              >
                {/* Côté gauche */}
                <div className="flex justify-end">
                  {i % 2 === 0 ? (
                    <div
                      className="bg-white rounded-[14px] p-7 border border-border max-w-[390px] shadow-[0_4px_20px_rgba(0,0,0,0.05)]"
                      style={{ borderLeft: `4px solid ${j.couleur}` }}
                    >
                      <div
                        className="text-[13px] font-extrabold mb-1.5 uppercase tracking-[0.06em]"
                        style={{ color: j.couleur }}
                      >
                        {j.annee}
                      </div>
                      <h3 className="text-base font-extrabold text-primary m-0 mb-2.5">
                        {j.titre}
                      </h3>
                      <p className={`text-sm text-muted-foreground leading-[1.8] ${"items" in j && j.items ? "m-0 mb-2.5" : "m-0 mb-3.5"}`}>
                        {j.description}
                      </p>
                      {"items" in j && j.items && (
                        <ul className="m-0 mb-3.5 pl-1 list-none flex flex-col gap-1.5">
                          {(j.items as string[]).map((item, idx) => (
                            <li key={idx} className="flex gap-2 items-start text-[13px] text-slate-700 leading-[1.6]">
                              <span className="font-black shrink-0 mt-0.5" style={{ color: j.couleur }}>›</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                      <div className="flex gap-1.5 flex-wrap">
                        {j.tags.map((t) => (
                          <span
                            key={t}
                            className={`text-[11px] font-bold tracking-wider uppercase px-2.5 py-[3px] rounded-[20px] ${
                              j.couleur === "#c59b2e"
                                ? "bg-secondary/10"
                                : "bg-primary/[0.07]"
                            }`}
                            style={{ color: j.couleur }}
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>

                {/* Point central */}
                <div className="flex justify-center pt-1.5">
                  <div
                    className="w-11 h-11 rounded-full border-4 border-white flex items-center justify-center shrink-0"
                    style={{
                      background: j.couleur,
                      boxShadow: `0 0 0 3px ${j.couleur}35`,
                    }}
                  >
                    <div className="w-2.5 h-2.5 rounded-full bg-white" />
                  </div>
                </div>

                {/* Côté droit */}
                <div>
                  {i % 2 !== 0 ? (
                    <div
                      className="bg-white rounded-[14px] p-7 border border-border max-w-[390px] shadow-[0_4px_20px_rgba(0,0,0,0.05)]"
                      style={{ borderLeft: `4px solid ${j.couleur}` }}
                    >
                      <div
                        className="text-[13px] font-extrabold mb-1.5 uppercase tracking-[0.06em]"
                        style={{ color: j.couleur }}
                      >
                        {j.annee}
                      </div>
                      <h3 className="text-base font-extrabold text-primary m-0 mb-2.5">
                        {j.titre}
                      </h3>
                      <p className={`text-sm text-muted-foreground leading-[1.8] ${"items" in j && j.items ? "m-0 mb-2.5" : "m-0 mb-3.5"}`}>
                        {j.description}
                      </p>
                      {"items" in j && j.items && (
                        <ul className="m-0 mb-3.5 pl-1 list-none flex flex-col gap-1.5">
                          {(j.items as string[]).map((item, idx) => (
                            <li key={idx} className="flex gap-2 items-start text-[13px] text-slate-700 leading-[1.6]">
                              <span className="font-black shrink-0 mt-0.5" style={{ color: j.couleur }}>›</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                      <div className="flex gap-1.5 flex-wrap">
                        {j.tags.map((t) => (
                          <span
                            key={t}
                            className={`text-[11px] font-bold tracking-wider uppercase px-2.5 py-[3px] rounded-[20px] ${
                              j.couleur === "#c59b2e"
                                ? "bg-secondary/10"
                                : "bg-primary/[0.07]"
                            }`}
                            style={{ color: j.couleur }}
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
