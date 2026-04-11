import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getUserRoles, ROLES } from "@/lib/auth/rbac";

const ROLE_LABELS: Record<string, string> = {
  [ROLES.SUPER_ADMIN]:           "Super Administrateur CEEC",
  [ROLES.ADMIN_PLATEFORME]:      "Administrateur Plateforme",
  [ROLES.MODERATEUR_PLATEFORME]: "Modérateur Plateforme",
  [ROLES.ADMIN_EGLISE]:          "Administrateur d'église",
  [ROLES.PASTEUR]:               "Pasteur",
  [ROLES.DIACRE]:                "Diacre",
  [ROLES.SECRETAIRE]:            "Secrétaire",
  [ROLES.TRESORIER]:             "Trésorier",
  [ROLES.FIDELE]:                "Fidèle",
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
        churchSlugs: [], roleLabel: "Visiteur", churchName: null,
      });
    }

    // Une seule requête DB — toute la logique en dérive
    const userRoles = await getUserRoles(userId);

    const isSuperAdmin  = userRoles.some((ur) => ur.role.nom === ROLES.SUPER_ADMIN);
    const isPlatform    = userRoles.some((ur) =>
      ur.role.nom === ROLES.ADMIN_PLATEFORME || ur.role.nom === ROLES.MODERATEUR_PLATEFORME
    );

    const staffRoles = userRoles.filter(
      (ur) => ur.eglise?.slug && CHURCH_STAFF.has(ur.role.nom)
    );
    const isChurchAdmin = staffRoles.length > 0;
    const churchSlugs   = staffRoles.map((ur) => ur.eglise!.slug!);
    const churchName    = staffRoles[0]?.eglise?.nom ?? null;

    // Rôle prioritaire pour l'affichage
    let roleLabel: string;
    if (isSuperAdmin) {
      roleLabel = ROLE_LABELS[ROLES.SUPER_ADMIN];
    } else if (isPlatform) {
      const platformRole = userRoles.find((ur) =>
        ur.role.nom === ROLES.ADMIN_PLATEFORME || ur.role.nom === ROLES.MODERATEUR_PLATEFORME
      );
      roleLabel = ROLE_LABELS[platformRole!.role.nom] ?? "Administrateur";
    } else if (isChurchAdmin) {
      roleLabel = ROLE_LABELS[staffRoles[0].role.nom] ?? "Personnel d'église";
    } else {
      const fideleRole = userRoles.find((ur) => ur.role.nom === ROLES.FIDELE);
      roleLabel = fideleRole ? ROLE_LABELS[ROLES.FIDELE] : "Membre";
    }

    return NextResponse.json({
      isSuperAdmin,
      isChurchAdmin,
      churchSlugs,
      roleLabel,
      churchName,
    });
  } catch (err) {
    console.error("[nav-info] Erreur:", err);
    return NextResponse.json({
      isSuperAdmin: false, isChurchAdmin: false,
      churchSlugs: [], roleLabel: "Membre", churchName: null,
    });
  }
}
