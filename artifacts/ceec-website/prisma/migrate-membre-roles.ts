/**
 * One-time migration: backfill user_roles from membres.role
 * Run: cd artifacts/ceec-website && npx tsx prisma/migrate-membre-roles.ts
 */
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const ROLE_MAP: Record<string, string> = {
  admin_eglise: "admin_eglise",
  pasteur:      "pasteur",
  diacre:       "diacre",
  tresorier:    "tresorier",
  secretaire:   "secretaire",
  fidele:       "fidele",
  moderateur:   "fidele",
  admin:        "admin_eglise",
};

async function main() {
  const connectionString = process.env.DATABASE_URL!;
  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });

  try {
    console.log("Migration membres.role → user_roles…");

    const roles = await prisma.role.findMany({ select: { id: true, nom: true } });
    const roleIdMap = new Map(roles.map((r) => [r.nom, r.id]));
    console.log("Rôles RBAC disponibles:", [...roleIdMap.keys()].join(", "));

    const membres = await (prisma as unknown as {
      membre: {
        findMany: (args: unknown) => Promise<
          Array<{ id: number; clerkUserId: string; egliseId: number | null; role: string }>
        >;
      };
    }).membre.findMany({
      where: { egliseId: { not: null } },
      select: { id: true, clerkUserId: true, egliseId: true, role: true },
    });

    console.log(`${membres.length} membres avec paroisse à migrer`);

    let created = 0;
    let skipped = 0;
    let errors = 0;

    for (const m of membres) {
      const targetRole = ROLE_MAP[m.role] ?? "fidele";
      const roleId = roleIdMap.get(targetRole);
      if (!roleId || !m.egliseId) { skipped++; continue; }

      try {
        await prisma.userRole.upsert({
          where: {
            user_role_unique: { clerkUserId: m.clerkUserId, roleId, egliseId: m.egliseId },
          },
          update: {},
          create: { clerkUserId: m.clerkUserId, roleId, egliseId: m.egliseId },
        });
        created++;
        if (m.role !== targetRole) {
          console.log(`  membre ${m.id}: "${m.role}" → "${targetRole}"`);
        }
      } catch (e) {
        console.error(`  Erreur pour membre ${m.id}:`, e);
        errors++;
      }
    }

    console.log(`Terminé: ${created} user_roles créés/confirmés, ${skipped} ignorés, ${errors} erreurs`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
