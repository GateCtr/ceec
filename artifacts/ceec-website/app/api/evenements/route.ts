import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { canManageContent } from "@/lib/auth/rbac";

export async function GET() {
  try {
    const all = await prisma.evenement.findMany({
      where: { statutContenu: "publie", visibilite: "public" },
      orderBy: { dateDebut: "asc" },
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

    const evt = await prisma.evenement.create({
      data: {
        titre: body.titre,
        description: body.description ?? null,
        dateDebut: new Date(body.dateDebut),
        dateFin: body.dateFin ? new Date(body.dateFin) : null,
        lieu: body.lieu ?? null,
        egliseId,
        publie: body.publie ?? true,
        statutContenu: body.publie === false ? "brouillon" : "publie",
        imageUrl: body.imageUrl ?? null,
      },
    });
    return NextResponse.json(evt, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
