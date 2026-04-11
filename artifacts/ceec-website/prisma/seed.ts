import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

function createPrisma() {
  const connectionString = process.env.DATABASE_URL!;
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

const prisma = createPrisma();

// ─── Permissions ────────────────────────────────────────────────────────────

const PERMISSIONS = [
  // Plateforme globale
  { nom: "gerer_plateforme",    description: "Gérer toute la plateforme CEEC (super admin)" },
  { nom: "gerer_eglises",       description: "Créer, modifier et supprimer des paroisses" },
  { nom: "voir_toutes_eglises", description: "Voir toutes les paroisses de la plateforme" },
  // Membres
  { nom: "gerer_membres",       description: "Gérer les membres d'une paroisse" },
  { nom: "inviter_membres",     description: "Inviter de nouveaux membres dans une paroisse" },
  { nom: "voir_membres",        description: "Consulter la liste des membres" },
  { nom: "suspendre_membre",    description: "Suspendre / réactiver un membre" },
  // Rôles
  { nom: "gerer_roles",         description: "Attribuer et révoquer des rôles dans une paroisse" },
  // Annonces
  { nom: "gerer_annonces",      description: "Gérer toutes les annonces d'une paroisse" },
  { nom: "creer_annonce",       description: "Créer une annonce" },
  { nom: "voir_annonces",       description: "Consulter les annonces" },
  // Événements
  { nom: "gerer_evenements",    description: "Gérer tous les événements d'une paroisse" },
  { nom: "creer_evenement",     description: "Créer un événement" },
  { nom: "voir_evenements",     description: "Consulter les événements" },
  // Finances
  { nom: "gerer_finances",      description: "Gérer les finances d'une paroisse" },
  { nom: "voir_finances",       description: "Consulter les finances" },
  // Rapports & Config
  { nom: "voir_rapports",       description: "Voir les statistiques et rapports" },
  { nom: "gerer_config",        description: "Modifier la configuration de la paroisse" },
];

// ─── Rôles avec leurs permissions ──────────────────────────────────────────

const ROLES: Array<{ nom: string; scope: string; permissions: string[] }> = [
  {
    nom: "super_admin",
    scope: "global",
    permissions: PERMISSIONS.map((p) => p.nom),
  },
  {
    nom: "admin_eglise",
    scope: "eglise",
    permissions: [
      "gerer_membres",
      "inviter_membres",
      "voir_membres",
      "suspendre_membre",
      "gerer_roles",
      "gerer_annonces",
      "creer_annonce",
      "voir_annonces",
      "gerer_evenements",
      "creer_evenement",
      "voir_evenements",
      "gerer_finances",
      "voir_finances",
      "voir_rapports",
      "gerer_config",
    ],
  },
  {
    nom: "pasteur",
    scope: "eglise",
    permissions: [
      "voir_membres",
      "inviter_membres",
      "gerer_annonces",
      "creer_annonce",
      "voir_annonces",
      "gerer_evenements",
      "creer_evenement",
      "voir_evenements",
      "voir_finances",
      "voir_rapports",
    ],
  },
  {
    nom: "secretaire",
    scope: "eglise",
    permissions: [
      "voir_membres",
      "inviter_membres",
      "gerer_membres",
      "creer_annonce",
      "voir_annonces",
      "creer_evenement",
      "voir_evenements",
      "voir_rapports",
    ],
  },
  {
    nom: "tresorier",
    scope: "eglise",
    permissions: [
      "voir_membres",
      "voir_annonces",
      "voir_evenements",
      "gerer_finances",
      "voir_finances",
      "voir_rapports",
    ],
  },
  {
    nom: "fidele",
    scope: "eglise",
    permissions: [
      "voir_annonces",
      "voir_evenements",
      "voir_membres",
    ],
  },
];

// ─── Super admin ────────────────────────────────────────────────────────────

const SUPER_ADMIN_CLERK_ID = "user_3CBl2z66hYfxWguiyvxmxBd9rCt";

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Seed RBAC CEEC — démarrage\n");

  // 1. Permissions
  console.log("📋 Permissions…");
  for (const perm of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { nom: perm.nom },
      update: { description: perm.description },
      create: perm,
    });
  }
  console.log(`   ✓ ${PERMISSIONS.length} permissions`);

  // 2. Rôles + RolePermissions
  console.log("\n🎭 Rôles…");
  for (const roleDef of ROLES) {
    const role = await prisma.role.upsert({
      where: { nom: roleDef.nom },
      update: { scope: roleDef.scope, permissions: roleDef.permissions },
      create: { nom: roleDef.nom, scope: roleDef.scope, permissions: roleDef.permissions },
    });

    const permRecords = await prisma.permission.findMany({
      where: { nom: { in: roleDef.permissions } },
    });

    for (const perm of permRecords) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: perm.id } },
        update: {},
        create: { roleId: role.id, permissionId: perm.id },
      });
    }

    console.log(`   ✓ ${roleDef.nom.padEnd(14)} [${roleDef.scope}] → ${roleDef.permissions.length} permissions`);
  }

  // 3. UserRole super_admin (egliseId null → pas d'upsert, on vérifie manuellement)
  console.log("\n👑 Assignation super_admin…");
  const superAdminRole = await prisma.role.findUnique({ where: { nom: "super_admin" } });
  if (superAdminRole) {
    const existing = await prisma.userRole.findFirst({
      where: {
        clerkUserId: SUPER_ADMIN_CLERK_ID,
        roleId: superAdminRole.id,
        egliseId: null,
      },
    });
    if (!existing) {
      await prisma.userRole.create({
        data: {
          clerkUserId: SUPER_ADMIN_CLERK_ID,
          roleId: superAdminRole.id,
          egliseId: null,
        },
      });
    }
    console.log(`   ✓ ${SUPER_ADMIN_CLERK_ID} → super_admin (global)`);
  }

  // 4. Résumé
  const stats = {
    permissions:      await prisma.permission.count(),
    roles:            await prisma.role.count(),
    rolePermissions:  await prisma.rolePermission.count(),
    userRoles:        await prisma.userRole.count(),
  };

  console.log("\n📊 Résumé :");
  console.log(`   permissions      : ${stats.permissions}`);
  console.log(`   roles            : ${stats.roles}`);
  console.log(`   role_permissions : ${stats.rolePermissions}`);
  console.log(`   user_roles       : ${stats.userRoles}`);
  console.log("\n✅ Seed terminé !\n");
}

main()
  .catch((e) => { console.error("❌ Erreur :", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
