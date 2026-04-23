import Link from "next/link";
import NavbarServer from "@/components/NavbarServer";
import Footer from "@/components/Footer";
import { ChevronRight } from "lucide-react";

export const metadata = {
  title: "Notre Histoire | CEEC",
  description:
    "L'histoire de la Communauté des Églises Évangéliques au Congo — de sa fondation le 12 janvier 2009 à Kinshasa jusqu'à son rayonnement dans 6 provinces de la RDC.",
};

/* ─── Narration officielle ───────────────────────────── */
const narration = `La Communauté des Églises Évangéliques au Congo naît le 12 janvier 2009, dans le quartier Ngaliema de Kinshasa, sous la vision de l'Évêque Missionnaire MPANGA MUKUTU Pozard. Ce n'est pas une rupture, mais un appel : celui de fédérer des assemblées évangéliques dispersées autour d'une doctrine commune, d'une identité partagée et d'une mission claire — prêcher l'Évangile éternel et promouvoir les œuvres sociales sur toute l'étendue de la RDC.

Les premières années sont celles de la structuration. Chaque paroisse fondatrice, de Ngaliema à Kinkole, de Badiading à Nganda Musolo, intègre la vision avec ses pasteurs et leurs congrégations. Ensemble, ils jettent les bases d'une communauté qui se veut à la fois doctrinalement solide, fraternellement unie et socialement engagée.

En 2011, l'État congolais reconnaît officiellement la CEEC par la personnalité juridique N°609/Cab/JU&DH/2011, délivrée par le Ministère de la Justice et Droits Humains. Cette reconnaissance consacre le sérieux institutionnel de la communauté et ouvre la voie à un développement accéléré.

La même décennie voit l'Église s'étirer au-delà de Kinshasa. Des paroisses s'implantent à Lubumbashi, à Likasi, puis à Kolwezi — toutes dans le sillage de serviteurs dévoués qui portent la vision dans leur ville, leur quartier, parfois leur village. Dans le Haut-Lomami, des dizaines de paroisses rurales naissent dans le territoire de Mulongo, à Manono, à Kamina Lenge. À Mbandaka et à Gemena, dans la province de l'Équateur, la CEEC plante ses premiers jalons au bord du fleuve Congo.

Du 18 au 24 mai 2015, la CEEC vit l'une des semaines les plus marquantes de son existence. L'Assemblée Générale réunit les délégués du 18 au 22 mai. Le 23 mai, Son Excellence l'Évêque Missionnaire MPANGA MUKUTU Pozard est sacré Président Communautaire et Représentant Légal de la CEEC. Le lendemain, 24 mai, le Temple Nouvelle Jérusalem est solennellement dédié à Dieu — avant que tous les Rev-Pasteurs, Pasteurs, Anciens, Diacres, Diaconesses et Évangélistes de la communauté ne soient consacrés dans leurs ministères respectifs.

En 2016, l'Église adopte son premier manuel complet : statuts, règlement d'ordre intérieur, organisation des cultes, structure des 11 départements ministériels. Ce document fondateur établit pour chaque assemblée locale les bases d'une vie ecclésiale ordonnée et fidèle à la Parole.

En novembre 2021, la CEEC organise son premier grand Marathon de Prière sur le thème "Puissance de la Prière" — trois semaines de rencontres quotidiennes réunissant des centaines de fidèles, conduit personnellement par l'Évêque Missionnaire MPANGA.

Aujourd'hui, en 2026, la CEEC compte plus de 50 paroisses réparties sur 6 provinces de la RDC, gouvernées par trois organes statutaires et structurées autour de 11 départements ministériels. La plateforme numérique inaugurée en 2026 marque une nouvelle étape de cette histoire qui continue de s'écrire.`;

