import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { isSuperAdmin, ROLES, PLATFORM_ROLES } from "@/lib/auth/rbac";

const ASSIGNABLE_ROLES: string[] = [ROLES.ADMIN_PLATEFORME, ROLES.MODERATEUR_PLATEFORME];

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    if (!(await isSuperAdmin(userId))) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    const platformUserRoles = await prisma.userRole.findMany({
      where: { role: { nom: { in: Array.from(PLATFORM_ROLES) } } },
      include: { role: true },
      orderBy: { createdAt: "desc" },
    });

    const clerkIds = [...new Set(platformUserRoles.map((ur) => ur.clerkUserId))];
    const membres = await prisma.membre.findMany({
      where: { clerkUserId: { in: clerkIds } },
      select: { id: true, nom: true, prenom: true, email: true, clerkUserId: true },
    });
    const membreByClerk = Object.fromEntries(membres.map((m) => [m.clerkUserId, m]));

    const users = platformUserRoles.map((ur) => {
      const m = membreByClerk[ur.clerkUserId];
      return {
        id: ur.id,
        clerkUserId: ur.clerkUserId,
        roleNom: ur.role.nom,
        roleLabel:
          ur.role.nom === ROLES.SUPER_ADMIN
            ? "Super Administrateur"
            : ur.role.nom === ROLES.ADMIN_PLATEFORME
            ? "Administrateur Plateforme"
            : "Modérateur Plateforme",
        nom: m?.nom ?? null,
        prenom: m?.prenom ?? null,
        email: m?.email ?? null,
        assignedAt: ur.createdAt?.toISOString() ?? null,
      };
    });

    return NextResponse.json(users);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    if (!(await isSuperAdmin(userId))) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    const { clerkUserId, roleNom } = await req.json();

    if (!clerkUserId || !roleNom) {
      return NextResponse.json({ error: "clerkUserId et roleNom requis" }, { status: 400 });
    }

    if (!ASSIGNABLE_ROLES.includes(roleNom)) {
      return NextResponse.json({ error: "Rôle non assignable via cette interface" }, { status: 400 });
    }

    const role = await prisma.role.findUnique({ where: { nom: roleNom } });
    if (!role) return NextResponse.json({ error: "Rôle introuvable" }, { status: 404 });

    const membre = await prisma.membre.findFirst({ where: { clerkUserId } });
    if (!membre) return NextResponse.json({ error: "Membre introuvable pour ce Clerk ID" }, { status: 404 });

    const existing = await prisma.userRole.findFirst({
      where: { clerkUserId, roleId: role.id, egliseId: null },
    });
    if (existing) return NextResponse.json({ error: "Ce rôle est déjà assigné à cet utilisateur" }, { status: 409 });

    const userRole = await prisma.userRole.create({
      data: {
        clerkUserId,
        roleId: role.id,
        egliseId: null,
      },
      include: { role: true },
    });

    return NextResponse.json(
      {
        id: userRole.id,
        clerkUserId: userRole.clerkUserId,
        roleNom: userRole.role.nom,
        nom: membre.nom,
        prenom: membre.prenom,
        email: membre.email,
      },
      { status: 201 }
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    if (!(await isSuperAdmin(userId))) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    const { userRoleId } = await req.json();
    if (!userRoleId) return NextResponse.json({ error: "userRoleId requis" }, { status: 400 });

    const ur = await prisma.userRole.findUnique({ where: { id: userRoleId }, include: { role: true } });
    if (!ur) return NextResponse.json({ error: "Entrée introuvable" }, { status: 404 });

    if (ur.role.nom === ROLES.SUPER_ADMIN) {
      return NextResponse.json({ error: "Impossible de révoquer le rôle super_admin" }, { status: 403 });
    }

    if (!ASSIGNABLE_ROLES.includes(ur.role.nom)) {
      return NextResponse.json({ error: "Ce rôle ne peut pas être révoqué via cette interface" }, { status: 403 });
    }

    if (ur.egliseId !== null) {
      return NextResponse.json({ error: "Impossible de révoquer un rôle lié à une église via cette interface" }, { status: 403 });
    }

    await prisma.userRole.delete({ where: { id: userRoleId } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
