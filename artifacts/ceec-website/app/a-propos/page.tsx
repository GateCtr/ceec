import Link from "next/link";
import NavbarServer from "@/components/NavbarServer";
import Footer from "@/components/Footer";
import { prisma } from "@/lib/db";
import {
  BookOpen, Globe, Users, CalendarDays, Church, MapPin,
  ChevronRight, Building2, Settings, Shield, Layers,
  Cross, Mic2, Heart, BookMarked, UserCheck, Landmark,
  Scale, Baby, Music2, Wrench, Handshake, HeartHandshake,
  GraduationCap, Tv2,
} from "lucide-react";

export const metadata = {
  title: "À propos | CEEC",
  description:
    "Découvrez la Communauté des Églises Évangéliques au Congo — identité juridique, mission, doctrine, gouvernance et structure.",
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
      nbProvinces: cfg["nb_provinces"]?.valeur ?? "5+",
      nbFideles:   cfg["nb_fideles"]?.valeur   ?? "2 000+",
      anneeFondation: cfg["annee_fondation"]?.valeur ?? "2009",
    };
  } catch {
    return { nbEglises: 0, nbProvinces: "5+", nbFideles: "2 000+", anneeFondation: "2009" };
  }
}

/* ─────────────────────────────────────────────────────── */
/* Données statiques tirées du document officiel CEEC 2023 */
/* ─────────────────────────────────────────────────────── */

const doctrine = [
  {
    ref: "2 Tim 3:15-16",
    titre: "La Parole de Dieu",
    texte:
      "Nous acceptons la Bible comme unique parole inspirée de Dieu — seule référence pour sonder les Écritures saintes. Ceux qui sont conduits par l'Esprit sont les enfants de Dieu. (Romains 8:4)",
    icon: <BookOpen size={26} />,
  },
  {
    ref: "Psaumes 24:1-2",
    titre: "La Foi en Jésus-Christ",
    texte:
      "Nous croyons en Dieu créateur de l'univers, en Jésus-Christ Fils de Dieu et médiateur, en sa naissance virginale, sa vie sans péché, sa mort expiatoire, sa résurrection corporelle, son ascension triomphale et en l'œuvre du Saint-Esprit.",
    icon: <Cross size={26} />,
  },
  {
    ref: "Actes 2:4 ; 10:44",
    titre: "Le Baptême par Immersion",
    texte:
      "Nous pratiquons le baptême par immersion d'eau comme acte de foi et d'obéissance à Jésus-Christ. L'adhésion est libre pour toute personne sans distinction de sexe, race, tribu, langue ou ethnie.",
    icon: <Shield size={26} />,
  },
  {
    ref: "1 Cor 11:23-26",
    titre: "La Sainte Cène",
    texte:
      "La Sainte Cène est une pratique centrale de la vie de l'Église — mémorial du sacrifice de Jésus-Christ pour la rédemption de l'humanité, célébrée régulièrement au sein de nos assemblées.",
    icon: <Layers size={26} />,
  },
];

const organes = [
  {
    titre: "Assemblée Générale",
    texte:
      "Organe souverain composé de tous les membres du comité exécutif et des représentants provinciaux et de districts. L'A.G. ordinaire se tient une fois par an ; une A.G. extraordinaire peut être convoquée en cas d'urgence pour sauver l'Église.",
    icon: <Building2 size={28} />,
    accent: "#1e3a8a",
  },
  {
    titre: "Comité Exécutif",
    texte:
      "Instance permanente chargée d'exécuter les décisions de l'Assemblée Générale, trouver des solutions aux questions pendantes, et gérer le quotidien de la communauté. Il est convoqué par le Représentant Légal ou son délégué.",
    icon: <Settings size={28} />,
    accent: "#c59b2e",
  },
  {
    titre: "Collège des Serviteurs",
    texte:
      "Composé de tous les ministres exerçant leurs grâces ministérielles dans l'assemblée locale. Il traite les questions en rapport avec la Parole de Dieu et supervise toutes les activités de l'église locale. Réunion hebdomadaire obligatoire.",
    icon: <BookMarked size={28} />,
    accent: "#059669",
  },
];

