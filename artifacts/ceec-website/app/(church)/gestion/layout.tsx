import { headers } from "next/headers";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { hasPermission, isSuperAdmin, isEgliseStaff } from "@/lib/auth/rbac";
import { EgliseProvider, type EgliseData } from "@/lib/church-context";
import DashboardShell from "@/components/dashboard/DashboardShell";
import type { NavItem } from "@/components/dashboard/DashboardSidebar";

export default async function GestionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const egliseIdHeader = headersList.get("x-eglise-id");
  const slug = headersList.get("x-eglise-slug");

  if (!egliseIdHeader || !slug) {
    redirect("/c");
  }

  const egliseId = parseInt(egliseIdHeader, 10);
  if (isNaN(egliseId)) redirect("/c");

  const { userId } = await auth();
  if (!userId) redirect("/c/connexion");

  const superAdmin = await isSuperAdmin(userId);
  const staff = superAdmin || await isEgliseStaff(userId, egliseId);
  if (!staff) {
    redirect("/c?error=acces-refuse");
  }

  const [eglise, permissions] = await Promise.all([
    prisma.eglise.findUnique({
      where: { id: egliseId },
      select: {
        id: true, nom: true, slug: true, sousDomaine: true, statut: true,
        ville: true, adresse: true, pasteur: true, telephone: true,
        email: true, description: true, logoUrl: true, photoUrl: true,
      },
    }),
    Promise.all([
      hasPermission(userId, "eglise_creer_annonce", egliseId),
      hasPermission(userId, "eglise_gerer_membres", egliseId),
      hasPermission(userId, "eglise_gerer_roles", egliseId),
      hasPermission(userId, "eglise_gerer_config", egliseId),
    ]),
  ]);

  if (!eglise) redirect("/c");

  if (eglise.statut === "suspendu" && !superAdmin) {
    redirect("/c/suspendu");
  }

  const [pContenus, pMembres, pAdmins, pEglise] = permissions;
  const canMembres = superAdmin || pMembres;
  const canAdmins = superAdmin || pAdmins;
  const canParametres = superAdmin || pEglise;

  const navItems: NavItem[] = [
    { label: "Tableau de bord", href: "/gestion", icon: "📊", matchExact: true },
    ...(superAdmin || pContenus ? [
      { label: "Annonces", href: "/gestion/annonces", icon: "📢" },
      { label: "Événements", href: "/gestion/evenements", icon: "🗓️" },
    ] : []),
    ...(canParametres ? [
      { label: "Pages", href: "/gestion/pages", icon: "📄" },
      { label: "Vidéos", href: "/gestion/videos", icon: "▶️" },
      { label: "Apparence", href: "/gestion/apparence", icon: "🎨" },
    ] : []),
    ...(canMembres ? [{ label: "Membres", href: "/gestion/membres", icon: "👥" }] : []),
    ...(canAdmins ? [{ label: "Admins", href: "/gestion/admins", icon: "🔐" }] : []),
    ...(canParametres ? [{ label: "Paramètres", href: "/gestion/parametres", icon: "⚙️" }] : []),
    { label: "Journal", href: "/gestion/journal", icon: "📋" },
  ];

  const initial = eglise.nom.charAt(0).toUpperCase();

  return (
    <EgliseProvider eglise={eglise as EgliseData} isChurchDomain={true}>
      <DashboardShell
        items={navItems}
        headerTitle={eglise.nom}
        headerSubtitle="Espace de gestion"
        headerInitial={initial}
        headerColor="#c59b2e"
        contextLabel={eglise.nom}
        backHref="/c"
        backLabel="Site public"
        storageKey={`ceec-gestion-sidebar-collapsed-${eglise.slug}`}
      >
        {children}
      </DashboardShell>
    </EgliseProvider>
  );
}