/* ─── Timeline officielle ────────────────────────────── */
const jalons = [
  {
    annee: "12 Janvier 2009",
    titre: "Fondation de la CEEC",
    description:
      "Fondée par l'Évêque Missionnaire MPANGA MUKUTU Pozard et un groupe de serviteurs de la première heure, la Communauté des Églises Évangéliques au Congo voit le jour à Kinshasa, dans la commune de Ngaliema. Son siège est établi au N°04 bis, avenue Saulona, Quartier Musey.",
    tags: ["Fondation", "Kinshasa", "Ngaliema"],
    couleur: "#c59b2e",
  },
  {
    annee: "2009–2011",
    titre: "Les premières paroisses de Kinshasa",
    description:
      "Les premières assemblées rejoignent la vision : Nouvelle Jérusalem (Ngaliema), Bethléhem (Badiading), Montagne de Sion (Mikonga), Source de Vie (Kinkole), Péniel (Nganda Musolo), Champ de Dieu (Pompage). Chaque paroisse est portée par un pasteur engagé, pionnier de la communauté.",
    tags: ["Kinshasa", "Premières paroisses"],
    couleur: "#1e3a8a",
  },
  {
    annee: "2011",
    titre: "Reconnaissance Juridique de l'État congolais",
    description:
      "L'État congolais accorde à la CEEC sa personnalité juridique officielle sous le numéro N°609/Cab/JU&DH/2011, délivrée par le Ministère de la Justice et Droits Humains. La CEEC est enregistrée en tant qu'association sans but lucratif pour une durée indéterminée, avec pour champ d'action la RDC, l'Afrique et le monde entier.",
    tags: ["Légalisation", "ASBL", "RDC"],
    couleur: "#c59b2e",
  },
  {
    annee: "2012–2015",
    titre: "Expansion nationale vers le Katanga et le Lualaba",
    description:
      "La vision déborde Kinshasa. Des paroisses s'implantent à Lubumbashi (Haut-Katanga) : Galilée, Béthanie, La Vérité Libère, Source de Bonheur, Christ Roi. Puis à Likasi et à Kolwezi (Lualaba) : El-Helyon, Rocher de Vie, Jésus sans Frontière. Le Katanga devient la deuxième région d'ancrage de la CEEC.",
    tags: ["Katanga", "Lubumbashi", "Kolwezi"],
    couleur: "#1e3a8a",
  },
  {
    annee: "18 – 24 Mai 2015",
    titre: "La Grande Semaine Historique",
    description: "Quatre événements fondateurs en sept jours.",
    items: [
      "18–22 mai — Assemblée Générale de la CEEC",
      "23 mai — Sacre de S.E. l'Évêque Missionnaire MPANGA MUKUTU Pozard, Président Communautaire & Représentant Légal",
      "24 mai — Dédicace solennelle du Temple Nouvelle Jérusalem",
      "24 mai — Consécration de tous les Rev-Pasteurs, Pasteurs, Anciens, Diacres, Diaconesses & Évangélistes de la CEEC",
    ],
    tags: ["A.G. 2015", "Sacre", "Dédicace", "Consécrations"],
    couleur: "#c59b2e",
  },
  {
    annee: "2016",
    titre: "Adoption du Manuel de l'Église",
    description:
      "La CEEC adopte son premier manuel institutionnel complet : Statuts, Règlement d'Ordre Intérieur, programmes des cultes, liturgies (Sainte Cène, mariage, funérailles), organisation des 11 départements ministériels et attributions de chaque membre du Comité Exécutif. Ce document fondateur structure durablement la vie de toutes les assemblées locales.",
    tags: ["Manuel", "Statuts", "ROI"],
    couleur: "#c59b2e",
  },
  {
    annee: "2016–2020",
    titre: "Enracinement dans le Haut-Lomami et l'Équateur",
    description:
      "Dans le Haut-Lomami, des dizaines de paroisses rurales naissent dans le territoire de Mulongo, à Kamina Lenge, à Manono et à Kabongo. Dans la province de l'Équateur, la CEEC plante ses premiers jalons à Mbandaka, Gemena et Bolomba — portée par des serviteurs qui traversent le fleuve Congo pour annoncer l'Évangile.",
    tags: ["Haut-Lomami", "Équateur", "Mulongo"],
    couleur: "#1e3a8a",
  },
  {
    annee: "Novembre 2021",
    titre: "Marathon de Prière — Puissance de la Prière",
    description:
      "Du 15 novembre au 1er décembre 2021, la CEEC organise son premier grand Marathon de Prière sur le thème \"Puissance de la Prière\" (18h–19h chaque soir). Trois semaines de rencontres quotidiennes conduites par l'Évêque Missionnaire MPANGA, rassemblant en moyenne 300 à 450 fidèles chaque soir — papas, mamans et enfants confondus.",
    tags: ["Prière", "Marathon", "2021"],
    couleur: "#c59b2e",
  },
  {
    annee: "2026 — Aujourd'hui",
    titre: "Plateforme numérique et 50+ paroisses",
    description:
      "La CEEC franchit une nouvelle étape avec le lancement de sa plateforme numérique de gestion communautaire. Chaque assemblée dispose d'un espace membre en ligne pour gérer annonces, événements et fidèles. La communauté compte désormais plus de 50 paroisses dans 6 provinces, portées par un Comité Exécutif renouvelé et des serviteurs fidèles à la vision de 2009.",
    tags: ["Digital", "2026", "50+ paroisses"],
    couleur: "#1e3a8a",
  },
];

