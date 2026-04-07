import { prisma } from "@/lib/db";

export type Permission =
  | "platform:manage"
  | "eglise:manage"
  | "eglise:suspend"
  | "membres:manage"
  | "contenus:manage"
  | "admins:manage";

export const ROLES = {
  SUPER_ADMIN: "super_admin",
  ADMIN_EGLISE: "admin_eglise",
  MODERATEUR: "moderateur",
  FIDELE: "fidele",
} as const;

export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  super_admin: [
    "platform:manage",
    "eglise:manage",
    "eglise:suspend",
    "membres:manage",
    "contenus:manage",
    "admins:manage",
  ],
  admin_eglise: [
    "eglise:manage",
    "membres:manage",
    "contenus:manage",
    "admins:manage",
  ],
  moderateur: [
    "contenus:manage",
  ],
  fidele: [],
};

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

export async function isEgliseAdmin(
  clerkUserId: string,
  egliseId: number
): Promise<boolean> {
  const userRoles = await getUserRoles(clerkUserId);
  return userRoles.some(
    (ur) =>
      ur.egliseId === egliseId &&
      (ur.role.nom === ROLES.ADMIN_EGLISE || ur.role.nom === ROLES.MODERATEUR)
  );
}

export async function hasPermission(
  clerkUserId: string,
  permission: Permission,
  egliseId?: number
): Promise<boolean> {
  const userRoles = await getUserRoles(clerkUserId);

  return userRoles.some((ur) => {
    const rolePerms: string[] = ur.role.permissions;
    if (!rolePerms.includes(permission)) return false;
    if (ur.role.scope === "platform") return true;
    if (egliseId !== undefined && ur.egliseId === egliseId) return true;
    return false;
  });
}

export async function hasAnyAdminRole(clerkUserId: string): Promise<boolean> {
  const userRoles = await getUserRoles(clerkUserId);
  return userRoles.some((ur) => ur.role.nom !== ROLES.FIDELE);
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
    return hasPermission(clerkUserId, "contenus:manage", egliseId);
  }
  const userRoles = await getUserRoles(clerkUserId);
  return userRoles.some((ur) => ur.role.permissions.includes("contenus:manage"));
}

export async function canManageMembres(
  clerkUserId: string,
  egliseId?: number
): Promise<boolean> {
  if (await isSuperAdmin(clerkUserId)) return true;
  if (egliseId !== undefined) {
    return hasPermission(clerkUserId, "membres:manage", egliseId);
  }
  const userRoles = await getUserRoles(clerkUserId);
  return userRoles.some((ur) => ur.role.permissions.includes("membres:manage"));
}
