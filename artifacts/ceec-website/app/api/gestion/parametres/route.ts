import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { hasPermission, isSuperAdmin } from "@/lib/auth/rbac";

async function getEgliseId(req: NextRequest): Promise<number | null> {
  const h = req.headers.get("x-eglise-id");
  if (!h) return null;
  const id = parseInt(h, 10);
  return isNaN(id) ? null : id;
}

export async function PATCH(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const egliseId = await getEgliseId(req);
    if (!egliseId) return NextResponse.json({ error: "Église introuvable" }, { status: 400 });

    const superAdmin = await isSuperAdmin(userId);
    const allowed = superAdmin || await hasPermission(userId, "eglise_gerer_config", egliseId);
    if (!allowed) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    const body = await req.json();

    const allowed_fields = ["nom", "description", "ville", "adresse", "telephone", "email", "pasteur", "logoUrl"];
    const data: Record<string, unknown> = {};
    for (const field of allowed_fields) {
      if (body[field] !== undefined) {
        data[field] = body[field] === "" ? null : body[field];
      }
    }

    const eglise = await prisma.eglise.update({
      where: { id: egliseId },
      data,
    });

    // When logoUrl changes: sync the favicon in EgliseConfig if it was
    // auto-derived from the old logo (i.e. faviconUrl is null or matched old logo).
    // This forces browsers to pick up the new logo as favicon.
    if ("logoUrl" in data) {
      const newLogoUrl = data.logoUrl as string | null;
      try {
        const existingConfig = await prisma.egliseConfig.findUnique({
          where: { egliseId },
          select: { faviconUrl: true },
        });
        // Only sync if faviconUrl is not explicitly set to a different custom URL
        if (!existingConfig?.faviconUrl || existingConfig.faviconUrl === (eglise as Record<string, unknown>).logoUrl) {
          await prisma.egliseConfig.upsert({
            where: { egliseId },
            update: { faviconUrl: newLogoUrl },
            create: { egliseId, faviconUrl: newLogoUrl },
          });
        }
      } catch {
        // Non-critical: favicon sync failure doesn't block the logo update
      }
    }

    return NextResponse.json(eglise);
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