const comite = [
  { role: "Représentant Légal & Président Communautaire", nom: "Évêque Missionnaire MPANGA MUKUTU Pozard" },
  { role: "1er Suppléant — Administration & Finances",     nom: "—" },
  { role: "2ème Suppléant — Activités Spirituelles",       nom: "—" },
  { role: "Secrétaire Général",                            nom: "—" },
  { role: "Trésorier Général",                             nom: "—" },
  { role: "Chargé de l'Évangélisation",                    nom: "—" },
  { role: "Chargé du Développement Communautaire",         nom: "—" },
];

const departements = [
  { titre: "Évangélisation & Vie de l'Église", icon: <Globe size={22} />, desc: "Gagner des âmes, encadrer les nouveaux convertis et animer la vie spirituelle de l'assemblée." },
  { titre: "Intercession",                     icon: <Heart size={22} />, desc: "Organiser et animer les temps de prière collective — permanence de prière du lundi au vendredi." },
  { titre: "Enseignement",                     icon: <BookOpen size={22} />, desc: "Enseigner la Parole de Dieu, former les membres et assurer les cultes d'enseignement (mercredi)." },
  { titre: "Diaconat & Protocole",             icon: <Handshake size={22} />, desc: "Assurer le service pratique, l'accueil, l'ordre et le protocole lors des cultes et cérémonies." },
  { titre: "Œuvres Féminines (Mamans)",        icon: <HeartHandshake size={22} />, desc: "Encadrer et accompagner les mamans de l'assemblée — culte hebdomadaire tous les jeudis." },
  { titre: "Hommes Adultes (Papas)",           icon: <UserCheck size={22} />, desc: "Rassembler et fortifier les hommes de l'assemblée dans leur foi et leur rôle familial." },
  { titre: "Louange & Logistique",             icon: <Music2 size={22} />, desc: "Diriger la louange et l'adoration, gérer les répétitions des chorales et la logistique des cultes." },
  { titre: "Éducation Chrétienne (JPC & ECODIM)", icon: <GraduationCap size={22} />, desc: "Former la jeunesse (JPC) et les enfants (ECODIM) dans la foi chrétienne chaque dimanche." },
  { titre: "Fiançailles & Mariages",           icon: <Mic2 size={22} />, desc: "Accompagner les couples lors des fiançailles et des cérémonies de mariage selon la liturgie CEEC." },
  { titre: "Développement",                    icon: <Landmark size={22} />, desc: "Initier et organiser les projets de développement communautaire au profit de l'assemblée et du quartier." },
  { titre: "Médias & Communication",           icon: <Tv2 size={22} />, desc: "Assurer la communication, la diffusion et l'enregistrement des activités de l'assemblée." },
];