/* ─── Serviteurs de la première heure ───────────────── */
const pionniers = [
  {
    nom: "Pasteur Josué NKULU ILUNGA",
    paroisse: "Église de Badiading — Kinshasa",
  },
  {
    nom: "Pasteur NUMBI TWITE Juvénal",
    paroisse: "Église de Kingasani Siforco — Kinshasa",
  },
  {
    nom: "Rév. Pasteur MASENGO KAZADI",
    paroisse: "Église de Kinkole — Kinshasa",
  },
  {
    nom: "Pasteur Samuel KITWA",
    paroisse: "Église de Badara — Kinshasa",
  },
  {
    nom: "Pasteur Charly LUMBALA",
    paroisse: "Église Évangélique Porte du Ciel — Mikonga",
  },
  {
    nom: "Rév. Pasteur ALIDA",
    paroisse: "Église Péniel — Nganda Musolo",
  },
  {
    nom: "Pasteur Jean KALOMBO",
    paroisse: "Église Champ de Dieu — Pompage",
  },
  {
    nom: "Évangéliste Guylain EKOFO",
    paroisse: "Groupe de prière de Pompage — Kinshasa",
  },
  {
    nom: "Rév. Pasteur BERTIN LANDU",
    paroisse: "Nouvelle Jérusalem — Mbandaka, Équateur",
  },
];

/* ─────────────────────────────────────────────────────── */

