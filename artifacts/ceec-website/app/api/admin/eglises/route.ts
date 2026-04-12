import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { isSuperAdmin } from "@/lib/auth/rbac";
import { sendInviteEmail } from "@/lib/email";
import { logActivity, getActeurNom } from "@/lib/activity-log";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    if (!await isSuperAdmin(userId)) return NextResponse.json({ error: "Acces refuse" }, { status: 403 });

    const eglises = await prisma.eglise.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { membres: true } },
        inviteTokens: {
          where: { usedAt: null, expiresAt: { gt: new Date() } },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    return NextResponse.json(eglises);
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    if (!await isSuperAdmin(userId)) return NextResponse.json({ error: "Acces refuse" }, { status: 403 });

    const body = await req.json();
    const { nom, ville, emailAdmin, slug: rawSlug, sousDomaine } = body;

    if (!nom || !ville || !emailAdmin) {
      return NextResponse.json(
        { error: "Champs requis manquants : nom, ville, emailAdmin" },
        { status: 400 }
      );
    }

    const slug = rawSlug ? slugify(rawSlug) : slugify(nom);

    const existing = await prisma.eglise.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: `Le slug "${slug}" est déjà utilisé` }, { status: 409 });
    }

    const adminRole = await prisma.role.findUnique({ where: { nom: "admin_eglise" } });
    if (!adminRole) {
      return NextResponse.json({ error: "Rôle admin_eglise introuvable — relancez le seed" }, { status: 500 });
    }

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const eglise = await prisma.eglise.create({
      data: {
        nom,
        slug,
        ville,
        sousDomaine: sousDomaine || null,
        statut: "en_attente",
        inviteTokens: {
          create: {
            email: emailAdmin,
            roleId: adminRole.id,
            expiresAt,
          },
        },
      },
      include: {
        inviteTokens: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    });

    const token = eglise.inviteTokens[0]?.token;
    if (!token) {
      return NextResponse.json({ error: "Échec de la création du token" }, { status: 500 });
    }

    const emailResult = await sendInviteEmail(emailAdmin, token, nom);
    if (!emailResult.success) {
      console.warn("Email non envoyé :", emailResult.error);
    }

    const acteurNom = await getActeurNom(userId);
    await logActivity({
      acteurId: userId,
      acteurNom,
      action: "creer",
      entiteType: "eglise",
      entiteId: eglise.id,
      entiteLabel: eglise.nom,
      egliseId: eglise.id,
      egliseNom: eglise.nom,
      metadata: { ville, emailAdmin, slug },
    });

    return NextResponse.json(
      {
        success: true,
        eglise: { id: eglise.id, nom: eglise.nom, slug: eglise.slug, statut: eglise.statut },
        inviteToken: token,
        emailEnvoye: emailResult.success,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
