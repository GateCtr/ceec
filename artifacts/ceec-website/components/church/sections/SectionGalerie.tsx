import ChurchSectionHeader from "./ChurchSectionHeader";

type GalerieConfig = {
  titre?: string;
  images?: Array<{ url: string; legende?: string }>;
  bgColor?: string;
};

export default function SectionGalerie({ config }: { config: GalerieConfig }) {
  const { titre = "Galerie", images = [], bgColor = "#f8fafc" } = config;

  if (images.length === 0) return null;

  return (
    <section className="py-20 px-4" style={{ background: bgColor }}>
      <div className="max-w-[1100px] mx-auto">
        <ChurchSectionHeader badge="Photos" title={titre} />

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {images.map((img, i) => {
            // Première image plus grande
            const isFeature = i === 0 && images.length > 4;
            return (
              <div
                key={i}
                className={`rounded-xl overflow-hidden group relative ${
                  isFeature ? "col-span-2 row-span-2 aspect-square" : "aspect-4/3"
                }`}
              >
                <img
                  src={img.url}
                  alt={img.legende ?? `Photo ${i + 1}`}
                  className="w-full h-full object-cover block transition-transform duration-300 group-hover:scale-105"
                />
                {img.legende && (
                  <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/60 to-transparent px-3 py-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="text-white text-xs font-medium m-0">{img.legende}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
