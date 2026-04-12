import SectionHero from "./SectionHero";
import SectionTexteImage from "./SectionTexteImage";
import SectionLive from "./SectionLive";
import SectionAnnoncesRecentes from "./SectionAnnoncesRecentes";
import SectionEvenementsAVenir from "./SectionEvenementsAVenir";
import SectionContact from "./SectionContact";
import SectionDepartements from "./SectionDepartements";
import SectionGalerie from "./SectionGalerie";

export type SectionData = {
  id: number;
  type: string;
  ordre: number;
  config: Record<string, unknown>;
};

type EgliseInfo = {
  nom: string;
  ville: string;
  adresse?: string | null;
  telephone?: string | null;
  email?: string | null;
  pasteur?: string | null;
  logoUrl?: string | null;
  description?: string | null;
};

type LiveStreamData = {
  id: number;
  titre: string;
  urlYoutube: string;
  description?: string | null;
  estEnDirect: boolean;
  epingle: boolean;
};

type AnnonceData = {
  id: number;
  titre: string;
  contenu: string;
  priorite: string;
  datePublication: Date;
  imageUrl?: string | null;
};

type EvenementData = {
  id: number;
  titre: string;
  description?: string | null;
  lieu?: string | null;
  dateDebut: Date;
  dateFin?: Date | null;
  imageUrl?: string | null;
};

type ContactConfig = {
  champsActifs?: { telephone?: boolean; sujet?: boolean };
  messageConfirmation?: string;
};

type SectionRendererProps = {
  section: SectionData;
  eglise: EgliseInfo;
  egliseId?: number;
  contactConfig?: ContactConfig;
  liveStreams?: LiveStreamData[];
  annonces?: AnnonceData[];
  evenements?: EvenementData[];
};

export default function SectionRenderer({
  section,
  eglise,
  egliseId,
  contactConfig,
  liveStreams = [],
  annonces = [],
  evenements = [],
}: SectionRendererProps) {
  const c = section.config as Record<string, never>;

  switch (section.type) {
    case "hero":
      return <SectionHero config={c} eglise={eglise} />;

    case "texte":
    case "texte_image":
      return <SectionTexteImage config={c} />;

    case "live":
    case "video":
      return <SectionLive config={c} liveStreams={liveStreams} />;

    case "annonces":
      return (
        <SectionAnnoncesRecentes
          config={c}
          annonces={annonces.slice(0, (c as { nombreItems?: number }).nombreItems ?? 3)}
        />
      );

    case "evenements":
      return (
        <SectionEvenementsAVenir
          config={c}
          evenements={evenements.slice(0, (c as { nombreItems?: number }).nombreItems ?? 3)}
        />
      );

    case "contact":
      return <SectionContact config={c} eglise={eglise} egliseId={egliseId} contactConfig={contactConfig} />;

    case "departements":
      return <SectionDepartements config={c} />;

    case "galerie":
      return <SectionGalerie config={c} />;

    default:
      return null;
  }
}
