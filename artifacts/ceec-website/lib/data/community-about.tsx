import {
  BookOpen, Globe, Users, Heart, Shield, Layers, Cross,
  Building2, Settings, BookMarked, Mic2, UserCheck, Landmark,
  Music2, Handshake, HeartHandshake, GraduationCap, Tv2,
} from "lucide-react";

/* ─────────────────────────────────────────────────────── */
/* Données statiques — page À propos                      */
/* Tirées du document officiel CEEC 2023                   */
/* ─────────────────────────────────────────────────────── */

export const doctrine = [
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

export type OrganeAccent = "primary" | "secondary" | "emerald";

export const organes: { titre: string; texte: string; icon: React.ReactNode; accent: OrganeAccent }[] = [
  {
    titre: "Assemblée Générale",
    texte:
      "Organe souverain composé de tous les membres du comité exécutif et des représentants provinciaux et de districts. L'A.G. ordinaire se tient une fois par an ; une A.G. extraordinaire peut être convoquée en cas d'urgence pour sauver l'Église.",
    icon: <Building2 size={28} />,
    accent: "primary",
  },
  {
    titre: "Comité Exécutif",
    texte:
      "Instance permanente chargée d'exécuter les décisions de l'Assemblée Générale, trouver des solutions aux questions pendantes, et gérer le quotidien de la communauté. Il est convoqué par le Représentant Légal ou son délégué.",
    icon: <Settings size={28} />,
    accent: "secondary",
  },
  {
    titre: "Collège des Serviteurs",
    texte:
      "Composé de tous les ministres exerçant leurs grâces ministérielles dans l'assemblée locale. Il traite les questions en rapport avec la Parole de Dieu et supervise toutes les activités de l'église locale. Réunion hebdomadaire obligatoire.",
    icon: <BookMarked size={28} />,
    accent: "emerald",
  },
];

export const comite = [
  { role: "Président Communautaire & Représentant Légal", nom: "Évêque Missionnaire MPANGA MUKUTU Pozard" },
  { role: "1er Suppléant",                                nom: "Révérend Pasteur ILUNGA SHIMBI André" },
  { role: "2ème Suppléant",                              nom: "Pasteur BANZA LUKANGA Constantin" },
  { role: "Secrétaire Général Administratif",             nom: "Révérend Pasteur ILUNGA MONGA KENGA Jean" },
  { role: "Trésorier Général",                            nom: "KALENGA MPANGA Ruth" },
  { role: "Conseiller",                                   nom: "Révérend Pasteur MAKONGA PELESA Gédéon" },
];

export const departements: { titre: string; icon: React.ReactNode; desc: string }[] = [
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

export const provinces = [
  {
    nom: "Kinshasa",
    paroisses: [
      "Nouvelle Jérusalem — Q/Ngaliema", "Bethléhem — Q/Badiading",
      "Montagne de Sion — Q/Mikonga", "Nazareth — Q/Badara",
      "Montagne de Transfiguration — Q/Gombe", "Main de l'Éternel — Masina Ciforco",
      "Source de Vie — Cité Kinkole", "Péniel — Q/Nganda Musolo",
      "Champ de Dieu — Q/Cimetière Pompage", "Boanerge — Q/Pompage",
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
      "Jésus ma Solution — Centre Ville", "Eben-Ézer — Q/SNSS",
      "Feu Dévorant — Q/SAER", "Péniel — Cité Kikula",
      "Mapendo — Q/Kamombela", "Uzima — Q/Kalipopo",
      "Kamatanda — Q/Kamatanda", "Étoile du Matin — Q/Makomeno",
    ],
  },
  {
    nom: "Lualaba / Kolwezi",
    paroisses: [
      "El-Helyon — Q/Latin", "Rocher de Vie — Q/Manika",
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
      "Nouvelle Jérusalem — Mbandaka", "Trône de l'Éternel — Malelembe",
      "Nouvelle Jérusalem — Gemena", "Trône de l'Éternel — Bolomba",
    ],
  },
];
