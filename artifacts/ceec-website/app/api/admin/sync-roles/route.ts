import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { isSuperAdmin, isAdminPlatteforme, isPlatformAdmin, getUserRoles } from "@/lib/auth/rbac";

async function syncUserRoles(userId: string) {
  const [superAdmin, adminPlatteforme, platformMember, userRoles] = await Promise.all([
    isSuperAdmin(userId),
    isAdminPlatteforme(userId),
    isPlatformAdmin(userId),   // true pour super_admin + admin_plateforme + moderateur_plateforme
    getUserRoles(userId),
  ]);

  const churchRoles = userRoles
    .filter((ur) => ur.egliseId !== null && ur.role.scope === "church")
    .map((ur) => ({
      egliseId: ur.egliseId as number,
      role: ur.role.nom,
    }));

  const client = await clerkClient();
  await client.users.updateUserMetadata(userId, {
    publicMetadata: {
      isSuperAdmin: superAdmin,
      isAdminPlatteforme: adminPlatteforme,
      isPlatformMember: platformMember,   // porte d'entrée middleware pour tous les rôles plateforme
      churchRoles,
    },
  });

  return { isSuperAdmin: superAdmin, isAdminPlatteforme: adminPlatteforme, isPlatformMember: platformMember, churchRoles };
}

// GET : bootstrap automatique — synchro puis redirect vers /admin (ou ?redirect=...)
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }

    const result = await syncUserRoles(userId);

    if (!result.isPlatformMember) {
      return NextResponse.redirect(new URL("/?error=acces-refuse", req.url));
    }

    const redirectTo = req.nextUrl.searchParams.get("redirect") ?? "/admin";
    const safeRedirect = redirectTo.startsWith("/") ? redirectTo : "/admin";
    return NextResponse.redirect(new URL(safeRedirect, req.url));
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// POST : synchro manuelle, retourne JSON
export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Non autorise" }, { status: 401 });

    const result = await syncUserRoles(userId);
    return NextResponse.json({ success: true, ...result });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
