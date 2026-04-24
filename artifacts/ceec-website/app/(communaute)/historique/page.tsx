import HeroHistorique from "@/components/community/historique/HeroHistorique";
import NarrationSection from "@/components/community/historique/NarrationSection";
import TimelineSection from "@/components/community/historique/TimelineSection";
import PionniersSection from "@/components/community/historique/PionniersSection";
import CitationSection from "@/components/community/historique/CitationSection";
import CtaHistorique from "@/components/community/historique/CtaHistorique";

export const metadata = {
  title: "Notre Histoire | CEEC",
  description:
    "L'histoire de la Communauté des Églises Évangéliques au Congo — de sa fondation le 12 janvier 2009 à Kinshasa jusqu'à son rayonnement dans 6 provinces de la RDC.",
};

export default function HistoriquePage() {
  return (
    <>
      <HeroHistorique />
      <NarrationSection />
      <TimelineSection />
      <PionniersSection />
      <CitationSection />
      <CtaHistorique />
    </>
  );
}
