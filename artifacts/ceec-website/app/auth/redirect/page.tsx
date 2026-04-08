import { auth } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { isSuperAdmin, getUserRoles, ROLES } from "@/lib/auth/rbac";
import { prisma } from "@/lib/db";

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "ceec.cd";

function buildChurchUrl(slug: string, path: string, isLocalDev: boolean): string {
  if (isLocalDev) {
    // En dev : le middleware lit ?eglise=slug et redirige vers /c ou injecte les headers /gestion
    return path === "/c" ? `/?eglise=${slug}` : `${path}?eglise=${slug}`;
  }
  // En production : vrai sous-domaine
  return `https://${slug}.${ROOT_DOMAIN}${path}`;
}

export default async function AuthRedirectPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const headersList = await headers();
  const host = headersList.get("host") ?? "";
  const isLocalDev =
    host.includes("localhost") ||
    host.includes("127.0.0.1") ||
    host.includes(".replit.dev") ||
    host.includes(".kirk.replit.dev");

  // 1. Super admin plateforme → tableau de bord admin CEEC
  const superAdmin = await isSuperAdmin(userId);
  if (superAdmin) redirect("/admin");

  // 2. Admin ou modérateur d'église → espace gestion de la paroisse
  const userRoles = await getUserRoles(userId);
  const adminRole = userRoles.find(
    (ur) =>
      ur.eglise?.slug &&
      (ur.role.nom === ROLES.ADMIN_EGLISE || ur.role.nom === ROLES.MODERATEUR)
  );
  if (adminRole?.eglise?.slug) {
    redirect(buildChurchUrl(adminRole.eglise.slug, "/gestion", isLocalDev));
  }

  // 3. Fidèle rattaché à une église → espace membre de sa paroisse (/c)
  const membre = await prisma.membre.findFirst({
    where: { clerkUserId: userId, statut: "actif" },
    include: { eglise: true },
  });
  if (membre?.eglise?.slug) {
    redirect(buildChurchUrl(membre.eglise.slug, "/c", isLocalDev));
  }

  // 4. Aucun rattachement → tableau de bord plateforme (choisir sa paroisse)
  redirect("/dashboard");
}
