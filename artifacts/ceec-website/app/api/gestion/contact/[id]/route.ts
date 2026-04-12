import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db/index";
import { isSuperAdmin, isEgliseStaff } from "@/lib/auth/rbac";

async function getEgliseId(req: NextRequest): Promise<number | null> {
  const h = req.headers.get("x-eglise-id");
  if (!h) return null;
  const id = parseInt(h, 10);
  return isNaN(id) ? null : id;
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const egliseId = await getEgliseId(req);
    if (!egliseId) return NextResponse.json({ error: "Église introuvable" }, { status: 400 });

    const superAdmin = await isSuperAdmin(userId);
    const allowed = superAdmin || await isEgliseStaff(userId, egliseId);
    if (!allowed) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    const { id: paramId } = await params;
    const messageId = parseInt(paramId, 10);
    if (isNaN(messageId)) return NextResponse.json({ error: "ID invalide" }, { status: 400 });

    const config = await prisma.egliseConfig.findUnique({ where: { egliseId }, select: { id: true } });
    if (!config) return NextResponse.json({ error: "Église introuvable" }, { status: 404 });

    const body = await req.json().catch(() => ({}));
    const lu = body.lu !== undefined ? Boolean(body.lu) : true;

    const updated = await prisma.messageContact.updateMany({
      where: { id: messageId, configId: config.id },
      data: { lu },
    });

    if (updated.count === 0) {
      return NextResponse.json({ error: "Message introuvable" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const egliseId = await getEgliseId(req);
    if (!egliseId) return NextResponse.json({ error: "Église introuvable" }, { status: 400 });

    const superAdmin = await isSuperAdmin(userId);
    const allowed = superAdmin || await isEgliseStaff(userId, egliseId);
    if (!allowed) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    const { id: paramId } = await params;
    const messageId = parseInt(paramId, 10);
    if (isNaN(messageId)) return NextResponse.json({ error: "ID invalide" }, { status: 400 });

    const config = await prisma.egliseConfig.findUnique({ where: { egliseId }, select: { id: true } });
    if (!config) return NextResponse.json({ error: "Église introuvable" }, { status: 404 });

    const deleted = await prisma.messageContact.deleteMany({
      where: { id: messageId, configId: config.id },
    });

    if (deleted.count === 0) {
      return NextResponse.json({ error: "Message introuvable" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
