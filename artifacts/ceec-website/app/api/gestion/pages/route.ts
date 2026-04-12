import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db/index";
import { hasPermission, isSuperAdmin } from "@/lib/auth/rbac";
import { logActivity, getActeurNom } from "@/lib/activity-log";

async function getEgliseId(req: NextRequest): Promise<number | null> {
  const h = req.headers.get("x-eglise-id");
  if (!h) return null;
  const id = parseInt(h, 10);
  return isNaN(id) ? null : id;
}

function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const egliseId = await getEgliseId(req);
    if (!egliseId) return NextResponse.json({ error: "Église introuvable" }, { status: 400 });

    const superAdmin = await isSuperAdmin(userId);
    const allowed = superAdmin || await hasPermission(userId, "eglise_gerer_config", egliseId);
    if (!allowed) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    const pages = await prisma.pageEglise.findMany({
      where: { egliseId },
      orderBy: { ordre: "asc" },
      include: { _count: { select: { sections: true } } },
    });
    return NextResponse.json(pages);
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
    const allowed = superAdmin || await hasPermission(userId, "eglise_gerer_config", egliseId);
    if (!allowed) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    const body = await req.json();
    if (!body.titre) return NextResponse.json({ error: "Titre requis" }, { status: 400 });

    const slug = body.slug || slugify(body.titre);

    const existing = await prisma.pageEglise.findFirst({ where: { egliseId, slug } });
    if (existing) return NextResponse.json({ error: "Ce slug est déjà utilisé" }, { status: 409 });

    const maxOrdre = await prisma.pageEglise.aggregate({ where: { egliseId }, _max: { ordre: true } });

    const [page, eglise] = await Promise.all([
      prisma.pageEglise.create({
        data: {
          egliseId,
          titre: body.titre,
          slug,
          type: body.type ?? "custom",
          publie: body.publie ?? false,
          ordre: (maxOrdre._max.ordre ?? 0) + 1,
        },
      }),
      prisma.eglise.findUnique({ where: { id: egliseId }, select: { nom: true } }),
    ]);

    const acteurNom = await getActeurNom(userId, egliseId);
    await logActivity({
      acteurId: userId,
      acteurNom,
      action: "creer",
      entiteType: "page",
      entiteId: page.id,
      entiteLabel: page.titre,
      egliseId,
      egliseNom: eglise?.nom,
    });

    return NextResponse.json(page, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
