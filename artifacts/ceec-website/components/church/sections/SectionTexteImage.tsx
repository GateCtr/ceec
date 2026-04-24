import { safeUrl } from "@/lib/sanitize-url";
import ChurchSectionHeader from "./ChurchSectionHeader";

type TexTeImageConfig = {
  titre?: string;
  sousTitre?: string;
  texte?: string;
  imageUrl?: string;
  disposition?: "image_droite" | "image_gauche";
  bgColor?: string;
  ctaLabel?: string;
  ctaHref?: string;
};

export default function SectionTexteImage({ config }: { config: TexTeImageConfig }) {
  const {
    titre = "",
    sousTitre,
    texte = "",
    imageUrl,
    disposition = "image_droite",
    bgColor = "#ffffff",
    ctaLabel,
    ctaHref,
  } = config;

  const imageFirst = disposition === "image_gauche";

  const imageBlock = imageUrl ? (
    <div className="rounded-2xl overflow-hidden shadow-xl">
      <img src={imageUrl} alt={titre} className="w-full h-full object-cover block max-h-[420px]" />
    </div>
  ) : null;

  return (
    <section className="py-20 px-4" style={{ background: bgColor }}>
      <div
        className={`max-w-[1100px] mx-auto grid items-center gap-14 ${
          imageUrl ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 max-w-[720px]"
        }`}
      >
        {imageFirst && imageBlock}

        <div>
          <ChurchSectionHeader
            badge={sousTitre}
            title={titre}
            align="left"
          />
          {texte && (
            <div className="text-slate-600 text-base leading-[1.85] -mt-4">
              {texte.split("\n").map((line, i) => (
                <p key={i} className="mb-3">{line}</p>
              ))}
            </div>
          )}
          {ctaLabel && ctaHref && (
            <a
              href={safeUrl(ctaHref)}
              className="inline-block mt-6 px-7 py-3 rounded-lg font-semibold text-[15px] text-white no-underline transition-all duration-200 hover:brightness-110 hover:scale-[1.02]"
              style={{ background: "var(--church-primary, #1e3a8a)" }}
            >
              {ctaLabel}
            </a>
          )}
        </div>

        {!imageFirst && imageBlock}
      </div>
    </section>
  );
}
