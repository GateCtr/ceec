import { prisma } from "@/lib/db";
import { getCommunauteStats } from "@/lib/queries/community";
import { Church, MapPin, Users, CalendarDays } from "lucide-react";

import HeroHome from "@/components/community/home/HeroHome";
import AboutSection from "@/components/community/home/AboutSection";
import StatsSection from "@/components/community/home/StatsSection";
import MissionsSection from "@/components/community/home/MissionsSection";
import VerseSection from "@/components/community/home/VerseSection";
import ValeursSection from "@/components/community/home/ValeursSection";
import EglisesSection from "@/components/community/home/EglisesSection";
import ActualitesSection from "@/components/community/home/ActualitesSection";
import CtaSection from "@/components/community/home/CtaSection";

async function getData() {
  try {
    const [eglisesList, annoncesList, evenementsList, rawStats] = await Promise.all([
      prisma.eglise.findMany({ where: { statut: "actif" }, take: 6, orderBy: { nom: "asc" } }),
      prisma.annonce.findMany({ where: { statutContenu: "publie", egliseId: null }, orderBy: { datePublication: "desc" }, take: 3 }),
      prisma.evenement.findMany({ where: { statutContenu: "publie", egliseId: null }, orderBy: { dateDebut: "asc" }, take: 3 }),
      getCommunauteStats(),
    ]);

    const stats = [
      { valeur: rawStats.nbEglises,      label: "Paroisses",           icon: <Church size={30} /> },
      { valeur: rawStats.nbProvinces,     label: "Provinces couvertes", icon: <MapPin size={30} /> },
      { valeur: rawStats.nbFideles,       label: "Fidèles",             icon: <Users size={30} /> },
      { valeur: rawStats.anneeFondation,  label: "Année de fondation",  icon: <CalendarDays size={30} /> },
    ];

    return { eglisesList, annoncesList, evenementsList, stats };
  } catch {
    return {
      eglisesList: [],
      annoncesList: [],
      evenementsList: [],
      stats: [
        { valeur: "50+",      label: "Paroisses",           icon: <Church size={30} /> },
        { valeur: "5+",       label: "Provinces couvertes", icon: <MapPin size={30} /> },
        { valeur: "2 000+",   label: "Fidèles",             icon: <Users size={30} /> },
        { valeur: "2009",     label: "Année de fondation",  icon: <CalendarDays size={30} /> },
      ],
    };
  }
}

export default async function HomePage() {
  const { eglisesList, annoncesList, evenementsList, stats } = await getData();

  return (
    <>
      <HeroHome />
      <AboutSection />
      <StatsSection stats={stats} />
      <MissionsSection />
      <VerseSection />
      <ValeursSection />
      <EglisesSection eglises={eglisesList} />
      <ActualitesSection annonces={annoncesList} evenements={evenementsList} />
      <CtaSection />
    </>
  );
}
