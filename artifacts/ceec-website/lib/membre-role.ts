import { prisma } from "@/lib/db";

export const CHURCH_ROLE_PRIORITY = [
  "admin_eglise",
  "pasteur",
  "diacre",
  "tresorier",
  "secretaire",
  "fidele",
];

export const CHURCH_ROLE_LABELS: Record<string, { label: string; bg: string; color: string }> = {
  admin_eglise: { label: "Admin église",  bg: "#dcfce7", color: "#15803d" },
  pasteur:      { label: "Pasteur",       bg: "#ede9fe", color: "#6d28d9" },
  diacre:       { label: "Diacre",        bg: "#fef9c3", color: "#a16207" },
  tresorier:    { label: "Trésorier",     bg: "#ffedd5", color: "#c2410c" },
  secretaire:   { label: "Secrétaire",    bg: "#e0f2fe", color: "#0369a1" },
  fidele:       { label: "Fidèle",        bg: "#e0e7ff", color: "#3730a3" },
};

/** Highest-priority church role for a user in a given church. */
export async function getMemberChurchRole(
  clerkUserId: string,
  egliseId: number
): Promise<string> {
  const userRoles = await prisma.userRole.findMany({
    where: { clerkUserId, egliseId },
    include: { role: { select: { nom: true } } },
  });
  for (const roleName of CHURCH_ROLE_PRIORITY) {
    if (userRoles.some((ur) => ur.role.nom === roleName)) return roleName;
  }
  return "fidele";
}

/** Replace a member's non-admin church roles with a new role. */
export async function setMemberChurchRole(
  clerkUserId: string,
  egliseId: number,
  newRoleNom: string
): Promise<void> {
  const role = await prisma.role.findUnique({ where: { nom: newRoleNom } });
  if (!role) throw new Error(`Rôle "${newRoleNom}" introuvable`);

  await prisma.$transaction(async (tx) => {
    const existing = await tx.userRole.findMany({
      where: { clerkUserId, egliseId },
      include: { role: { select: { nom: true } } },
    });
    const toRemove = existing.filter((ur) => ur.role.nom !== "admin_eglise");
    if (toRemove.length > 0) {
      await tx.userRole.deleteMany({ where: { id: { in: toRemove.map((r) => r.id) } } });
    }
    await tx.userRole.upsert({
      where: { user_role_unique: { clerkUserId, roleId: role.id, egliseId } },
      update: {},
      create: { clerkUserId, roleId: role.id, egliseId },
    });
  });
}

/** Bulk-enrich a list of members (single church) with their roleNom from user_roles. */
export async function enrichMembresWithRoles<T extends { clerkUserId: string }>(
  membres: T[],
  egliseId: number
): Promise<(T & { roleNom: string })[]> {
  if (membres.length === 0) return [];
  const clerkIds = [...new Set(membres.map((m) => m.clerkUserId))];
  const userRoles = await prisma.userRole.findMany({
    where: { clerkUserId: { in: clerkIds }, egliseId },
    include: { role: { select: { nom: true } } },
  });
  const roleMap = new Map<string, string>();
  for (const clerkId of clerkIds) {
    const roles = userRoles.filter((ur) => ur.clerkUserId === clerkId).map((ur) => ur.role.nom);
    const best = CHURCH_ROLE_PRIORITY.find((p) => roles.includes(p)) ?? "fidele";
    roleMap.set(clerkId, best);
  }
  return membres.map((m) => ({ ...m, roleNom: roleMap.get(m.clerkUserId) ?? "fidele" }));
}

/** Bulk-enrich members across multiple churches. */
export async function enrichMembresWithRolesMultiChurch<
  T extends { clerkUserId: string; egliseId: number | null }
>(membres: T[]): Promise<(T & { roleNom: string })[]> {
  if (membres.length === 0) return [];
  const withChurch = membres.filter((m) => m.egliseId !== null);
  if (withChurch.length === 0) return membres.map((m) => ({ ...m, roleNom: "fidele" }));

  const clerkIds = [...new Set(withChurch.map((m) => m.clerkUserId))];
  const egliseIds = [...new Set(withChurch.map((m) => m.egliseId as number))];

  const userRoles = await prisma.userRole.findMany({
    where: { clerkUserId: { in: clerkIds }, egliseId: { in: egliseIds } },
    include: { role: { select: { nom: true } } },
  });

  const roleMap = new Map<string, string>();
  for (const m of withChurch) {
    const key = `${m.clerkUserId}:${m.egliseId}`;
    if (!roleMap.has(key)) {
      const roles = userRoles
        .filter((ur) => ur.clerkUserId === m.clerkUserId && ur.egliseId === m.egliseId)
        .map((ur) => ur.role.nom);
      const best = CHURCH_ROLE_PRIORITY.find((p) => roles.includes(p)) ?? "fidele";
      roleMap.set(key, best);
    }
  }
  return membres.map((m) => ({
    ...m,
    roleNom: m.egliseId ? (roleMap.get(`${m.clerkUserId}:${m.egliseId}`) ?? "fidele") : "fidele",
  }));
}
