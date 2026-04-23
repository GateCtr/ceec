import { NextResponse } from "next/server";

interface CacheEntry {
  isLive: boolean;
  videoId?: string;
  expires: number;
}

// In-memory cache (persists between requests on the same server instance)
const cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 90_000; // 90 seconds

const CHANNEL_ID_RE = /^UC[a-zA-Z0-9_-]{22}$/;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const channelId = searchParams.get("channelId") ?? "";

  // Validate channel ID format (must start with UC and be 24 chars total)
  if (!CHANNEL_ID_RE.test(channelId)) {
    return NextResponse.json({ isLive: false });
  }

  const cached = cache.get(channelId);
  if (cached && cached.expires > Date.now()) {
    return NextResponse.json(
      { isLive: cached.isLive, videoId: cached.videoId },
      { headers: { "Cache-Control": "public, max-age=60" } }
    );
  }

  try {
    const res = await fetch(
      `https://www.youtube.com/channel/${channelId}/live`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
          "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
          Accept: "text/html",
        },
        next: { revalidate: 0 },
      }
    );

    if (!res.ok) {
      cache.set(channelId, { isLive: false, expires: Date.now() + CACHE_TTL_MS });
      return NextResponse.json({ isLive: false });
    }

    const html = await res.text();

    // YouTube embeds live status in the initial page data
    const isLive =
      html.includes('"isLive":true') ||
      html.includes('"liveBroadcastContent":"live"');

    // Try to extract video ID if live
    let videoId: string | undefined;
    if (isLive) {
      const idMatch =
        html.match(/"videoId":"([\w-]{11})"/) ??
        html.match(/watch\?v=([\w-]{11})/);
      videoId = idMatch?.[1];
    }

    cache.set(channelId, { isLive, videoId, expires: Date.now() + CACHE_TTL_MS });
    return NextResponse.json(
      { isLive, videoId },
      { headers: { "Cache-Control": "public, max-age=60" } }
    );
  } catch {
    return NextResponse.json({ isLive: false });
  }
}
