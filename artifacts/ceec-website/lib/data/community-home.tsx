export const missions = [
  {
    titre: "Prêcher l'Évangile",
    desc: "Prêcher l'Évangile Éternel dans le monde entier et faire des disciples de Jésus-Christ, en commençant par la RDC. (Matthieu 28 : 19-20)",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    titre: "Promouvoir les Œuvres Sociales",
    desc: "Visiter les orphelins et les veuves dans leur affliction, et se préserver des souillures du monde. (Jacques 1 : 27)",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="currentColor" strokeWidth="1.8">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="9" cy="7" r="4" strokeLinecap="round" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    titre: "Rayonner jusqu'au Bout du Monde",
    desc: "Le champ d'action de la CEEC s'étend depuis la RDC, vers l'Afrique, et enfin le monde entier — jusqu'aux extrémités de la terre.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="10" strokeLinecap="round" />
        <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" strokeLinecap="round" />
      </svg>
    ),
  },
];

export const valeurs = [
  {
    titre: "La Parole de Dieu",
    desc: "Nous acceptons la Bible comme unique parole inspirée de Dieu — seule référence pour sonder les Écritures saintes. (2 Timothée 3 : 15-16)",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 7h6M9 11h4" strokeLinecap="round" />
      </svg>
    ),
    couleur: "var(--color-primary)",
    fond: "var(--color-primary-100)",
  },
  {
    titre: "La Foi en Jésus-Christ",
    desc: "Nous croyons en Dieu créateur, en Jésus-Christ Fils de Dieu, en sa naissance virginale, sa mort expiatoire, sa résurrection et en l'œuvre du Saint-Esprit.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 2v8M12 14v8M4 12h16" strokeLinecap="round" />
      </svg>
    ),
    couleur: "var(--color-secondary-800)",
    fond: "var(--color-secondary-100)",
  },
  {
    titre: "Le Baptême",
    desc: "Nous pratiquons le baptême par immersion d'eau comme acte de foi et d'obéissance à Jésus-Christ. (Actes 2 : 4 ; 10 : 44)",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 22C6.5 22 2 17.5 2 12S6.5 2 12 2s10 4.5 10 10" strokeLinecap="round" />
        <path d="M2 12c3-4 7-6 10-6s7 2 10 6" strokeLinecap="round" />
        <path d="M12 16v6M8 19l4-3 4 3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    couleur: "var(--color-accent-700)",
    fond: "var(--color-accent-100)",
  },
  {
    titre: "La Sainte Cène",
    desc: "La Sainte Cène est une pratique centrale de la vie de l'Église — mémorial du sacrifice de Jésus-Christ pour la rédemption de l'humanité.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth="1.8">
        <path d="M8 22H16M12 2v8" strokeLinecap="round" />
        <path d="M5 10c0 3.87 3.13 7 7 7s7-3.13 7-7H5z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M3 10h18" strokeLinecap="round" />
      </svg>
    ),
    couleur: "var(--color-primary-700)",
    fond: "var(--color-primary-50)",
  },
];