const provinces = [
  {
    nom: "Kinshasa",
    paroisses: [
      "Nouvelle Jérusalem — Q/Ngaliema",
      "Bethléhem — Q/Badiading",
      "Montagne de Sion — Q/Mikonga",
      "Nazareth — Q/Badara",
      "Montagne de Transfiguration — Q/Gombe",
      "Main de l'Éternel — Masina Ciforco",
      "Source de Vie — Cité Kinkole",
      "Péniel — Q/Nganda Musolo",
      "Champ de Dieu — Q/Cimetière Pompage",
      "Boanerge — Q/Pompage",
    ],
  },
  {
    nom: "Haut-Katanga / Lubumbashi",
    paroisses: [
      "Galilée — Kilobelobe", "Béthanie — Kamasaka",
      "La Vérité Libère — Bel Air", "Source de Bonheur — Kasumbani",
      "Les Élus — Hewa Bora", "Christ Roi — Ruashi",
      "Sion — Golf Karavia", "Ushingi — Luwoshi", "Christ Roi — Kigoma",
    ],
  },
  {
    nom: "Haut-Katanga / Likasi",
    paroisses: [
      "Jésus ma Solution — Centre Ville",
      "Eben-Ézer — Q/SNSS",
      "Feu Dévorant — Q/SAER",
      "Péniel — Cité Kikula",
      "Mapendo — Q/Kamombela",
      "Uzima — Q/Kalipopo",
      "Kamatanda — Q/Kamatanda",
      "Étoile du Matin — Q/Makomeno",
    ],
  },
  {
    nom: "Lualaba / Kolwezi",
    paroisses: [
      "El-Helyon — Q/Latin",
      "Rocher de Vie — Q/Manika",
      "Jésus sans Frontière — Comm. Dilala",
    ],
  },
  {
    nom: "Haut-Lomami / Mulongo & Manono",
    paroisses: [
      "Lumière — Q/Kabamba", "Lupandilo I — Q/Kumbula",
      "Lupandilo II — Q/Kisasa", "De Kiya", "De Besenda",
      "De Mwazaji", "De Kala Commune", "De Mpemba",
      "De Twite", "Jérusalem — Kakombo",
      "De Kakolele — Manono/Kijuki",
      "De Kamina Lenge", "De Katota", "De Lwamba", "Ngoya",
      "De Kabongo",
    ],
  },
  {
    nom: "Province de l'Équateur",
    paroisses: [
      "Nouvelle Jérusalem — Mbandaka",
      "Trône de l'Éternel — Malelembe",
      "Nouvelle Jérusalem — Gemena",
      "Trône de l'Éternel — Bolomba",
    ],
  },
];

/* ─────────────────────────────────────────────────────── */

