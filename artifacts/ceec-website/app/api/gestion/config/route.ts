import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db/index";
import { hasPermission, isSuperAdmin } from "@/lib/auth/rbac";

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
    const allowed = superAdmin || await hasPermission(userId, "eglise_gerer_config", egliseId);
    if (!allowed) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    const config = await prisma.egliseConfig.findUnique({ where: { egliseId } });
    return NextResponse.json(config ?? {});
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const egliseId = await getEgliseId(req);
    if (!egliseId) return NextResponse.json({ error: "Église introuvable" }, { status: 400 });

    const superAdmin = await isSuperAdmin(userId);
    const allowed = superAdmin || await hasPermission(userId, "eglise_gerer_config", egliseId);
    if (!allowed) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    const body = await req.json();

    const data = {
      ...(body.couleurPrimaire !== undefined && { couleurPrimaire: body.couleurPrimaire }),
      ...(body.couleurAccent !== undefined && { couleurAccent: body.couleurAccent }),
      ...(body.faviconUrl !== undefined && { faviconUrl: body.faviconUrl || null }),
      ...(body.cssPersonnalise !== undefined && { cssPersonnalise: body.cssPersonnalise || null }),
      ...(body.facebook !== undefined && { facebook: body.facebook || null }),
      ...(body.youtube !== undefined && { youtube: body.youtube || null }),
      ...(body.instagram !== undefined && { instagram: body.instagram || null }),
      ...(body.twitter !== undefined && { twitter: body.twitter || null }),
      ...(body.whatsapp !== undefined && { whatsapp: body.whatsapp || null }),
      ...(body.siteWeb !== undefined && { siteWeb: body.siteWeb || null }),
      ...(body.horaires !== undefined && { horaires: body.horaires || null }),
      ...(body.navLinksJson !== undefined && { navLinksJson: body.navLinksJson ?? null }),
      ...(body.footerLinksJson !== undefined && { footerLinksJson: body.footerLinksJson ?? null }),
    };

    const [config] = await Promise.all([
      prisma.egliseConfig.upsert({
        where: { egliseId },
        create: { egliseId, ...data },
        update: data,
      }),
      ...(body.adresse !== undefined || body.telephone !== undefined || body.email !== undefined
        ? [prisma.eglise.update({
            where: { id: egliseId },
            data: {
              ...(body.adresse !== undefined && { adresse: body.adresse || null }),
              ...(body.telephone !== undefined && { telephone: body.telephone || null }),
              ...(body.email !== undefined && { email: body.email || null }),
            },
          })]
        : []),
    ]);
    return NextResponse.json(config);
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
