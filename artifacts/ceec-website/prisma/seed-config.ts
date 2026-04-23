import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

function createPrisma() {
  const connectionString = process.env.DATABASE_URL!;
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

const prisma = createPrisma();

const COMMUNAUTE_CONFIG = [
  {
    cle: "nb_eglises",
    valeur: "50+",
    label: "Paroisses",
    icone: "⛪",
  },
  {
    cle: "nb_provinces",
    valeur: "5+",
    label: "Provinces couvertes",
    icone: "📍",
  },
  {
    cle: "nb_fideles",
    valeur: "2 000+",
    label: "Fidèles",
    icone: "👥",
  },
  {
    cle: "annee_fondation",
    valeur: "2009",
    label: "Année de fondation",
    icone: "📅",
  },
];

async function main() {
  console.log("🌱 Seed communauteConfig — démarrage\n");

  for (const entry of COMMUNAUTE_CONFIG) {
    await prisma.communauteConfig.upsert({
      where: { cle: entry.cle },
      update: { valeur: entry.valeur, label: entry.label, icone: entry.icone },
      create: entry,
    });
    console.log(`   ✓ ${entry.cle.padEnd(20)} → "${entry.valeur}" (${entry.label})`);
  }

  console.log("\n✅ communauteConfig mis à jour !\n");
}

main()
  .catch((e) => { console.error("❌ Erreur :", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
