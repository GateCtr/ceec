import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";

let _edgeClient: PrismaClient | null = null;

export function getEdgePrismaClient(): PrismaClient {
  if (_edgeClient) return _edgeClient;

  const connectionString = process.env.NEON_DATABASE_URL ?? process.env.DATABASE_URL;
  if (!connectionString) throw new Error("No database URL configured for edge client");

  if (typeof WebSocket !== "undefined") {
    neonConfig.webSocketConstructor = WebSocket;
  }

  const adapter = new PrismaNeon({ connectionString });
  _edgeClient = new PrismaClient({ adapter });
  return _edgeClient;
}

export interface ChurchInfo {
  id: number;
  slug: string;
  statut: string;
}

export async function resolveChurchBySlug(slug: string): Promise<ChurchInfo | null> {
  try {
    const client = getEdgePrismaClient();
    const eglise = await client.eglise.findUnique({
      where: { slug },
      select: { id: true, slug: true, statut: true },
    });
    if (!eglise || !eglise.slug) return null;
    return { id: eglise.id, slug: eglise.slug, statut: eglise.statut };
  } catch (err) {
    console.error("[edge-db] Church resolution error:", err);
    return null;
  }
}
