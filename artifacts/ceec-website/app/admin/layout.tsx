import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { isSuperAdmin } from "@/lib/auth/rbac";
import DashboardShell from "@/components/dashboard/DashboardShell";
import type { NavItem } from "@/components/dashboard/DashboardSidebar";

const adminItems: NavItem[] = [
  { label: "Tableau de bord", href: "/admin", icon: "📊", matchExact: true },
  { label: "Églises", href: "/admin/eglises", icon: "⛪" },
  { label: "Membres", href: "/admin/membres", icon: "👥" },
  { label: "Annonces", href: "/admin/annonces", icon: "📢" },
  { label: "Événements", href: "/admin/evenements", icon: "🗓️" },
  { label: "Paroisses", href: "/admin/paroisses", icon: "🏛️" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  if (!(await isSuperAdmin(userId))) redirect("/sign-in");

  return (
    <DashboardShell
      items={adminItems}
      headerTitle="CEEC"
      headerSubtitle="Administration plateforme"
      headerInitial="C"
      headerColor="#c59b2e"
      contextLabel="Administration Plateforme"
      backHref="/"
      backLabel="Accueil"
      storageKey="ceec-admin-sidebar-collapsed"
    >
      {children}
    </DashboardShell>
  );
}
