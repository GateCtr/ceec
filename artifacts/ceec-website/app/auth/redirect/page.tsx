import { auth } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  isSuperAdmin,
  isPlatformAdmin,
  getUserRoles,
  CHURCH_STAFF_ROLES,
} from "@/lib/auth/rbac";
import { prisma } from "@/lib/db";

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "ceec-rdc.org";

function buildChurchUrl(slug: string, path: string, isLocalDev: boolean): string {
  if (isLocalDev) {
    return path === "/c" ? `/?eglise=${slug}` : `${path}?eglise=${slug}`;
  }
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

  // 1. Super admin → tableau de bord admin CEEC
  const superAdmin = await isSuperAdmin(userId);
  if (superAdmin) redirect("/admin");

  // 2. Admin ou modérateur plateforme → tableau de bord admin
  const platformAdmin = await isPlatformAdmin(userId);
  if (platformAdmin) redirect("/admin");

  // 3. Tout membre du personnel d'église (admin, pasteur, diacre, secrétaire, trésorier)
  //    → espace gestion de la paroisse (contenu différent des fidèles)
  const userRoles = await getUserRoles(userId);

  const churchStaffRole = userRoles.find(
    (ur) => ur.eglise?.slug && CHURCH_STAFF_ROLES.has(ur.role.nom)
  );
  if (churchStaffRole?.eglise?.slug) {
    redirect(buildChurchUrl(churchStaffRole.eglise.slug, "/gestion", isLocalDev));
  }

  // 4. Fidèle rattaché à une église → espace membre de sa paroisse
  const membre = await prisma.membre.findFirst({
    where: { clerkUserId: userId, statut: "actif" },
    include: { eglise: true },
  });
  if (membre?.eglise?.slug) {
    redirect(buildChurchUrl(membre.eglise.slug, "/c", isLocalDev));
  }

  // 5. Fidèle sans rattachement → choisir sa paroisse
  redirect("/sign-up");
}
