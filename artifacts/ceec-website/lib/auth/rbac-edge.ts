export type JwtSessionClaims = Record<string, unknown> | null | undefined;

export type ChurchRoleClaim = {
  egliseId: number;
  role: string;
};

function getPublicMeta(sessionClaims: JwtSessionClaims): Record<string, unknown> {
  if (!sessionClaims) return {};
  return (
    (sessionClaims.metadata as Record<string, unknown> | undefined) ??
    (sessionClaims.public_metadata as Record<string, unknown> | undefined) ??
    {}
  );
}

export function isSuperAdminFromClaims(sessionClaims: JwtSessionClaims): boolean {
  return getPublicMeta(sessionClaims).isSuperAdmin === true;
}

export function getChurchRolesFromClaims(
  sessionClaims: JwtSessionClaims
): ChurchRoleClaim[] {
  const roles = getPublicMeta(sessionClaims).churchRoles;
  return Array.isArray(roles) ? (roles as ChurchRoleClaim[]) : [];
}

export function hasChurchRoleFromClaims(
  sessionClaims: JwtSessionClaims,
  egliseId: number,
  role: string
): boolean {
  return getChurchRolesFromClaims(sessionClaims).some(
    (cr) => cr.egliseId === egliseId && cr.role === role
  );
}

export function hasAnyChurchRoleFromClaims(
  sessionClaims: JwtSessionClaims
): boolean {
  return getChurchRolesFromClaims(sessionClaims).length > 0;
}

export function isEgliseAdminFromClaims(
  sessionClaims: JwtSessionClaims,
  egliseId: number
): boolean {
  if (isSuperAdminFromClaims(sessionClaims)) return true;
  return hasChurchRoleFromClaims(sessionClaims, egliseId, "admin_eglise");
}
