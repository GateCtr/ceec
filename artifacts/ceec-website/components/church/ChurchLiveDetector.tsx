"use client";

import { useEffect, useState, useCallback } from "react";
import { X, Radio, ExternalLink } from "lucide-react";

interface Props {
  channelId: string;
  egliseNom: string;
  primaryColor?: string;
}

const POLL_INTERVAL = 90_000; // 90 secondes

export default function ChurchLiveDetector({ channelId, egliseNom, primaryColor = "#1e3a8a" }: Props) {
  const [isLive, setIsLive] = useState(false);
  const [videoId, setVideoId] = useState<string | undefined>();
  const [modalOpen, setModalOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const checkLive = useCallback(async () => {
    try {
      const res = await fetch(`/api/church/youtube-live?channelId=${encodeURIComponent(channelId)}`);
      if (!res.ok) return;
      const data = await res.json();
      setIsLive(data.isLive ?? false);
      setVideoId(data.videoId);
      // Reset dismissal when a new stream starts
      if (data.isLive) setDismissed(false);
    } catch { /* ignore */ }
  }, [channelId]);

  useEffect(() => {
    if (!channelId) return;
    checkLive();
    const interval = setInterval(checkLive, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [channelId, checkLive]);

  // Not live or user dismissed → nothing
  if (!isLive || dismissed) return null;

  const embedSrc = videoId
    ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`
    : `https://www.youtube.com/embed/live_stream?channel=${channelId}&autoplay=1&rel=0`;

  const youtubeLink = videoId
    ? `https://www.youtube.com/watch?v=${videoId}`
    : `https://www.youtube.com/channel/${channelId}/live`;

  return (
    <>
      {/* Floating badge */}
      {!modalOpen && (
        <button
          onClick={() => setModalOpen(true)}
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 9998,
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "#dc2626",
            color: "white",
            border: "none",
            borderRadius: 100,
            padding: "10px 18px 10px 14px",
            fontWeight: 700,
            fontSize: 14,
            cursor: "pointer",
            boxShadow: "0 4px 20px rgba(220,38,38,0.45)",
            animation: "live-pulse 2s ease-in-out infinite",
          }}
          title={`${egliseNom} est en direct`}
        >
          <span style={{ display: "flex", alignItems: "center" }}>
            <Radio size={16} style={{ marginRight: 6 }} />
            <span
              style={{
                display: "inline-block",
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "white",
                marginRight: 6,
                animation: "dot-blink 1s step-start infinite",
              }}
            />
          </span>
          EN DIRECT
        </button>
      )}

      {/* Modal overlay */}
      {modalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(0,0,0,0.85)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
          onClick={(e) => e.target === e.currentTarget && setModalOpen(false)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 800,
              background: "#0f172a",
              borderRadius: 16,
              overflow: "hidden",
              boxShadow: "0 24px 60px rgba(0,0,0,0.6)",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 16px",
                background: "#1e293b",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    background: "#dc2626",
                    color: "white",
                    padding: "3px 10px",
                    borderRadius: 100,
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "white",
                      display: "inline-block",
                      animation: "dot-blink 1s step-start infinite",
                    }}
                  />
                  EN DIRECT
                </span>
                <span style={{ color: "white", fontWeight: 600, fontSize: 14 }}>
                  {egliseNom}
                </span>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <a
                  href={youtubeLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    color: "#94a3b8",
                    textDecoration: "none",
                    fontSize: 12,
                    padding: "4px 8px",
                    borderRadius: 6,
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <ExternalLink size={12} /> YouTube
                </a>
                <button
                  onClick={() => setModalOpen(false)}
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    border: "none",
                    borderRadius: 6,
                    padding: 4,
                    cursor: "pointer",
                    color: "#94a3b8",
                    display: "flex",
                  }}
                >
                  <X size={16} />
                </button>
                <button
                  onClick={() => { setDismissed(true); setModalOpen(false); }}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#64748b",
                    fontSize: 11,
                    cursor: "pointer",
                    padding: "4px 6px",
                  }}
                  title="Fermer et ne plus afficher"
                >
                  ✕ Ne plus afficher
                </button>
              </div>
            </div>

            {/* Player */}
            <div style={{ position: "relative", paddingBottom: "56.25%", height: 0 }}>
              <iframe
                src={embedSrc}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  border: "none",
                }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={`Direct — ${egliseNom}`}
              />
            </div>
          </div>
        </div>
      )}

      {/* CSS animations */}
      <style>{`
        @keyframes live-pulse {
          0%, 100% { box-shadow: 0 4px 20px rgba(220,38,38,0.45); transform: scale(1); }
          50% { box-shadow: 0 6px 28px rgba(220,38,38,0.65); transform: scale(1.03); }
        }
        @keyframes dot-blink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
      `}</style>
    </>
  );
}
