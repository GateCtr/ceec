import { headers } from "next/headers";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/index";
import { isSuperAdmin, isEgliseStaff } from "@/lib/auth/rbac";
import ContactMessagesClient from "@/components/gestion/ContactMessagesClient";

export const metadata = { title: "Messages de contact | Gestion" };

export default async function GestionContactPage() {
  const headersList = await headers();
  const egliseIdHeader = headersList.get("x-eglise-id");
  if (!egliseIdHeader) redirect("/c");
  const egliseId = parseInt(egliseIdHeader, 10);

  const { userId } = await auth();
  if (!userId) redirect("/c/connexion");

  const superAdmin = await isSuperAdmin(userId);
  const allowed = superAdmin || await isEgliseStaff(userId, egliseId);
  if (!allowed) redirect("/gestion?error=acces-refuse");

  const config = await prisma.egliseConfig.findUnique({
    where: { egliseId },
    select: { id: true },
  });

  const result = config
    ? await Promise.all([
        prisma.messageContact.findMany({
          where: { configId: config.id },
          orderBy: { createdAt: "desc" },
          take: 20,
        }),
        prisma.messageContact.count({ where: { configId: config.id } }),
        prisma.messageContact.count({ where: { configId: config.id, lu: false } }),
      ])
    : [[], 0, 0] as const;

  const [messages, total, nonLus] = result;
  const pages = Math.ceil((total as number) / 20) || 1;

  return (
    <div style={{ padding: "2rem" }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>
            Messages de contact
          </h1>
          {(nonLus as number) > 0 && (
            <span style={{ background: "#1e3a8a", color: "white", borderRadius: 12, padding: "3px 10px", fontSize: 13, fontWeight: 700 }}>
              {nonLus as number} non lu{(nonLus as number) !== 1 ? "s" : ""}
            </span>
          )}
        </div>
        <p style={{ color: "#64748b", marginTop: 4, fontSize: 14 }}>
          Messages reçus via le formulaire de contact de votre site
        </p>
      </div>

      <ContactMessagesClient
        initialMessages={(messages as { id: number; nom: string; email: string; telephone: string | null; sujet: string | null; message: string; lu: boolean; createdAt: Date }[]).map((m) => ({
          ...m,
          createdAt: m.createdAt.toISOString(),
        }))}
        initialTotal={total as number}
        initialPages={pages}
        initialNonLus={nonLus as number}
      />
    </div>
  );
}
