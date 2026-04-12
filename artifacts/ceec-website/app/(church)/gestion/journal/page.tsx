import { headers } from "next/headers";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { isSuperAdmin, isEgliseStaff } from "@/lib/auth/rbac";
import GestionJournalClient from "@/components/gestion/GestionJournalClient";

export const metadata = { title: "Journal d'activité | Gestion" };

function getDateFrom(dateRange: string): Date | null {
  const now = new Date();
  if (dateRange === "today") {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }
  if (dateRange === "week") {
    const d = new Date(now);
    d.setDate(d.getDate() - d.getDay());
    d.setHours(0, 0, 0, 0);
    return d;
  }
  if (dateRange === "month") {
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }
  if (dateRange === "30d") {
    const d = new Date(now);
    d.setDate(d.getDate() - 30);
    d.setHours(0, 0, 0, 0);
    return d;
  }
  return null;
}

async function getChurchLogs(egliseId: number, actionFilter?: string, dateFilter?: string) {
  try {
    const where: {
      egliseId: number;
      action?: string;
      createdAt?: { gte: Date };
    } = { egliseId };

    if (actionFilter) where.action = actionFilter;
    const dateFrom = getDateFrom(dateFilter ?? "");
    if (dateFrom) where.createdAt = { gte: dateFrom };

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
  searchParams: Promise<{ action?: string; date?: string }>;
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
  const logs = await getChurchLogs(egliseId, sp.action, sp.date);

  return (
    <div style={{ padding: "2rem", maxWidth: 900 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>
          Journal d&apos;activité
        </h1>
        <p style={{ color: "#64748b", marginTop: 4, fontSize: 14 }}>
          50 dernières actions — filtrez par type d&apos;action et période
        </p>
      </div>
      <GestionJournalClient
        logs={logs}
        selectedAction={sp.action ?? ""}
        selectedDate={sp.date ?? ""}
      />
    </div>
  );
}
