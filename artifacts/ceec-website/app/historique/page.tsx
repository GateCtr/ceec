import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Notre Histoire | CEEC",
  description:
    "Retracez l'histoire de la Communauté des Églises Évangéliques au Congo depuis sa fondation jusqu'à aujourd'hui.",
};

const jalons = [
  {
    annee: "1960",
    titre: "Fondation de la CEEC",
    description:
      "Dans le contexte de l'indépendance de la République Démocratique du Congo, les pionniers évangéliques créent la Communauté des Églises Évangéliques au Congo. Cette naissance coïncide avec la volonté de construire des institutions congolaises autonomes et enracinées dans la foi biblique.",
    tags: ["Fondation", "Kinshasa"],
    couleur: "#c59b2e",
  },
  {
    annee: "1965–1975",
    titre: "Consolidation et structuration",
    description:
      "La CEEC se dote de ses premiers textes fondateurs — statuts, règlement intérieur et confession de foi. Les premières structures provinciales sont mises en place, permettant à la communauté d'étendre son rayonnement au-delà de Kinshasa vers le Bas-Congo et le Kasaï.",
    tags: ["Organisation", "Expansion"],
    couleur: "#1e3a8a",
  },
  {
    annee: "1980s",
    titre: "Expansion dans les provinces",
    description:
      "La CEEC compte désormais des représentations dans la majorité des provinces congolaises. De nouvelles paroisses s'affilient chaque année. Des programmes de formation théologique sont lancés pour accompagner les pasteurs locaux dans leur ministère.",
    tags: ["Formation", "Provinces"],
    couleur: "#c59b2e",
  },
  {
    annee: "1990s",
    titre: "Partenariats et rayonnement international",
    description:
      "La CEEC établit des partenariats avec des organismes évangéliques internationaux en Afrique, en Europe et en Amérique du Nord. Ces liens renforcent les capacités de la communauté en matière de formation, de missions et d'aide humanitaire, notamment pendant les périodes de crise nationale.",
    tags: ["International", "Partenariats"],
    couleur: "#1e3a8a",
  },
  {
    annee: "2000s",
    titre: "Renforcement institutionnel",
    description:
      "La CEEC modernise sa gouvernance : nouveaux statuts, création de commissions spécialisées (jeunesse, femmes, santé, éducation). L'Assemblée Générale se tient régulièrement et devient le vrai lieu de décision collective pour l'ensemble des églises membres.",
    tags: ["Gouvernance", "Modernisation"],
    couleur: "#c59b2e",
  },
  {
    annee: "2010s",
    titre: "Engagement social et humanitaire",
    description:
      "Face aux crises humanitaires qui touchent plusieurs régions du pays, la CEEC mobilise ses réseaux pour apporter aide alimentaire, soins de santé et soutien psychologique. Des écoles et dispensaires affiliés à la communauté voient le jour dans plusieurs provinces.",
    tags: ["Social", "Humanitaire"],
    couleur: "#1e3a8a",
  },
  {
    annee: "2020s",
    titre: "Transformation numérique",
    description:
      "La CEEC entreprend sa transformation numérique avec le lancement de cette plateforme de gestion communautaire. Chaque paroisse dispose désormais d'un espace membre en ligne pour gérer annonces, événements et fidèles — une première pour la communauté évangélique congolaise.",
    tags: ["Digital", "Innovation"],
    couleur: "#c59b2e",
  },
];

const pionniers = [
  {
    nom: "Les Fondateurs (1960)",
    role: "Visionnaires de la CEEC",
    description:
      "Un groupe de pasteurs et de laïcs convaincus que les chrétiens évangéliques congolais pouvaient s'organiser de manière autonome, ancrée dans la foi et au service de leur nation nouvellement indépendante.",
  },
  {
    nom: "Assemblées Générales successives",
    role: "Organes souverains",
    description:
      "À chaque génération, les délégués des églises membres se sont réunis en assemblée pour adapter la communauté aux défis de leur époque, garantissant la continuité de sa mission évangélique.",
  },
  {
    nom: "Les pasteurs de terrain",
    role: "Piliers locaux",
    description:
      "Des milliers de pasteurs, dans chaque coin du Congo, ont incarné la vision de la CEEC en servant fidèlement leurs communautés, souvent dans des conditions difficiles.",
  },
];

