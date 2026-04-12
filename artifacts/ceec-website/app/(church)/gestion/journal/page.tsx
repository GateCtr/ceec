import { headers } from "next/headers";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { isSuperAdmin, isEgliseStaff } from "@/lib/auth/rbac";
import GestionJournalClient from "@/components/gestion/GestionJournalClient";

export const metadata = { title: "Journal d'activité | Gestion" };

async function getChurchLogs(egliseId: number, actionFilter?: string) {
  try {
    const where: { egliseId: number; action?: string } = { egliseId };
    if (actionFilter) where.action = actionFilter;

    const logs = await prisma.activityLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return logs.map((l) => ({
      id: l.id,
      acteurNom: l.acteurNom,
      action: l.action,
      entiteType: l.entiteType,
      entiteId: l.entiteId,
      entiteLabel: l.entiteLabel,
      createdAt: l.createdAt.toISOString(),
    }));
  } catch {
    return [];
  }
}

export default async function GestionJournalPage({
  searchParams,
}: {
  searchParams: Promise<{ action?: string }>;
}) {
  const headersList = await headers();
  const egliseIdHeader = headersList.get("x-eglise-id");
  if (!egliseIdHeader) redirect("/c");
  const egliseId = parseInt(egliseIdHeader, 10);

  const { userId } = await auth();
  if (!userId) redirect("/c/connexion");

  const superAdmin = await isSuperAdmin(userId);
  const staff = superAdmin || await isEgliseStaff(userId, egliseId);
  if (!staff) redirect("/c?error=acces-refuse");

  const sp = await searchParams;
  const logs = await getChurchLogs(egliseId, sp.action);

  return (
    <div style={{ padding: "2rem", maxWidth: 900 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>
          Journal d&apos;activité
        </h1>
        <p style={{ color: "#64748b", marginTop: 4, fontSize: 14 }}>
          50 dernières actions enregistrées dans cet espace de gestion
        </p>
      </div>
      <GestionJournalClient logs={logs} selectedAction={sp.action ?? ""} />
    </div>
  );
}
