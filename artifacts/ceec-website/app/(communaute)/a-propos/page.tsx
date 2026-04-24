import type { Metadata } from "next";
import { SITE_URL, SITE_NAME, orgJsonLd } from "@/lib/seo";
import { getCommunauteStats } from "@/lib/queries/community";

import HeroAbout from "@/components/community/about/HeroAbout";
import StatsAbout from "@/components/community/about/StatsAbout";
import IdentiteSection from "@/components/community/about/IdentiteSection";
import MissionSection from "@/components/community/about/MissionSection";
import DoctrineSection from "@/components/community/about/DoctrineSection";
import GouvernanceSection from "@/components/community/about/GouvernanceSection";
import DepartementsSection from "@/components/community/about/DepartementsSection";
import ProvincesSection from "@/components/community/about/ProvincesSection";
import AdhesionSection from "@/components/community/about/AdhesionSection";
import CtaAbout from "@/components/community/about/CtaAbout";

export const metadata: Metadata = {
  title: "À propos",
  description:
    "Découvrez la Communauté des Églises Évangéliques au Congo — identité juridique, mission, doctrine, gouvernance et structure.",
  openGraph: {
    title: `À propos | ${SITE_NAME}`,
    description:
      "Histoire, mission, doctrine et gouvernance de la Communauté des Églises Évangéliques au Congo.",
    url: `${SITE_URL}/a-propos`,
    type: "website",
  },
  twitter: {
    card: "summary",
    title: `À propos | ${SITE_NAME}`,
    description: "Histoire, mission et gouvernance de la CEEC.",
  },
};

export default async function AProposPage() {
  const stats = await getCommunauteStats();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd()) }}
      />
      <HeroAbout />
      <StatsAbout stats={stats} />
      <IdentiteSection />
      <MissionSection />
      <DoctrineSection />
      <GouvernanceSection />
      <DepartementsSection />
      <ProvincesSection />
      <AdhesionSection />
      <CtaAbout />
    </>
  );
}
