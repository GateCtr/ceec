import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { canManageContent } from "@/lib/auth/rbac";

export async function GET() {
  try {
    const all = await prisma.annonce.findMany({
      where: { statutContenu: "publie" },
      orderBy: { datePublication: "desc" },
    });
    return NextResponse.json(all);
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Non autorise" }, { status: 401 });

    const body = await req.json();
    const egliseId = body.egliseId ?? body.paroisseId ?? null;
    const allowed = await canManageContent(userId, egliseId ?? undefined);
    if (!allowed) return NextResponse.json({ error: "Acces refuse" }, { status: 403 });

    const member = await prisma.membre.findFirst({ where: { clerkUserId: userId } });
    const annonce = await prisma.annonce.create({
      data: {
        titre: body.titre,
        contenu: body.contenu,
        auteurId: member?.id ?? null,
        egliseId,
        priorite: body.priorite ?? "normale",
        publie: body.publie ?? true,
        statutContenu: body.publie === false ? "brouillon" : "publie",
        dateExpiration: body.dateExpiration ? new Date(body.dateExpiration) : null,
      },
    });
    return NextResponse.json(annonce, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
