import Link from "next/link";
import NavbarServer from "@/components/NavbarServer";
import Footer from "@/components/Footer";
import { prisma } from "@/lib/db";

export const metadata = {
  title: "À propos | CEEC",
  description:
    "Découvrez la Communauté des Églises Évangéliques au Congo — mission, vision, valeurs et gouvernance.",
};

async function getStats() {
  try {
    const [nbEglises, configEntries] = await Promise.all([
      prisma.eglise.count({ where: { statut: "actif" } }),
      prisma.communauteConfig.findMany(),
    ]);
    const cfg = Object.fromEntries(configEntries.map((c) => [c.cle, c]));
    return {
      nbEglises,
      nbProvinces: cfg["nb_provinces"]?.valeur ?? "26",
      nbFideles: cfg["nb_fideles"]?.valeur ?? "100 000+",
      anneeFondation: cfg["annee_fondation"]?.valeur ?? "1960",
    };
  } catch {
    return { nbEglises: 0, nbProvinces: "26", nbFideles: "100 000+", anneeFondation: "1960" };
  }
}

const valeurs = [
  {
    icon: "✝️",
    titre: "Foi biblique",
    description:
      "Nous nous appuyons sur la Parole de Dieu comme fondement inébranlable de notre foi, notre éthique et notre pratique communautaire.",
  },
  {
    icon: "🤝",
    titre: "Fraternité",
    description:
      "L'unité entre toutes les églises membres est au cœur de notre identité. Nous sommes une famille unie dans la diversité.",
  },
  {
    icon: "🌍",
    titre: "Service",
    description:
      "Servir Dieu, c'est servir notre prochain. Nous œuvrons activement pour le développement social et spirituel des communautés congolaises.",
  },
  {
    icon: "📖",
    titre: "Intégrité",
    description:
      "Nous valorisons la transparence, la responsabilité et l'honnêteté dans toute notre gestion institutionnelle et pastorale.",
  },
  {
    icon: "🕊️",
    titre: "Paix",
    description:
      "Acteurs de paix dans notre nation, nous promouvons la réconciliation, le dialogue et la cohésion sociale au sein de nos communautés.",
  },
  {
    icon: "🌱",
    titre: "Croissance",
    description:
      "Nous croyons à la croissance continue — spirituelle, numérique, structurelle — pour mieux répondre aux besoins de nos fidèles.",
  },
];

const organes = [
  {
    titre: "Assemblée Générale",
    description:
      "Organe souverain de la CEEC, elle regroupe les délégués de toutes les églises membres et se réunit périodiquement pour les décisions stratégiques majeures.",
    icon: "🏛️",
  },
  {
    titre: "Comité Exécutif",
    description:
      "Instance dirigeante permanente chargée de la mise en œuvre des décisions de l'Assemblée Générale et de la gestion courante de la communauté.",
    icon: "⚙️",
  },
  {
    titre: "Conseil des Anciens",
    description:
      "Organe consultatif spirituel composé des pasteurs et anciens expérimentés, garant de la doctrine et de la tradition évangélique de la CEEC.",
    icon: "📿",
  },
  {
    titre: "Commissions Spécialisées",
    description:
      "Des commissions thématiques (évangélisation, éducation, santé, femmes, jeunesse) portent les différentes dimensions du ministère de la CEEC.",
    icon: "🗂️",
  },
];

