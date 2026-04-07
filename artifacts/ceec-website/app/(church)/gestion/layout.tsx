import { headers } from "next/headers";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { hasPermission, isSuperAdmin, type Permission } from "@/lib/auth/rbac";
import GestionSidebar from "@/components/gestion/GestionSidebar";
import { EgliseProvider, type EgliseData } from "@/lib/church-context";

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
  const canManageContenu = superAdmin || await hasPermission(userId, "contenus:manage", egliseId);
  if (!canManageContenu) {
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
      hasPermission(userId, "contenus:manage", egliseId),
      hasPermission(userId, "membres:manage", egliseId),
      hasPermission(userId, "admins:manage", egliseId),
      hasPermission(userId, "eglise:manage", egliseId),
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

  const navPerms = {
    contenus: superAdmin || pContenus,
    membres: canMembres,
    admins: canAdmins,
    parametres: canParametres,
  };

  return (
    <EgliseProvider eglise={eglise as EgliseData} isChurchDomain={true}>
      <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}>
        <GestionSidebar eglise={eglise as EgliseData} permissions={navPerms} />
        <div style={{ flex: 1, minWidth: 0 }}>
          {children}
        </div>
      </div>
    </EgliseProvider>
  );
}
