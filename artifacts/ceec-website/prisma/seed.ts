import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

function createPrisma() {
  const connectionString = process.env.DATABASE_URL!;
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

const prisma = createPrisma();

// ─── Permissions ─────────────────────────────────────────────────────────────

const PERMISSIONS = [
  // ── Plateforme globale ──
  { nom: "plateforme_gerer_config",      description: "Modifier les paramètres globaux de la plateforme" },
  { nom: "plateforme_gerer_admins",      description: "Créer / révoquer des admins et modérateurs de plateforme" },
  { nom: "plateforme_voir_stats",        description: "Voir les statistiques globales de la plateforme" },
  { nom: "plateforme_gerer_eglises",     description: "Créer, modifier et supprimer des paroisses" },
  { nom: "plateforme_suspendre_eglise",  description: "Suspendre / réactiver une paroisse" },
  { nom: "plateforme_voir_eglises",      description: "Lister et consulter toutes les paroisses" },
  { nom: "plateforme_moderer_contenu",   description: "Modérer le contenu entre paroisses et traiter les signalements" },
  { nom: "plateforme_gerer_invitations", description: "Gérer les tokens d'invitation de la plateforme" },

  // ── Paroisse — membres ──
  { nom: "eglise_gerer_membres",         description: "Gérer les membres de la paroisse (modifier, supprimer)" },
  { nom: "eglise_inviter_membres",       description: "Inviter de nouveaux membres dans la paroisse" },
  { nom: "eglise_voir_membres",          description: "Consulter la liste des membres" },
  { nom: "eglise_suspendre_membre",      description: "Suspendre / réactiver un membre" },

  // ── Paroisse — rôles ──
  { nom: "eglise_gerer_roles",           description: "Attribuer et révoquer des rôles dans la paroisse" },

  // ── Paroisse — annonces ──
  { nom: "eglise_gerer_annonces",        description: "Gérer toutes les annonces de la paroisse" },
  { nom: "eglise_creer_annonce",         description: "Créer une annonce" },
  { nom: "eglise_voir_annonces",         description: "Consulter les annonces" },

  // ── Paroisse — événements ──
  { nom: "eglise_gerer_evenements",      description: "Gérer tous les événements de la paroisse" },
  { nom: "eglise_creer_evenement",       description: "Créer un événement" },
  { nom: "eglise_voir_evenements",       description: "Consulter les événements" },

  // ── Paroisse — finances ──
  { nom: "eglise_gerer_finances",        description: "Saisir et gérer les données financières" },
  { nom: "eglise_voir_finances",         description: "Consulter les données financières" },

  // ── Paroisse — rapports & config ──
  { nom: "eglise_voir_rapports",         description: "Voir les rapports et statistiques de la paroisse" },
  { nom: "eglise_gerer_config",          description: "Modifier la configuration de la paroisse" },
];

// ─── Rôles ───────────────────────────────────────────────────────────────────

const ROLES: Array<{ nom: string; scope: string; permissions: string[] }> = [

  // ════ Niveau plateforme ════

  {
    nom: "super_admin",
    scope: "global",
    // Accès absolu : tout
    permissions: PERMISSIONS.map((p) => p.nom),
  },
  {
    nom: "admin_plateforme",
    scope: "global",
    // Gestion des paroisses + stats, mais pas les paramètres système ni la gestion des autres admins
    permissions: [
      "plateforme_voir_stats",
      "plateforme_gerer_eglises",
      "plateforme_suspendre_eglise",
      "plateforme_voir_eglises",
      "plateforme_moderer_contenu",
      "plateforme_gerer_invitations",
    ],
  },
  {
    nom: "moderateur_plateforme",
    scope: "global",
    // Modération du contenu uniquement, lecture des paroisses
    permissions: [
      "plateforme_voir_eglises",
      "plateforme_moderer_contenu",
      "plateforme_voir_stats",
    ],
  },

  // ════ Niveau paroisse ════

  {
    nom: "admin_eglise",
    scope: "eglise",
    // Contrôle total sur la paroisse
    permissions: [
      "eglise_gerer_membres",
      "eglise_inviter_membres",
      "eglise_voir_membres",
      "eglise_suspendre_membre",
      "eglise_gerer_roles",
      "eglise_gerer_annonces",
      "eglise_creer_annonce",
      "eglise_voir_annonces",
      "eglise_gerer_evenements",
      "eglise_creer_evenement",
      "eglise_voir_evenements",
      "eglise_gerer_finances",
      "eglise_voir_finances",
      "eglise_voir_rapports",
      "eglise_gerer_config",
    ],
  },
  {
    nom: "pasteur",
    scope: "eglise",
    // Contenu + membres + vue finances, pas de config
    permissions: [
      "eglise_voir_membres",
      "eglise_inviter_membres",
      "eglise_gerer_annonces",
      "eglise_creer_annonce",
      "eglise_voir_annonces",
      "eglise_gerer_evenements",
      "eglise_creer_evenement",
      "eglise_voir_evenements",
      "eglise_voir_finances",
      "eglise_voir_rapports",
    ],
  },
  {
    nom: "diacre",
    scope: "eglise",
    // Membres + événements, pas de finances
    permissions: [
      "eglise_voir_membres",
      "eglise_inviter_membres",
      "eglise_gerer_membres",
      "eglise_creer_evenement",
      "eglise_voir_evenements",
      "eglise_voir_annonces",
    ],
  },
  {
    nom: "secretaire",
    scope: "eglise",
    // Membres + annonces, pas de finances ni d'événements
    permissions: [
      "eglise_voir_membres",
      "eglise_inviter_membres",
      "eglise_gerer_membres",
      "eglise_creer_annonce",
      "eglise_voir_annonces",
      "eglise_voir_evenements",
      "eglise_voir_rapports",
    ],
  },
  {
    nom: "tresorier",
    scope: "eglise",
    // Finances uniquement + lecture basique
    permissions: [
      "eglise_voir_membres",
      "eglise_voir_annonces",
      "eglise_voir_evenements",
      "eglise_gerer_finances",
      "eglise_voir_finances",
      "eglise_voir_rapports",
    ],
  },
  {
    nom: "fidele",
    scope: "eglise",
    // Lecture seule
    permissions: [
      "eglise_voir_annonces",
      "eglise_voir_evenements",
      "eglise_voir_membres",
    ],
  },
];

// ─── Super admin initial ──────────────────────────────────────────────────────

const SUPER_ADMIN_CLERK_ID = "user_3CBl2z66hYfxWguiyvxmxBd9rCt";

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Seed RBAC CEEC — démarrage\n");

  // 1. Nettoyage des anciennes données pour éviter les conflits de noms
  console.log("🧹 Nettoyage des anciennes permissions/rôles…");
  await prisma.rolePermission.deleteMany();
  await prisma.userRole.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.role.deleteMany();
  console.log("   ✓ Tables nettoyées");

  // 2. Permissions
  console.log("\n📋 Création des permissions…");
  for (const perm of PERMISSIONS) {
    await prisma.permission.create({ data: perm });
  }
  console.log(`   ✓ ${PERMISSIONS.length} permissions`);

  // 3. Rôles + RolePermissions
  console.log("\n🎭 Création des rôles…");
  for (const roleDef of ROLES) {
    const role = await prisma.role.create({
      data: {
        nom: roleDef.nom,
        scope: roleDef.scope,
        permissions: roleDef.permissions,
      },
    });

    const permRecords = await prisma.permission.findMany({
      where: { nom: { in: roleDef.permissions } },
    });

    for (const perm of permRecords) {
      await prisma.rolePermission.create({
        data: { roleId: role.id, permissionId: perm.id },
      });
    }

    const level = roleDef.scope === "global" ? "🌍 global " : "⛪ eglise";
    console.log(`   ✓ ${roleDef.nom.padEnd(22)} [${level}] → ${roleDef.permissions.length} permissions`);
  }

  // 4. UserRole super_admin (egliseId null → findFirst + create)
  console.log("\n👑 Assignation super_admin…");
  const superAdminRole = await prisma.role.findUnique({ where: { nom: "super_admin" } });
  if (superAdminRole) {
    const existing = await prisma.userRole.findFirst({
      where: { clerkUserId: SUPER_ADMIN_CLERK_ID, roleId: superAdminRole.id, egliseId: null },
    });
    if (!existing) {
      await prisma.userRole.create({
        data: { clerkUserId: SUPER_ADMIN_CLERK_ID, roleId: superAdminRole.id, egliseId: null },
      });
    }
    console.log(`   ✓ ${SUPER_ADMIN_CLERK_ID} → super_admin (global)`);
  }

  // 5. Résumé
  const stats = {
    permissions:     await prisma.permission.count(),
    roles:           await prisma.role.count(),
    rolePermissions: await prisma.rolePermission.count(),
    userRoles:       await prisma.userRole.count(),
  };

  console.log("\n📊 Résumé final :");
  console.log(`   permissions      : ${stats.permissions}`);
  console.log(`   roles            : ${stats.roles}`);
  console.log(`   role_permissions : ${stats.rolePermissions}`);
  console.log(`   user_roles       : ${stats.userRoles}`);
  console.log("\n✅ Seed terminé !\n");
}

main()
  .catch((e) => { console.error("❌ Erreur :", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
