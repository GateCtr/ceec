import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db/index";
import { hasPermission, isSuperAdmin } from "@/lib/auth/rbac";

function isValidYoutubeUrl(raw: string): boolean {
  try {
    const u = new URL(raw.trim());
    const host = u.hostname.replace(/^www\./, "");
    return host === "youtube.com" || host === "youtu.be";
  } catch { return false; }
}

async function getEgliseId(req: NextRequest): Promise<number | null> {
  const h = req.headers.get("x-eglise-id");
  if (!h) return null;
  const id = parseInt(h, 10);
  return isNaN(id) ? null : id;
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const egliseId = await getEgliseId(req);
    if (!egliseId) return NextResponse.json({ error: "Église introuvable" }, { status: 400 });

    const superAdmin = await isSuperAdmin(userId);
    const allowed = superAdmin || await hasPermission(userId, "eglise_gerer_annonces", egliseId);
    if (!allowed) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    const videos = await prisma.liveStream.findMany({
      where: { egliseId },
      orderBy: [{ epingle: "desc" }, { createdAt: "desc" }],
    });
    return NextResponse.json(videos);
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const egliseId = await getEgliseId(req);
    if (!egliseId) return NextResponse.json({ error: "Église introuvable" }, { status: 400 });

    const superAdmin = await isSuperAdmin(userId);
    const allowed = superAdmin || await hasPermission(userId, "eglise_gerer_annonces", egliseId);
    if (!allowed) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    const body = await req.json();
    if (!body.titre || !body.urlYoutube) {
      return NextResponse.json({ error: "Titre et URL YouTube requis" }, { status: 400 });
    }
    if (!isValidYoutubeUrl(body.urlYoutube)) {
      return NextResponse.json({ error: "URL YouTube invalide (doit être youtube.com ou youtu.be)" }, { status: 400 });
    }

    const video = await prisma.liveStream.create({
      data: {
        egliseId,
        titre: body.titre,
        urlYoutube: body.urlYoutube,
        description: body.description ?? null,
        dateStream: body.dateStream ? new Date(body.dateStream) : null,
        estEnDirect: body.estEnDirect ?? false,
        epingle: body.epingle ?? false,
        publie: body.publie ?? true,
      },
    });
    return NextResponse.json(video, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