export default async function AProposPage() {
  const stats = await getStats();

  return (
    <>
      <NavbarServer />
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
          {/* Motif de fond */}
          <div aria-hidden style={{
            position: "absolute", inset: 0, opacity: 0.04,
            backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }} />

          {/* Halo or */}
          <div aria-hidden style={{
            position: "absolute", top: "30%", right: "20%",
            width: 500, height: 500, borderRadius: "50%",
            background: "#c59b2e", opacity: 0.05, filter: "blur(120px)",
            pointerEvents: "none",
          }} />

          <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center", position: "relative" }}>
            <span style={{
              display: "inline-block", fontSize: 12, fontWeight: 700, letterSpacing: "0.12em",
              textTransform: "uppercase", color: "rgba(197,155,46,1)",
              background: "rgba(197,155,46,0.12)", borderRadius: 20, padding: "4px 16px", marginBottom: 20,
            }}>
              Communauté des Églises Évangéliques au Congo
            </span>
            <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 900, margin: "0 0 20px", lineHeight: 1.15, color: "#fff" }}>
              À propos de la CEEC
            </h1>
            <p style={{ fontSize: 18, opacity: 0.8, lineHeight: 1.7, margin: "0 auto", maxWidth: 600 }}>
              Depuis plus de six décennies, la CEEC rassemble et accompagne des milliers d&apos;églises
              évangéliques à travers toute la République Démocratique du Congo.
            </p>

            <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 32, flexWrap: "wrap" }}>
              <Link href="/historique" style={{
                padding: "12px 28px", borderRadius: 8, background: "#c59b2e",
                color: "#1e3a8a", fontWeight: 700, fontSize: 15, textDecoration: "none",
              }}>
                Notre histoire →
              </Link>
              <Link href="/contact" style={{
                padding: "12px 28px", borderRadius: 8, border: "1.5px solid rgba(255,255,255,0.35)",
                color: "white", fontWeight: 600, fontSize: 15, textDecoration: "none",
              }}>
                Nous contacter
              </Link>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section style={{ background: "white", padding: "3.5rem 1rem", borderBottom: "1px solid #f1f5f9" }}>
          <div style={{
            maxWidth: 900, margin: "0 auto",
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 0,
          }}>
            {[
              { valeur: stats.anneeFondation, label: "Année de fondation", icon: "📅" },
              { valeur: String(stats.nbEglises), label: "Églises membres", icon: "⛪" },
              { valeur: stats.nbProvinces, label: "Provinces couvertes", icon: "📍" },
              { valeur: stats.nbFideles, label: "Fidèles", icon: "🙏" },
            ].map((s, i) => (
              <div key={i} style={{
                textAlign: "center", padding: "2rem 1rem",
                borderRight: i < 3 ? "1px solid #f1f5f9" : "none",
              }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
                <div style={{ fontSize: 32, fontWeight: 900, color: "#1e3a8a", lineHeight: 1 }}>{s.valeur}</div>
                <div style={{ fontSize: 13, color: "#64748b", marginTop: 6, fontWeight: 500 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Mission & Vision */}
        <section style={{ background: "#f8fafc", padding: "5rem 1rem" }}>
          <div style={{ maxWidth: 1000, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <h2 style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 800, color: "#1e3a8a", margin: "0 0 12px" }}>
                Mission &amp; Vision
              </h2>
              <p style={{ color: "#64748b", fontSize: 16, maxWidth: 560, margin: "0 auto" }}>
                Ce qui nous anime et ce vers quoi nous tendons chaque jour
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 28 }}>
              {/* Mission */}
              <div style={{
                background: "white", borderRadius: 16, padding: "2.5rem",
                border: "1px solid #e2e8f0",
                borderTop: "4px solid #1e3a8a",
                boxShadow: "0 2px 16px rgba(30,58,138,0.06)",
              }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>🎯</div>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: "#1e3a8a", margin: "0 0 14px" }}>Notre Mission</h3>
                <p style={{ color: "#475569", lineHeight: 1.8, fontSize: 15, margin: 0 }}>
                  Rassembler, encadrer et soutenir les églises évangéliques du Congo dans leur mission
                  d&apos;évangélisation, de formation des disciples et de transformation des communautés,
                  au service de Dieu et de la nation congolaise.
                </p>
              </div>

              {/* Vision */}
              <div style={{
                background: "white", borderRadius: 16, padding: "2.5rem",
                border: "1px solid #e2e8f0",
                borderTop: "4px solid #c59b2e",
                boxShadow: "0 2px 16px rgba(30,58,138,0.06)",
              }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>🌟</div>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: "#1e3a8a", margin: "0 0 14px" }}>Notre Vision</h3>
                <p style={{ color: "#475569", lineHeight: 1.8, fontSize: 15, margin: 0 }}>
                  Être une communauté d&apos;églises évangéliques vivante, unie et influente,
                  qui témoigne de l&apos;Évangile de Jésus-Christ dans chaque province, chaque ville,
                  chaque village de la République Démocratique du Congo.
                </p>
              </div>
            </div>

            {/* Citation */}
            <blockquote style={{
              margin: "40px 0 0",
              background: "linear-gradient(135deg, #1e3a8a, #1e2d6b)",
              borderRadius: 16, padding: "2.5rem",
              textAlign: "center", color: "white",
            }}>
              <p style={{ fontSize: "clamp(1.1rem, 2.5vw, 1.4rem)", fontStyle: "italic", fontWeight: 600, margin: "0 0 12px", lineHeight: 1.6, color: "#fff" }}>
                &ldquo;Que tous soient un, comme toi, Père, tu es en moi, et comme je suis en toi.&rdquo;
              </p>
              <cite style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", fontStyle: "normal", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                Jean 17:21
              </cite>
            </blockquote>
          </div>
        </section>

        {/* Valeurs */}
        <section style={{ background: "white", padding: "5rem 1rem" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <h2 style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 800, color: "#1e3a8a", margin: "0 0 12px" }}>
                Nos Valeurs
              </h2>
              <p style={{ color: "#64748b", fontSize: 16, maxWidth: 500, margin: "0 auto" }}>
                Les principes fondamentaux qui guident notre communauté
              </p>
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 24,
            }}>
              {valeurs.map((v) => (
                <div key={v.titre} style={{
                  background: "#f8fafc", borderRadius: 14, padding: "1.75rem",
                  border: "1px solid #e8edf5",
                  display: "flex", flexDirection: "column", gap: 10,
                }}>
                  <span style={{ fontSize: 32 }}>{v.icon}</span>
                  <h3 style={{ fontSize: 17, fontWeight: 800, color: "#1e3a8a", margin: 0 }}>{v.titre}</h3>
                  <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.7, margin: 0 }}>{v.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Gouvernance */}
        <section style={{ background: "#f8fafc", padding: "5rem 1rem" }}>
          <div style={{ maxWidth: 1000, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <h2 style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 800, color: "#1e3a8a", margin: "0 0 12px" }}>
                Notre Gouvernance
              </h2>
              <p style={{ color: "#64748b", fontSize: 16, maxWidth: 560, margin: "0 auto" }}>
                Une structure organisée pour servir au mieux l&apos;ensemble des églises membres
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24 }}>
              {organes.map((o) => (
                <div key={o.titre} style={{
                  background: "white", borderRadius: 14, padding: "2rem",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                }}>
                  <div style={{ fontSize: 32, marginBottom: 14 }}>{o.icon}</div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: "#1e3a8a", margin: "0 0 10px" }}>{o.titre}</h3>
                  <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.7, margin: 0 }}>{o.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{
          background: "linear-gradient(135deg, #c59b2e, #a07c20)",
          padding: "4rem 1rem", textAlign: "center",
        }}>
          <div style={{ maxWidth: 640, margin: "0 auto" }}>
            <h2 style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)", fontWeight: 900, color: "#1e3a8a", margin: "0 0 12px" }}>
              Rejoignez la famille CEEC
            </h2>
            <p style={{ color: "rgba(30,58,138,0.8)", fontSize: 16, margin: "0 0 28px", lineHeight: 1.6 }}>
              Votre église ou votre famille est la bienvenue dans notre communauté fraternelle.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/paroisses" style={{
                padding: "12px 28px", borderRadius: 8, background: "#1e3a8a",
                color: "white", fontWeight: 700, fontSize: 15, textDecoration: "none",
              }}>
                Trouver ma paroisse
              </Link>
              <Link href="/historique" style={{
                padding: "12px 28px", borderRadius: 8, border: "2px solid #1e3a8a",
                color: "#1e3a8a", fontWeight: 700, fontSize: 15, textDecoration: "none",
              }}>
                Lire notre histoire
              </Link>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
