import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const PERMISSIONS = [
  { nom: "platform:manage", description: "Gerer la plateforme entiere (super admin)" },
  { nom: "eglise:manage", description: "Gerer les parametres d'une eglise" },
  { nom: "eglise:suspend", description: "Suspendre une eglise" },
  { nom: "membres:manage", description: "Gerer les membres d'une eglise" },
  { nom: "contenus:manage", description: "Gerer les annonces et evenements" },
  { nom: "admins:manage", description: "Gerer les administrateurs d'une eglise" },
];

const ROLES_DATA: Record<string, { scope: string; permissions: string[] }> = {
  super_admin: {
    scope: "platform",
    permissions: ["platform:manage", "eglise:manage", "eglise:suspend", "membres:manage", "contenus:manage", "admins:manage"],
  },
  admin_eglise: {
    scope: "church",
    permissions: ["eglise:manage", "membres:manage", "contenus:manage", "admins:manage"],
  },
  moderateur: {
    scope: "church",
    permissions: ["contenus:manage"],
  },
  fidele: {
    scope: "church",
    permissions: [],
  },
};

async function main() {
  for (const perm of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { nom: perm.nom },
      update: { description: perm.description },
      create: perm,
    });
    console.log(`Permission upserted: ${perm.nom}`);
  }

  for (const [nom, data] of Object.entries(ROLES_DATA)) {
    const role = await prisma.role.upsert({
      where: { nom },
      update: { permissions: data.permissions, scope: data.scope },
      create: { nom, scope: data.scope, permissions: data.permissions },
    });

    for (const permNom of data.permissions) {
      const perm = await prisma.permission.findUnique({ where: { nom: permNom } });
      if (perm) {
        await prisma.rolePermission.upsert({
          where: { roleId_permissionId: { roleId: role.id, permissionId: perm.id } },
          update: {},
          create: { roleId: role.id, permissionId: perm.id },
        });
      }
    }
    console.log(`Role upserted: ${nom} (${data.permissions.length} permissions)`);
  }

  console.log("Seed termine avec succes.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
