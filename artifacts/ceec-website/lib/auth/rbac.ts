import { prisma } from "@/lib/db";

// ─── Permission names — aligned with prisma/seed.ts ──────────────────────────

export type Permission =
  // Plateforme globale
  | "plateforme_gerer_config"
  | "plateforme_gerer_admins"
  | "plateforme_voir_stats"
  | "plateforme_gerer_eglises"
  | "plateforme_suspendre_eglise"
  | "plateforme_voir_eglises"
  | "plateforme_moderer_contenu"
  | "plateforme_gerer_invitations"
  // Paroisse — membres
  | "eglise_gerer_membres"
  | "eglise_inviter_membres"
  | "eglise_voir_membres"
  | "eglise_suspendre_membre"
  // Paroisse — rôles
  | "eglise_gerer_roles"
  // Paroisse — annonces
  | "eglise_gerer_annonces"
  | "eglise_creer_annonce"
  | "eglise_voir_annonces"
  // Paroisse — événements
  | "eglise_gerer_evenements"
  | "eglise_creer_evenement"
  | "eglise_voir_evenements"
  // Paroisse — finances
  | "eglise_gerer_finances"
  | "eglise_voir_finances"
  // Paroisse — rapports & config
  | "eglise_voir_rapports"
  | "eglise_gerer_config";

// ─── Role constants ───────────────────────────────────────────────────────────

export const ROLES = {
  // Plateforme
  SUPER_ADMIN:           "super_admin",
  ADMIN_PLATEFORME:      "admin_plateforme",
  MODERATEUR_PLATEFORME: "moderateur_plateforme",
  // Paroisse
  ADMIN_EGLISE:          "admin_eglise",
  PASTEUR:               "pasteur",
  DIACRE:                "diacre",
  SECRETAIRE:            "secretaire",
  TRESORIER:             "tresorier",
  FIDELE:                "fidele",
} as const;

export type RoleNom = (typeof ROLES)[keyof typeof ROLES];

/** Rôles qui donnent accès au niveau plateforme (scope global) */
export const PLATFORM_ROLES = new Set<string>([
  ROLES.SUPER_ADMIN,
  ROLES.ADMIN_PLATEFORME,
  ROLES.MODERATEUR_PLATEFORME,
]);

/** Rôles church qui ont accès à l'interface de gestion (non-fidèle) */
export const CHURCH_STAFF_ROLES = new Set<string>([
  ROLES.ADMIN_EGLISE,
  ROLES.PASTEUR,
  ROLES.DIACRE,
  ROLES.SECRETAIRE,
  ROLES.TRESORIER,
]);

/** Rôles church avec accès complet à /gestion (admin + pasteur) */
export const CHURCH_ADMIN_ROLES = new Set<string>([
  ROLES.ADMIN_EGLISE,
  ROLES.PASTEUR,
]);

// ─── DB helpers ───────────────────────────────────────────────────────────────

export async function getUserRoles(clerkUserId: string) {
  return prisma.userRole.findMany({
    where: { clerkUserId },
    include: { role: true, eglise: true },
  });
}

export async function isSuperAdmin(clerkUserId: string): Promise<boolean> {
  const userRoles = await getUserRoles(clerkUserId);
  return userRoles.some((ur) => ur.role.nom === ROLES.SUPER_ADMIN);
}

/** Vrai si l'utilisateur a un rôle de niveau plateforme (super_admin, admin_plateforme, moderateur_plateforme) */
export async function isPlatformAdmin(clerkUserId: string): Promise<boolean> {
  const userRoles = await getUserRoles(clerkUserId);
  return userRoles.some((ur) => PLATFORM_ROLES.has(ur.role.nom));
}

/**
 * Vrai si l'utilisateur a un rôle d'encadrement dans cette église
 * (admin_eglise, pasteur, diacre, secretaire, tresorier — tout sauf fidele).
 * Utilisez CHURCH_ADMIN_ROLES si vous avez besoin de distinguer les rôles
 * avec accès complet à /gestion (admin + pasteur) des autres.
 */
export async function isEgliseAdmin(
  clerkUserId: string,
  egliseId: number
): Promise<boolean> {
  const userRoles = await getUserRoles(clerkUserId);
  return userRoles.some(
    (ur) => ur.egliseId === egliseId && CHURCH_STAFF_ROLES.has(ur.role.nom)
  );
}

/** Vrai si l'utilisateur a un rôle non-fidèle dans cette église (accès à /gestion) */
export async function isEgliseStaff(
  clerkUserId: string,
  egliseId: number
): Promise<boolean> {
  const userRoles = await getUserRoles(clerkUserId);
  return userRoles.some(
    (ur) => ur.egliseId === egliseId && CHURCH_STAFF_ROLES.has(ur.role.nom)
  );
}

/** Vérifie une permission spécifique pour un utilisateur, optionnellement sur une église donnée */
export async function hasPermission(
  clerkUserId: string,
  permission: Permission,
  egliseId?: number
): Promise<boolean> {
  const userRoles = await getUserRoles(clerkUserId);

  return userRoles.some((ur) => {
    const rolePerms: string[] = ur.role.permissions;
    if (!rolePerms.includes(permission)) return false;
    // Les rôles globaux (scope "global") s'appliquent partout
    if (ur.role.scope === "global") return true;
    // Les rôles d'église s'appliquent à l'église spécifiée
    if (egliseId !== undefined && ur.egliseId === egliseId) return true;
    return false;
  });
}

/** Vrai si l'utilisateur a un quelconque rôle non-fidèle */
export async function hasAnyAdminRole(clerkUserId: string): Promise<boolean> {
  const userRoles = await getUserRoles(clerkUserId);
  return userRoles.some(
    (ur) => ur.role.nom !== ROLES.FIDELE
  );
}

export async function getEgliseBySlug(slug: string) {
  return prisma.eglise.findUnique({ where: { slug } });
}

export async function getEgliseBySousDomaine(sousDomaine: string) {
  return prisma.eglise.findUnique({ where: { sousDomaine } });
}

export async function getUserEglises(clerkUserId: string) {
  const userRoles = await getUserRoles(clerkUserId);
  const eglises = userRoles
    .filter((ur) => ur.eglise !== null)
    .map((ur) => ur.eglise!);

  const seen = new Set<number>();
  return eglises.filter((e) => {
    if (seen.has(e.id)) return false;
    seen.add(e.id);
    return true;
  });
}

export async function canManageContent(
  clerkUserId: string,
  egliseId?: number
): Promise<boolean> {
  if (await isSuperAdmin(clerkUserId)) return true;
  if (egliseId !== undefined) {
    return hasPermission(clerkUserId, "eglise_gerer_annonces", egliseId);
  }
  const userRoles = await getUserRoles(clerkUserId);
  return userRoles.some((ur) =>
    (ur.role.permissions as string[]).includes("eglise_gerer_annonces")
  );
}

export async function canManageMembres(
  clerkUserId: string,
  egliseId?: number
): Promise<boolean> {
  if (await isSuperAdmin(clerkUserId)) return true;
  if (egliseId !== undefined) {
    return hasPermission(clerkUserId, "eglise_gerer_membres", egliseId);
  }
  const userRoles = await getUserRoles(clerkUserId);
  return userRoles.some((ur) =>
    (ur.role.permissions as string[]).includes("eglise_gerer_membres")
  );
}