export default async function AProposPage() {
  const stats = await getStats();

  return (
    <>
      <NavbarServer />
      <main>

        {/* ══ HERO ══════════════════════════════════════════ */}
        <section style={{
          background: "linear-gradient(135deg, #1e3a8a 0%, #1e2d6b 100%)",
          minHeight: "70vh",
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
            position: "absolute", top: "25%", right: "15%",
            width: 500, height: 500, borderRadius: "50%",
            background: "#c59b2e", opacity: 0.06, filter: "blur(120px)",
          }} />

          <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center", position: "relative" }}>
            <span style={{
              display: "inline-block", fontSize: 12, fontWeight: 700,
              letterSpacing: "0.12em", textTransform: "uppercase",
              color: "rgba(197,155,46,1)", background: "rgba(197,155,46,0.12)",
              borderRadius: 20, padding: "4px 16px", marginBottom: 20,
            }}>
              CEEC — ASBL N°609/Cab/JU&amp;DH/2011
            </span>

            <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 900, margin: "0 0 20px", lineHeight: 1.15, color: "#fff" }}>
              À propos de la CEEC
            </h1>
            <p style={{ fontSize: 18, opacity: 0.8, lineHeight: 1.8, margin: "0 auto 8px", maxWidth: 620 }}>
              Fondée le <strong style={{ color: "#fff" }}>12 janvier 2009</strong> à Kinshasa,
              la Communauté des Églises Évangéliques au Congo est une association sans but lucratif
              dont la vocation est de prêcher l&apos;Évangile éternel et de promouvoir les œuvres sociales
              depuis la RDC jusqu&apos;au monde entier.
            </p>
            <p style={{ fontSize: 14, opacity: 0.55, fontStyle: "italic", margin: "0 auto 32px", maxWidth: 520 }}>
              Matthieu 28:19-20 — Jacques 1:27
            </p>

            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/historique" style={{
                padding: "12px 28px", borderRadius: 8, background: "#c59b2e",
                color: "#1e3a8a", fontWeight: 700, fontSize: 15, textDecoration: "none",
              }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  Notre histoire <ChevronRight size={16} />
                </span>
              </Link>
              <Link href="/contact" style={{
                padding: "12px 28px", borderRadius: 8,
                border: "1.5px solid rgba(255,255,255,0.35)",
                color: "white", fontWeight: 600, fontSize: 15, textDecoration: "none",
              }}>
                Nous contacter
              </Link>
            </div>
          </div>
        </section>

        {/* ══ STATS ════════════════════════════════════════ */}
        <section style={{ background: "white", padding: "3.5rem 1rem", borderBottom: "1px solid #f1f5f9" }}>
          <div style={{
            maxWidth: 900, margin: "0 auto",
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 0,
          }}>
            {[
              { valeur: stats.anneeFondation, label: "Année de fondation",  icon: <CalendarDays size={28} /> },
              { valeur: String(stats.nbEglises || "50+"), label: "Paroisses membres", icon: <Church size={28} /> },
              { valeur: stats.nbProvinces,    label: "Provinces couvertes", icon: <MapPin size={28} /> },
              { valeur: stats.nbFideles,      label: "Fidèles",             icon: <Users size={28} /> },
            ].map((s, i) => (
              <div key={i} style={{
                textAlign: "center", padding: "2rem 1rem",
                borderRight: i < 3 ? "1px solid #f1f5f9" : "none",
              }}>
                <div style={{ marginBottom: 8, display: "flex", justifyContent: "center", color: "#1e3a8a" }}>{s.icon}</div>
                <div style={{ fontSize: 32, fontWeight: 900, color: "#1e3a8a", lineHeight: 1 }}>{s.valeur}</div>
                <div style={{ fontSize: 13, color: "#64748b", marginTop: 6, fontWeight: 500 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ══ IDENTITÉ JURIDIQUE ═══════════════════════════ */}
        <section style={{ background: "#f8fafc", padding: "4rem 1rem" }}>
          <div style={{ maxWidth: 960, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 36 }}>
              <span style={{
                display: "inline-block", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em",
                textTransform: "uppercase", color: "#1e3a8a",
                background: "rgba(30,58,138,0.08)", borderRadius: 20, padding: "4px 14px", marginBottom: 12,
              }}>Identité Officielle</span>
              <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 800, color: "#1e3a8a", margin: 0 }}>
                Statut Juridique &amp; Siège Social
              </h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
              {[
                { icon: <Scale size={22} />, titre: "Personnalité Juridique", val: "N°609/Cab/JU&DH/2011", sub: "Ministère de la Justice & Droits Humains, RDC" },
                { icon: <CalendarDays size={22} />, titre: "Date de Fondation", val: "12 Janvier 2009", sub: "Kinshasa, Commune de Ngaliema" },
                { icon: <MapPin size={22} />, titre: "Siège Social", val: "N°04 bis, Av. Saulona", sub: "Quartier Musey, Commune de Ngaliema, Kinshasa" },
                { icon: <Globe size={22} />, titre: "Champ d'Action", val: "RDC → Afrique → Monde", sub: "Durée indéterminée selon les Statuts (Titre I, Ch. IV)" },
              ].map((item) => (
                <div key={item.titre} style={{
                  background: "white", borderRadius: 14, padding: "1.5rem",
                  border: "1px solid #e2e8f0", display: "flex", gap: 14, alignItems: "flex-start",
                }}>
                  <span style={{
                    width: 44, height: 44, borderRadius: 10, flexShrink: 0,
                    background: "rgba(30,58,138,0.08)", display: "flex",
                    alignItems: "center", justifyContent: "center", color: "#1e3a8a",
                  }}>{item.icon}</span>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{item.titre}</div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: "#1e3a8a", marginBottom: 4 }}>{item.val}</div>
                    <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.5 }}>{item.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ MISSION & VISION ═════════════════════════════ */}
        <section style={{ background: "white", padding: "5rem 1rem" }}>
          <div style={{ maxWidth: 1000, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <span style={{
                display: "inline-block", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em",
                textTransform: "uppercase", color: "#1e3a8a",
                background: "rgba(30,58,138,0.08)", borderRadius: 20, padding: "4px 14px", marginBottom: 12,
              }}>Statuts — Titre I, Chapitre III &amp; V</span>
              <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 800, color: "#1e3a8a", margin: 0 }}>
                Nos Objectifs Officiels
              </h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 28 }}>
              <div style={{
                background: "#f8fafc", borderRadius: 16, padding: "2.5rem",
                border: "1px solid #e2e8f0", borderTop: "4px solid #1e3a8a",
              }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>📖</div>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: "#1e3a8a", margin: "0 0 8px" }}>Prêcher l&apos;Évangile Éternel</h3>
                <p style={{ color: "#64748b", fontSize: 14, lineHeight: 1.8, fontStyle: "italic", margin: "0 0 12px" }}>
                  &ldquo;Allez, faites de toutes les nations des disciples, les baptisant au nom du Père, du Fils et du Saint-Esprit.&rdquo;
                </p>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#1e3a8a", textTransform: "uppercase", letterSpacing: "0.06em" }}>Matthieu 28:19-20</span>
              </div>

              <div style={{
                background: "#f8fafc", borderRadius: 16, padding: "2.5rem",
                border: "1px solid #e2e8f0", borderTop: "4px solid #c59b2e",
              }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>🤝</div>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: "#1e3a8a", margin: "0 0 8px" }}>Promouvoir les Œuvres Sociales</h3>
                <p style={{ color: "#64748b", fontSize: 14, lineHeight: 1.8, fontStyle: "italic", margin: "0 0 12px" }}>
                  &ldquo;La religion pure et sans tache devant Dieu consiste à visiter les orphelins et les veuves dans leur affliction.&rdquo;
                </p>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#c59b2e", textTransform: "uppercase", letterSpacing: "0.06em" }}>Jacques 1:27</span>
              </div>

              <div style={{
                background: "#f8fafc", borderRadius: 16, padding: "2.5rem",
                border: "1px solid #e2e8f0", borderTop: "4px solid #059669",
              }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>🌍</div>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: "#1e3a8a", margin: "0 0 8px" }}>Rayonner jusqu&apos;au Monde Entier</h3>
                <p style={{ color: "#64748b", fontSize: 14, lineHeight: 1.8, margin: "0 0 12px" }}>
                  Le champ d&apos;action de la CEEC s&apos;étend depuis la <strong>RDC</strong>, vers l&apos;<strong>Afrique</strong>,
                  et enfin le <strong>monde entier</strong> — jusqu&apos;aux extrémités de la terre.
                </p>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#059669", textTransform: "uppercase", letterSpacing: "0.06em" }}>Statuts — Ch. V</span>
              </div>
            </div>
          </div>
        </section>

        {/* ══ DOCTRINE ═════════════════════════════════════ */}
        <section style={{ background: "#f8fafc", padding: "5rem 1rem" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <span style={{
                display: "inline-block", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em",
                textTransform: "uppercase", color: "#1e3a8a",
                background: "rgba(30,58,138,0.08)", borderRadius: 20, padding: "4px 14px", marginBottom: 12,
              }}>Document Officiel CEEC</span>
              <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 800, color: "#1e3a8a", margin: 0 }}>
                Notre Doctrine
              </h2>
              <p style={{ color: "#64748b", fontSize: 15, maxWidth: 580, margin: "12px auto 0" }}>
                La CEEC propose l&apos;évangile des saintes Écritures basées sur la foi chrétienne.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24 }}>
              {doctrine.map((d) => (
                <div key={d.titre} style={{
                  background: "white", borderRadius: 14, padding: "1.75rem",
                  border: "1px solid #e2e8f0", boxShadow: "0 2px 10px rgba(30,58,138,0.05)",
                }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 12, marginBottom: 16,
                    background: "rgba(30,58,138,0.08)", display: "flex",
                    alignItems: "center", justifyContent: "center", color: "#1e3a8a",
                  }}>{d.icon}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#c59b2e", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>{d.ref}</div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: "#1e3a8a", margin: "0 0 10px" }}>{d.titre}</h3>
                  <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.75, margin: 0 }}>{d.texte}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ GOUVERNANCE ══════════════════════════════════ */}
        <section style={{ background: "white", padding: "5rem 1rem" }}>
          <div style={{ maxWidth: 1000, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <span style={{
                display: "inline-block", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em",
                textTransform: "uppercase", color: "#1e3a8a",
                background: "rgba(30,58,138,0.08)", borderRadius: 20, padding: "4px 14px", marginBottom: 12,
              }}>Statuts — Titre III, Articles 10-14</span>
              <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 800, color: "#1e3a8a", margin: 0 }}>
                Nos Organes de Gouvernance
              </h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24, marginBottom: 48 }}>
              {organes.map((o) => (
                <div key={o.titre} style={{
                  background: "#f8fafc", borderRadius: 16, padding: "2rem",
                  border: "1px solid #e2e8f0",
                  borderTop: `4px solid ${o.accent}`,
                }}>
                  <div style={{ color: o.accent, marginBottom: 14 }}>{o.icon}</div>
                  <h3 style={{ fontSize: 17, fontWeight: 800, color: "#1e3a8a", margin: "0 0 10px" }}>{o.titre}</h3>
                  <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.75, margin: 0 }}>{o.texte}</p>
                </div>
              ))}
            </div>

            {/* Comité Exécutif */}
            <div style={{
              background: "linear-gradient(135deg, #1e3a8a 0%, #1e2d6b 100%)",
              borderRadius: 20, padding: "2.5rem", color: "white",
            }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 24px", color: "#c59b2e" }}>
                Composition du Comité Exécutif
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
                {comite.map((m, i) => (
                  <div key={i} style={{
                    background: "rgba(255,255,255,0.07)", borderRadius: 10, padding: "1rem 1.25rem",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}>
                    <div style={{ fontSize: 12, color: "rgba(197,155,46,0.9)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
                      {m.role}
                    </div>
                    <div style={{ fontSize: 14, color: "white", fontWeight: 700 }}>{m.nom}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ══ DÉPARTEMENTS ═════════════════════════════════ */}
        <section style={{ background: "#f8fafc", padding: "5rem 1rem" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <span style={{
                display: "inline-block", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em",
                textTransform: "uppercase", color: "#1e3a8a",
                background: "rgba(30,58,138,0.08)", borderRadius: 20, padding: "4px 14px", marginBottom: 12,
              }}>Statuts — Article 14</span>
              <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 800, color: "#1e3a8a", margin: 0 }}>
                Départements de l&apos;Église Locale
              </h2>
              <p style={{ color: "#64748b", fontSize: 15, maxWidth: 560, margin: "12px auto 0" }}>
                Chaque assemblée locale de la CEEC est organisée en {departements.length} départements ministériels.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 18 }}>
              {departements.map((d) => (
                <div key={d.titre} style={{
                  background: "white", borderRadius: 12, padding: "1.25rem 1.4rem",
                  border: "1px solid #e8edf5",
                  display: "flex", gap: 12, alignItems: "flex-start",
                }}>
                  <span style={{
                    width: 40, height: 40, flexShrink: 0, borderRadius: 9,
                    background: "rgba(30,58,138,0.07)", display: "flex",
                    alignItems: "center", justifyContent: "center", color: "#1e3a8a",
                  }}>{d.icon}</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: "#1e3a8a", marginBottom: 4 }}>{d.titre}</div>
                    <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6 }}>{d.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ PRÉSENCE GÉOGRAPHIQUE ════════════════════════ */}
        <section style={{ background: "white", padding: "5rem 1rem" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <span style={{
                display: "inline-block", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em",
                textTransform: "uppercase", color: "#1e3a8a",
                background: "rgba(30,58,138,0.08)", borderRadius: 20, padding: "4px 14px", marginBottom: 12,
              }}>Liste Officielle des Paroisses</span>
              <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 800, color: "#1e3a8a", margin: 0 }}>
                Notre Présence en RDC
              </h2>
              <p style={{ color: "#64748b", fontSize: 15, maxWidth: 560, margin: "12px auto 0" }}>
                {provinces.length} provinces — {provinces.reduce((acc, p) => acc + p.paroisses.length, 0)}+ paroisses répertoriées
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
              {provinces.map((prov) => (
                <div key={prov.nom} style={{
                  background: "#f8fafc", borderRadius: 14, overflow: "hidden",
                  border: "1px solid #e2e8f0",
                }}>
                  <div style={{
                    background: "linear-gradient(90deg, #1e3a8a, #1e2d6b)",
                    padding: "1rem 1.5rem", display: "flex", alignItems: "center", gap: 10,
                  }}>
                    <MapPin size={18} color="#c59b2e" />
                    <span style={{ fontWeight: 800, color: "white", fontSize: 14 }}>{prov.nom}</span>
                    <span style={{
                      marginLeft: "auto", background: "rgba(197,155,46,0.25)",
                      color: "#c59b2e", borderRadius: 20, padding: "2px 10px",
                      fontSize: 12, fontWeight: 700,
                    }}>{prov.paroisses.length} paroisses</span>
                  </div>
                  <ul style={{ margin: 0, padding: "0.75rem 1.5rem", listStyle: "none" }}>
                    {prov.paroisses.map((p) => (
                      <li key={p} style={{
                        padding: "5px 0", fontSize: 13, color: "#475569",
                        borderBottom: "1px solid #f1f5f9",
                        display: "flex", alignItems: "center", gap: 7,
                      }}>
                        <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#c59b2e", flexShrink: 0 }} />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ CONDITIONS D'ADHÉSION ════════════════════════ */}
        <section style={{ background: "#f8fafc", padding: "5rem 1rem" }}>
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <span style={{
                display: "inline-block", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em",
                textTransform: "uppercase", color: "#1e3a8a",
                background: "rgba(30,58,138,0.08)", borderRadius: 20, padding: "4px 14px", marginBottom: 12,
              }}>Statuts — Titre II, Article 2</span>
              <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 800, color: "#1e3a8a", margin: 0 }}>
                Conditions d&apos;Adhésion
              </h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
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
                <div key={item.titre} style={{
                  background: "white", borderRadius: 14, padding: "1.75rem",
                  border: "1px solid #e2e8f0",
                  display: "flex", flexDirection: "column", gap: 10,
                }}>
                  <span style={{ color: "#1e3a8a" }}>{item.icon}</span>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: "#1e3a8a", margin: 0 }}>{item.titre}</h3>
                  <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.7, margin: 0 }}>{item.texte}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ CTA ══════════════════════════════════════════ */}
        <section style={{
          background: "linear-gradient(135deg, #c59b2e, #a07c20)",
          padding: "4.5rem 1rem", textAlign: "center",
        }}>
          <div style={{ maxWidth: 640, margin: "0 auto" }}>
            <h2 style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)", fontWeight: 900, color: "#1e3a8a", margin: "0 0 12px" }}>
              Rejoignez la famille CEEC
            </h2>
            <p style={{ color: "rgba(30,58,138,0.82)", fontSize: 16, margin: "0 0 28px", lineHeight: 1.7 }}>
              Votre église ou votre famille est la bienvenue dans notre communauté fraternelle.
              L&apos;entrée est libre — Jésus-Christ vous attend.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/paroisses" style={{
                padding: "13px 30px", borderRadius: 8, background: "#1e3a8a",
                color: "white", fontWeight: 700, fontSize: 15, textDecoration: "none",
              }}>
                Trouver ma paroisse
              </Link>
              <Link href="/historique" style={{
                padding: "13px 30px", borderRadius: 8, border: "2px solid #1e3a8a",
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
