import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { isPlatformAdmin, getUserRoles, ROLES } from "@/lib/auth/rbac";
import DashboardShell from "@/components/dashboard/DashboardShell";
import type { NavItem } from "@/components/dashboard/DashboardSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  if (!(await isPlatformAdmin(userId))) redirect("/sign-in");

  const userRoles = await getUserRoles(userId);
  const roleNames = userRoles.map((ur) => ur.role.nom);
  const isSuperAdmin = roleNames.includes(ROLES.SUPER_ADMIN);
  const isAdminPlateforme = roleNames.includes(ROLES.ADMIN_PLATEFORME);
  const isModerateur = roleNames.includes(ROLES.MODERATEUR_PLATEFORME);

  const userRoleLabel = isSuperAdmin
    ? "Super Administrateur"
    : isAdminPlateforme
    ? "Admin Plateforme"
    : "Modérateur";

  const adminItems: NavItem[] = [
    {
      label: "Tableau de bord",
      href: "/admin",
      icon: "dashboard",
      matchExact: true,
    },
    ...(isSuperAdmin || isAdminPlateforme
      ? [
          { label: "Églises", href: "/admin/eglises", icon: "church" },
          { label: "Membres", href: "/admin/membres", icon: "users" },
        ]
      : []),
    {
      label: "Annonces",
      href: "/admin/annonces",
      icon: "megaphone",
    },
    {
      label: "Événements",
      href: "/admin/evenements",
      icon: "calendar",
    },
    ...(isSuperAdmin
      ? [
          {
            label: "Utilisateurs admin",
            href: "/admin/utilisateurs",
            icon: "shield",
          },
        ]
      : []),
    {
      label: "Journal d'activité",
      href: "/admin/logs",
      icon: "logs",
    },
  ];

  return (
    <DashboardShell
      items={adminItems}
      headerTitle="CEEC"
      headerSubtitle="Administration plateforme"
      logoUrl="/logo-ceec.png"
      headerInitial="C"
      headerColor="#c59b2e"
      contextLabel="Administration Plateforme"
      backHref="/"
      backLabel="Retour au site"
      storageKey="ceec-admin-sidebar-collapsed"
      userRole={userRoleLabel}
    >
      {children}
    </DashboardShell>
  );
}
