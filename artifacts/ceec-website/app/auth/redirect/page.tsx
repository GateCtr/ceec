import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { isSuperAdmin, getUserRoles, ROLES } from "@/lib/auth/rbac";

export default async function AuthRedirectPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const [superAdmin, userRoles] = await Promise.all([
    isSuperAdmin(userId),
    getUserRoles(userId),
  ]);

  if (superAdmin) redirect("/admin");

  const churchAdminRole = userRoles.find(
    (ur) =>
      ur.eglise?.slug &&
      (ur.role.nom === ROLES.ADMIN_EGLISE || ur.role.nom === ROLES.MODERATEUR)
  );

  if (churchAdminRole?.eglise?.slug) {
    redirect(`/gestion?eglise=${churchAdminRole.eglise.slug}`);
  }

  redirect("/dashboard");
}
