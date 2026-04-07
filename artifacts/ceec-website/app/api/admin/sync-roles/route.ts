import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { isSuperAdmin, getUserRoles } from "@/lib/auth/rbac";

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Non autorise" }, { status: 401 });

    const superAdmin = await isSuperAdmin(userId);
    const userRoles = await getUserRoles(userId);

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
        churchRoles,
      },
    });

    return NextResponse.json({
      success: true,
      isSuperAdmin: superAdmin,
      churchRoles,
    });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
