import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { isSuperAdmin, getUserRoles, ROLES } from "@/lib/auth/rbac";

const ROLE_LABELS: Record<string, string> = {
  [ROLES.SUPER_ADMIN]:          "Super Administrateur CEEC",
  [ROLES.ADMIN_PLATEFORME]:     "Administrateur Plateforme",
  [ROLES.MODERATEUR_PLATEFORME]:"Modérateur Plateforme",
  [ROLES.ADMIN_EGLISE]:         "Administrateur d'église",
  [ROLES.PASTEUR]:              "Pasteur",
  [ROLES.DIACRE]:               "Diacre",
  [ROLES.SECRETAIRE]:           "Secrétaire",
  [ROLES.TRESORIER]:            "Trésorier",
  [ROLES.FIDELE]:               "Fidèle",
};

const CHURCH_STAFF: Set<string> = new Set([
  ROLES.ADMIN_EGLISE, ROLES.PASTEUR, ROLES.DIACRE,
  ROLES.SECRETAIRE, ROLES.TRESORIER,
]);

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({
        isSuperAdmin: false, isChurchAdmin: false,
        churchSlugs: [], roleLabel: null, churchName: null,
      });
    }

    const [superAdmin, userRoles] = await Promise.all([
      isSuperAdmin(userId),
      getUserRoles(userId),
    ]);

    const staffRoles = userRoles.filter(
      (ur) => ur.eglise?.slug && CHURCH_STAFF.has(ur.role.nom)
    );

    const churchSlugs = staffRoles.map((ur) => ur.eglise!.slug!);
    const isChurchAdmin = churchSlugs.length > 0;

    const primaryRole = superAdmin
      ? ROLES.SUPER_ADMIN
      : staffRoles[0]?.role.nom ??
        (userRoles.find((ur) => ur.role.nom === ROLES.FIDELE)?.role.nom ?? null);

    const roleLabel = primaryRole ? (ROLE_LABELS[primaryRole] ?? primaryRole) : "Membre";
    const churchName = staffRoles[0]?.eglise?.nom ?? null;

    return NextResponse.json({
      isSuperAdmin: superAdmin,
      isChurchAdmin,
      churchSlugs,
      roleLabel,
      churchName,
    });
  } catch {
    return NextResponse.json({
      isSuperAdmin: false, isChurchAdmin: false,
      churchSlugs: [], roleLabel: null, churchName: null,
    });
  }
}
