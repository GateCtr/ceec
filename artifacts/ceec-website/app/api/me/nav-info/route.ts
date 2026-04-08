import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { isSuperAdmin, getUserRoles } from "@/lib/auth/rbac";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ isSuperAdmin: false, isChurchAdmin: false, churchSlugs: [] });
    }

    const [superAdmin, userRoles] = await Promise.all([
      isSuperAdmin(userId),
      getUserRoles(userId),
    ]);

    const churchSlugs = userRoles
      .filter((ur) => ur.eglise?.slug && ur.role.nom !== "fidele")
      .map((ur) => ur.eglise!.slug!);

    return NextResponse.json({
      isSuperAdmin: superAdmin,
      isChurchAdmin: churchSlugs.length > 0,
      churchSlugs,
    });
  } catch {
    return NextResponse.json({ isSuperAdmin: false, isChurchAdmin: false, churchSlugs: [] });
  }
}