export default function HistoriquePage() {
  return (
    <>
      <NavbarServer />
      <main>

        {/* ══ HERO ══════════════════════════════════════════ */}
        <section style={{
          background: "linear-gradient(135deg, #1e3a8a 0%, #1e2d6b 100%)",
          minHeight: "72vh",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          padding: "8rem 1rem 5rem",
          color: "white", position: "relative", overflow: "hidden",
        }}>
          <div aria-hidden style={{
            position: "absolute", inset: 0, opacity: 0.04,
            backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }} />
          <div aria-hidden style={{
            position: "absolute", top: "25%", left: "15%",
            width: 500, height: 500, borderRadius: "50%",
            background: "#c59b2e", opacity: 0.05, filter: "blur(120px)",
          }} />

          <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center", position: "relative" }}>
            <span style={{
              display: "inline-block", fontSize: 12, fontWeight: 700, letterSpacing: "0.12em",
              textTransform: "uppercase", color: "rgba(197,155,46,1)",
              background: "rgba(197,155,46,0.12)", borderRadius: 20, padding: "4px 16px", marginBottom: 20,
            }}>
              Fondée le 12 janvier 2009
            </span>
            <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 900, margin: "0 0 20px", lineHeight: 1.15, color: "#fff" }}>
              Notre Histoire
            </h1>
            <p style={{ fontSize: 18, opacity: 0.8, lineHeight: 1.75, margin: "0 auto 32px", maxWidth: 580 }}>
              De Ngaliema à Mbandaka, de Lubumbashi à Mulongo — quinze ans de foi, de service
              et de témoignage évangélique à travers la République Démocratique du Congo.
            </p>

            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/a-propos" style={{
                padding: "12px 28px", borderRadius: 8, background: "#c59b2e",
                color: "#1e3a8a", fontWeight: 700, fontSize: 15, textDecoration: "none",
              }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  À propos de la CEEC <ChevronRight size={16} />
                </span>
              </Link>
            </div>
          </div>
        </section>

        {/* ══ NARRATION ════════════════════════════════════ */}
        <section style={{ background: "white", padding: "5rem 1rem" }}>
          <div style={{ maxWidth: 800, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 40 }}>
              <span style={{
                display: "inline-block", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em",
                textTransform: "uppercase", color: "#1e3a8a",
                background: "rgba(30,58,138,0.08)", borderRadius: 20, padding: "4px 14px", marginBottom: 12,
              }}>Récit officiel</span>
              <h2 style={{ fontSize: "clamp(1.4rem, 3vw, 1.9rem)", fontWeight: 800, color: "#1e3a8a", margin: 0 }}>
                L&apos;histoire de la CEEC
              </h2>
            </div>

            <div style={{
              borderLeft: "3px solid #c59b2e",
              paddingLeft: "1.75rem",
              display: "flex", flexDirection: "column", gap: 20,
            }}>
              {narration.split("\n\n").map((para, i) => (
                <p key={i} style={{
                  fontSize: 16, color: "#334155", lineHeight: 1.9, margin: 0,
                  fontStyle: i === 0 ? "normal" : "normal",
                }}>
                  {para}
                </p>
              ))}
            </div>
          </div>
        </section>

        {/* ══ TIMELINE ═════════════════════════════════════ */}
        <section style={{ background: "#f8fafc", padding: "5rem 1rem" }}>
          <div style={{ maxWidth: 940, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 56 }}>
              <span style={{
                display: "inline-block", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em",
                textTransform: "uppercase", color: "#1e3a8a",
                background: "rgba(30,58,138,0.08)", borderRadius: 20, padding: "4px 14px", marginBottom: 12,
              }}>Chronologie</span>
              <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 800, color: "#1e3a8a", margin: 0 }}>
                Les grandes étapes
              </h2>
            </div>

            <div style={{ position: "relative" }}>
              {/* Ligne centrale */}
              <div style={{
                position: "absolute", left: "calc(50% - 1px)", top: 0, bottom: 0,
                width: 2, background: "linear-gradient(to bottom, #c59b2e, #1e3a8a, #c59b2e)",
                opacity: 0.2,
              }} />

              <div style={{ display: "flex", flexDirection: "column", gap: 48 }}>
                {jalons.map((j, i) => (
                  <div key={i} style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 52px 1fr",
                    alignItems: "start",
                    gap: 20,
                  }}>
                    {/* Côté gauche */}
                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                      {i % 2 === 0 ? (
                        <div style={{
                          background: "white", borderRadius: 14, padding: "1.75rem",
                          border: "1px solid #e2e8f0", maxWidth: 390,
                          boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                          borderLeft: `4px solid ${j.couleur}`,
                        }}>
                          <div style={{ fontSize: 13, fontWeight: 800, color: j.couleur, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                            {j.annee}
                          </div>
                          <h3 style={{ fontSize: 16, fontWeight: 800, color: "#1e3a8a", margin: "0 0 10px" }}>
                            {j.titre}
                          </h3>
                          <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.8, margin: "items" in j && j.items ? "0 0 10px" : "0 0 14px" }}>
                            {j.description}
                          </p>
                          {"items" in j && j.items && (
                            <ul style={{ margin: "0 0 14px", padding: "0 0 0 4px", listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
                              {(j.items as string[]).map((item, idx) => (
                                <li key={idx} style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 13, color: "#334155", lineHeight: 1.6 }}>
                                  <span style={{ color: j.couleur, fontWeight: 900, flexShrink: 0, marginTop: 2 }}>›</span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                            {j.tags.map((t) => (
                              <span key={t} style={{
                                fontSize: 11, fontWeight: 700, letterSpacing: "0.05em",
                                textTransform: "uppercase", padding: "3px 10px",
                                background: j.couleur === "#c59b2e" ? "rgba(197,155,46,0.1)" : "rgba(30,58,138,0.07)",
                                color: j.couleur, borderRadius: 20,
                              }}>
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>

                    {/* Point central */}
                    <div style={{ display: "flex", justifyContent: "center", paddingTop: 6 }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: "50%",
                        background: j.couleur, border: "4px solid white",
                        boxShadow: `0 0 0 3px ${j.couleur}35`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0,
                      }}>
                        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "white" }} />
                      </div>
                    </div>

                    {/* Côté droit */}
                    <div>
                      {i % 2 !== 0 ? (
                        <div style={{
                          background: "white", borderRadius: 14, padding: "1.75rem",
                          border: "1px solid #e2e8f0", maxWidth: 390,
                          boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                          borderLeft: `4px solid ${j.couleur}`,
                        }}>
                          <div style={{ fontSize: 13, fontWeight: 800, color: j.couleur, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                            {j.annee}
                          </div>
                          <h3 style={{ fontSize: 16, fontWeight: 800, color: "#1e3a8a", margin: "0 0 10px" }}>
                            {j.titre}
                          </h3>
                          <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.8, margin: "items" in j && j.items ? "0 0 10px" : "0 0 14px" }}>
                            {j.description}
                          </p>
                          {"items" in j && j.items && (
                            <ul style={{ margin: "0 0 14px", padding: "0 0 0 4px", listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
                              {(j.items as string[]).map((item, idx) => (
                                <li key={idx} style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 13, color: "#334155", lineHeight: 1.6 }}>
                                  <span style={{ color: j.couleur, fontWeight: 900, flexShrink: 0, marginTop: 2 }}>›</span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                            {j.tags.map((t) => (
                              <span key={t} style={{
                                fontSize: 11, fontWeight: 700, letterSpacing: "0.05em",
                                textTransform: "uppercase", padding: "3px 10px",
                                background: j.couleur === "#c59b2e" ? "rgba(197,155,46,0.1)" : "rgba(30,58,138,0.07)",
                                color: j.couleur, borderRadius: 20,
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

        {/* ══ SERVITEURS DE LA PREMIÈRE HEURE ═════════════ */}
        <section style={{ background: "white", padding: "5rem 1rem" }}>
          <div style={{ maxWidth: 1000, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <span style={{
                display: "inline-block", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em",
                textTransform: "uppercase", color: "#1e3a8a",
                background: "rgba(30,58,138,0.08)", borderRadius: 20, padding: "4px 14px", marginBottom: 12,
              }}>Ceux qui ont dit oui les premiers</span>
              <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 800, color: "#1e3a8a", margin: "0 0 10px" }}>
                Serviteurs de la Première Heure
              </h2>
              <p style={{ color: "#64748b", fontSize: 15, maxWidth: 560, margin: "0 auto" }}>
                Ces pasteurs et évangélistes ont rejoint la vision dès l&apos;origine, posant les premières pierres
                de la communauté dans leur quartier et leur ville.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 18 }}>
              {pionniers.map((p) => (
                <div key={p.nom} style={{
                  background: "#f8fafc", borderRadius: 12, padding: "1.25rem 1.5rem",
                  border: "1px solid #e2e8f0",
                  display: "flex", gap: 14, alignItems: "flex-start",
                }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: "50%", flexShrink: 0,
                    background: "linear-gradient(135deg, #1e3a8a, #1e2d6b)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 16,
                  }}>🙏</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: "#1e3a8a", marginBottom: 3 }}>{p.nom}</div>
                    <div style={{ fontSize: 12, color: "#c59b2e", fontWeight: 600 }}>{p.paroisse}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ CITATION CLÔTURE ════════════════════════════ */}
        <section style={{ background: "#f8fafc", padding: "4rem 1rem" }}>
          <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
            <div style={{ fontSize: 64, color: "rgba(30,58,138,0.15)", fontFamily: "Georgia, serif", lineHeight: 1, marginBottom: -16 }}>&ldquo;</div>
            <p style={{
              fontSize: "clamp(1.1rem, 2.5vw, 1.35rem)", fontStyle: "italic", fontWeight: 600,
              color: "#1e3a8a", lineHeight: 1.75, margin: "0 0 16px",
            }}>
              Allez, faites de toutes les nations des disciples, les baptisant au nom du Père,
              du Fils et du Saint-Esprit, et enseignez-leur à observer tout ce que je vous ai prescrit.
            </p>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
              <div style={{ height: 1, width: 40, background: "#c59b2e" }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: "#c59b2e", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Matthieu 28 : 19-20
              </span>
              <div style={{ height: 1, width: 40, background: "#c59b2e" }} />
            </div>
          </div>
        </section>

        {/* ══ CTA ══════════════════════════════════════════ */}
        <section style={{
          background: "linear-gradient(135deg, #1e3a8a, #1e2d6b)",
          padding: "4rem 1rem", textAlign: "center",
        }}>
          <div style={{ maxWidth: 600, margin: "0 auto" }}>
            <h2 style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)", fontWeight: 900, color: "#fff", margin: "0 0 12px" }}>
              L&apos;histoire continue — rejoignez-nous
            </h2>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 16, margin: "0 0 28px", lineHeight: 1.7 }}>
              Chaque fidèle, chaque paroisse, chaque serviteur écrit un nouveau chapitre
              de l&apos;histoire de la CEEC.
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