export default function HistoriquePage() {
  return (
    <>
      <Navbar />
      <main>

        {/* Hero */}
        <section style={{
          background: "linear-gradient(135deg, #1e3a8a 0%, #1e2d6b 100%)",
          minHeight: "75vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "8rem 1rem 5rem",
          color: "white",
          position: "relative",
          overflow: "hidden",
        }}>
          <div aria-hidden style={{
            position: "absolute", inset: 0, opacity: 0.04,
            backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }} />

          {/* Halo or */}
          <div aria-hidden style={{
            position: "absolute", top: "25%", left: "15%",
            width: 500, height: 500, borderRadius: "50%",
            background: "#c59b2e", opacity: 0.05, filter: "blur(120px)",
            pointerEvents: "none",
          }} />

          <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center", position: "relative" }}>
            <span style={{
              display: "inline-block", fontSize: 12, fontWeight: 700, letterSpacing: "0.12em",
              textTransform: "uppercase", color: "rgba(197,155,46,1)",
              background: "rgba(197,155,46,0.12)", borderRadius: 20, padding: "4px 16px", marginBottom: 20,
            }}>
              Depuis 1960
            </span>
            <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 900, margin: "0 0 20px", lineHeight: 1.15, color: "#fff" }}>
              Notre Histoire
            </h1>
            <p style={{ fontSize: 18, opacity: 0.8, lineHeight: 1.7, margin: "0 auto", maxWidth: 580 }}>
              Plus de six décennies de foi, de service et de témoignage évangélique
              au cœur de la République Démocratique du Congo.
            </p>

            <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 32, flexWrap: "wrap" }}>
              <Link href="/a-propos" style={{
                padding: "12px 28px", borderRadius: 8, background: "#c59b2e",
                color: "#1e3a8a", fontWeight: 700, fontSize: 15, textDecoration: "none",
              }}>
                À propos de la CEEC →
              </Link>
            </div>
          </div>
        </section>

        {/* Intro */}
        <section style={{ background: "white", padding: "4rem 1rem" }}>
          <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center" }}>
            <p style={{ fontSize: 17, color: "#475569", lineHeight: 1.9, margin: 0 }}>
              La CEEC est née de la conviction que les chrétiens évangéliques congolais
              devaient s&apos;unir dans un cadre institutionnel propre, capable de porter leur foi
              collective et de répondre aux enjeux spirituels, sociaux et culturels de leur nation.
              De la fondation en 1960 à la plateforme numérique d&apos;aujourd&apos;hui, voici les grandes
              étapes qui ont façonné notre communauté.
            </p>
          </div>
        </section>

        {/* Timeline */}
        <section style={{ background: "#f8fafc", padding: "5rem 1rem" }}>
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <h2 style={{
              textAlign: "center", fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
              fontWeight: 800, color: "#1e3a8a", margin: "0 0 56px",
            }}>
              Les grandes étapes
            </h2>

            <div style={{ position: "relative" }}>
              {/* Ligne centrale */}
              <div style={{
                position: "absolute", left: "calc(50% - 1px)", top: 0, bottom: 0,
                width: 2, background: "linear-gradient(to bottom, #c59b2e, #1e3a8a, #c59b2e)",
                opacity: 0.25,
              }} />

              <div style={{ display: "flex", flexDirection: "column", gap: 48 }}>
                {jalons.map((j, i) => (
                  <div key={i} style={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto 1fr",
                    alignItems: "start",
                    gap: 24,
                  }}>
                    {/* Côté gauche : contenu sur pair, vide sur impair */}
                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                      {i % 2 === 0 ? (
                        <div style={{
                          background: "white", borderRadius: 14, padding: "1.75rem",
                          border: "1px solid #e2e8f0", maxWidth: 380,
                          boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                          borderLeft: `4px solid ${j.couleur}`,
                        }}>
                          <div style={{ fontSize: 22, fontWeight: 900, color: j.couleur, marginBottom: 6 }}>
                            {j.annee}
                          </div>
                          <h3 style={{ fontSize: 16, fontWeight: 800, color: "#1e3a8a", margin: "0 0 10px" }}>
                            {j.titre}
                          </h3>
                          <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.8, margin: "0 0 14px" }}>
                            {j.description}
                          </p>
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                            {j.tags.map((t) => (
                              <span key={t} style={{
                                fontSize: 11, fontWeight: 700, letterSpacing: "0.06em",
                                textTransform: "uppercase", padding: "3px 10px",
                                background: j.couleur === "#c59b2e" ? "rgba(197,155,46,0.12)" : "rgba(30,58,138,0.08)",
                                color: j.couleur,
                                borderRadius: 20,
                              }}>
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>

                    {/* Point central */}
                    <div style={{
                      width: 44, height: 44, borderRadius: "50%",
                      background: j.couleur, border: "4px solid white",
                      boxShadow: `0 0 0 3px ${j.couleur}40`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0, marginTop: 4,
                    }}>
                      <div style={{ width: 10, height: 10, borderRadius: "50%", background: "white" }} />
                    </div>

                    {/* Côté droit : vide sur pair, contenu sur impair */}
                    <div>
                      {i % 2 !== 0 ? (
                        <div style={{
                          background: "white", borderRadius: 14, padding: "1.75rem",
                          border: "1px solid #e2e8f0", maxWidth: 380,
                          boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                          borderLeft: `4px solid ${j.couleur}`,
                        }}>
                          <div style={{ fontSize: 22, fontWeight: 900, color: j.couleur, marginBottom: 6 }}>
                            {j.annee}
                          </div>
                          <h3 style={{ fontSize: 16, fontWeight: 800, color: "#1e3a8a", margin: "0 0 10px" }}>
                            {j.titre}
                          </h3>
                          <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.8, margin: "0 0 14px" }}>
                            {j.description}
                          </p>
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                            {j.tags.map((t) => (
                              <span key={t} style={{
                                fontSize: 11, fontWeight: 700, letterSpacing: "0.06em",
                                textTransform: "uppercase", padding: "3px 10px",
                                background: j.couleur === "#c59b2e" ? "rgba(197,155,46,0.12)" : "rgba(30,58,138,0.08)",
                                color: j.couleur,
                                borderRadius: 20,
                              }}>
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

        {/* Pionniers */}
        <section style={{ background: "white", padding: "5rem 1rem" }}>
          <div style={{ maxWidth: 1000, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <h2 style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 800, color: "#1e3a8a", margin: "0 0 12px" }}>
                Ceux qui ont bâti la CEEC
              </h2>
              <p style={{ color: "#64748b", fontSize: 16, maxWidth: 520, margin: "0 auto" }}>
                Chaque génération a transmis le flambeau à la suivante
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))", gap: 24 }}>
              {pionniers.map((p) => (
                <div key={p.nom} style={{
                  background: "#f8fafc", borderRadius: 14, padding: "2rem",
                  border: "1px solid #e2e8f0",
                }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: "50%",
                    background: "linear-gradient(135deg, #1e3a8a, #1e2d6b)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 22, marginBottom: 16,
                  }}>
                    🙏
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: "#1e3a8a", margin: "0 0 4px" }}>{p.nom}</h3>
                  <div style={{ fontSize: 12, color: "#c59b2e", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
                    {p.role}
                  </div>
                  <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.8, margin: 0 }}>{p.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{
          background: "linear-gradient(135deg, #1e3a8a, #1e2d6b)",
          padding: "4rem 1rem", textAlign: "center",
        }}>
          <div style={{ maxWidth: 600, margin: "0 auto" }}>
            <h2 style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)", fontWeight: 900, color: "#fff", margin: "0 0 12px" }}>
              Faites partie de l&apos;histoire
            </h2>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 16, margin: "0 0 28px", lineHeight: 1.6 }}>
              L&apos;histoire de la CEEC continue de s&apos;écrire. Rejoignez votre paroisse et
              contribuez à cette belle aventure de foi.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/paroisses" style={{
                padding: "12px 28px", borderRadius: 8, background: "#c59b2e",
                color: "#1e3a8a", fontWeight: 700, fontSize: 15, textDecoration: "none",
              }}>
                Trouver ma paroisse
              </Link>
              <Link href="/a-propos" style={{
                padding: "12px 28px", borderRadius: 8, border: "1.5px solid rgba(255,255,255,0.35)",
                color: "white", fontWeight: 600, fontSize: 15, textDecoration: "none",
              }}>
                À propos de la CEEC
              </Link>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
