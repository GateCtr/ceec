import { safeUrl } from "@/lib/sanitize-url";
import ChurchSectionHeader from "./ChurchSectionHeader";

type LiveConfig = {
  titre?: string;
  urlYoutube?: string;
  description?: string;
  bgColor?: string;
};

type LiveStream = {
  id: number;
  titre: string;
  urlYoutube: string;
  description?: string | null;
  estEnDirect: boolean;
  epingle: boolean;
};

function extractYoutubeId(url: string): string | null {
  if (!url) return null;
  const short = url.match(/youtu\.be\/([A-Za-z0-9_-]{11})/);
  if (short) return short[1];
  const long = url.match(/[?&]v=([A-Za-z0-9_-]{11})/);
  if (long) return long[1];
  const path = url.match(/\/(?:live|embed)\/([A-Za-z0-9_-]{11})/);
  if (path) return path[1];
  const shorts = url.match(/\/shorts\/([A-Za-z0-9_-]{11})/);
  if (shorts) return shorts[1];
  return null;
}

export default function SectionLive({
  config,
  liveStreams,
}: {
  config: LiveConfig;
  liveStreams?: LiveStream[];
}) {
  const { titre = "Nos retransmissions", bgColor = "#f8fafc", description } = config;

  const streams = liveStreams ?? [];
  const featured = streams.find((s) => s.epingle) ?? streams[0];
  const primaryUrl = config.urlYoutube || featured?.urlYoutube || null;
  const primaryTitle = featured?.titre ?? titre;
  const primaryDesc = description ?? featured?.description;

  if (!primaryUrl && streams.length === 0) return null;

  return (
    <section className="py-20 px-4" style={{ background: bgColor }}>
      <div className="max-w-[1100px] mx-auto">
        <ChurchSectionHeader
          badge="Vidéos"
          title={titre}
          description={primaryDesc ?? undefined}
        />

        {/* Vidéo principale */}
        {primaryUrl && (
          <div className="mb-8">
            {featured?.estEnDirect && (
              <div className="flex items-center gap-2 justify-center mb-3">
                <span className="inline-flex items-center gap-1.5 bg-red-600 text-white rounded-full px-3.5 py-1 text-[13px] font-bold">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  EN DIRECT
                </span>
              </div>
            )}
            <div className="relative pb-[56.25%] h-0 rounded-2xl overflow-hidden shadow-xl">
              <iframe
                src={`https://www.youtube.com/embed/${extractYoutubeId(primaryUrl)}?rel=0&modestbranding=1`}
                title={primaryTitle}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full border-none"
              />
            </div>
            <p className="text-muted-foreground text-center mt-3 text-[15px] font-semibold">
              {primaryTitle}
            </p>
          </div>
        )}

        {/* Grille des autres vidéos */}
        {streams.length > 1 && (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6 mt-4">
            {streams
              .filter((s) => !s.epingle || streams.indexOf(s) > 0)
              .slice(0, 6)
              .map((stream) => {
                const vid = extractYoutubeId(stream.urlYoutube);
                return (
                  <a
                    key={stream.id}
                    href={safeUrl(stream.urlYoutube)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="no-underline block"
                  >
                    <div className="card card-hover overflow-hidden">
                      {vid && (
                        <img
                          src={`https://img.youtube.com/vi/${vid}/mqdefault.jpg`}
                          alt={stream.titre}
                          className="w-full h-[160px] object-cover block"
                        />
                      )}
                      <div className="p-3.5">
                        <p className="font-semibold text-foreground text-sm m-0">{stream.titre}</p>
                        {stream.description && (
                          <p className="text-muted-foreground text-xs mt-1 m-0">
                            {stream.description.slice(0, 80)}
                          </p>
                        )}
                      </div>
                    </div>
                  </a>
                );
              })}
          </div>
        )}
      </div>
    </section>
  );
}
