import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function normalizeConnectionString(url: string): string {
  try {
    const parsed = new URL(url);
    const ssl = parsed.searchParams.get("sslmode");
    if (ssl && ssl !== "disable" && ssl !== "verify-full") {
      parsed.searchParams.set("sslmode", "verify-full");
    }
    return parsed.toString();
  } catch {
    return url;
  }
}

function createPrismaClient() {
  const connectionString = normalizeConnectionString(process.env.DATABASE_URL!);
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
