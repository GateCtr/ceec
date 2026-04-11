import { safeUrl } from "@/lib/sanitize-url";

type LiveConfig = {
  titre?: string;
  urlYoutube?: string;
  description?: string;
  bgColor?: string;
};

function extractYoutubeId(url: string): string | null {
  if (!url) return null;
  // youtu.be/<id>
  const short = url.match(/youtu\.be\/([A-Za-z0-9_-]{11})/);
  if (short) return short[1];
  // youtube.com/watch?v=<id>
  const long = url.match(/[?&]v=([A-Za-z0-9_-]{11})/);
  if (long) return long[1];
  // youtube.com/live/<id> or /embed/<id>
  const path = url.match(/\/(?:live|embed)\/([A-Za-z0-9_-]{11})/);
  if (path) return path[1];
  // youtube.com/shorts/<id>
  const shorts = url.match(/\/shorts\/([A-Za-z0-9_-]{11})/);
  if (shorts) return shorts[1];
  return null;
}

export default function SectionLive({
  config,
  liveStreams,
}: {
  config: LiveConfig;
  liveStreams?: Array<{ id: number; titre: string; urlYoutube: string; description?: string | null; estEnDirect: boolean; epingle: boolean }>;
}) {
  const { titre = "Nos retransmissions", bgColor = "#f8fafc", description } = config;

  // Use config URL first, then pinned live, then all live streams
  const configUrl = config.urlYoutube;
  const streams = liveStreams ?? [];
  const featured = streams.find((s) => s.epingle) ?? streams[0];

  const primaryUrl = configUrl || featured?.urlYoutube || null;
  const primaryTitle = featured?.titre ?? titre;
  const primaryDesc = description ?? featured?.description;

  if (!primaryUrl && streams.length === 0) return null;

  return (
    <section style={{ background: bgColor, padding: "5rem 1rem" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <h2 style={{ color: "var(--church-primary, #1e3a8a)", fontWeight: 800, fontSize: "clamp(1.5rem,3vw,2rem)", marginBottom: 10, textAlign: "center" }}>
          {titre}
        </h2>
        {primaryDesc && (
          <p style={{ color: "#64748b", textAlign: "center", maxWidth: 600, margin: "0 auto 32px" }}>
            {primaryDesc}
          </p>
        )}

        {primaryUrl && (
          <div style={{ marginBottom: 32 }}>
            {featured?.estEnDirect && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center", marginBottom: 12 }}>
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  background: "#dc2626", color: "white", borderRadius: 20,
                  padding: "4px 14px", fontSize: 13, fontWeight: 700,
                }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "white", animation: "pulse 1.5s ease-in-out infinite" }} />
                  EN DIRECT
                </span>
              </div>
            )}
            <div
              style={{
                position: "relative", paddingBottom: "56.25%", height: 0,
                borderRadius: 16, overflow: "hidden", boxShadow: "0 8px 40px rgba(0,0,0,0.15)",
              }}
            >
              <iframe
                src={`https://www.youtube.com/embed/${extractYoutubeId(primaryUrl)}?rel=0&modestbranding=1`}
                title={primaryTitle}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
              />
            </div>
            <p style={{ color: "#64748b", textAlign: "center", marginTop: 12, fontSize: 15, fontWeight: 600 }}>
              {primaryTitle}
            </p>
          </div>
        )}

        {streams.length > 1 && (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "1.5rem",
            marginTop: 16,
          }}>
            {streams.filter((s) => !s.epingle || streams.indexOf(s) > 0).slice(0, 6).map((stream) => {
              const vid = extractYoutubeId(stream.urlYoutube);
              return (
                <a
                  key={stream.id}
                  href={safeUrl(stream.urlYoutube)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: "none", display: "block" }}
                >
                  <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                    {vid && (
                      <img
                        src={`https://img.youtube.com/vi/${vid}/mqdefault.jpg`}
                        alt={stream.titre}
                        style={{ width: "100%", height: 160, objectFit: "cover", display: "block" }}
                      />
                    )}
                    <div style={{ padding: "0.875rem" }}>
                      <p style={{ fontWeight: 600, color: "#0f172a", fontSize: 14, margin: 0 }}>{stream.titre}</p>
                      {stream.description && (
                        <p style={{ color: "#64748b", fontSize: 12, marginTop: 4, margin: "4px 0 0" }}>{stream.description.slice(0, 80)}</p>
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
