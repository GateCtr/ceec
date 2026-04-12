import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { isSuperAdmin } from "@/lib/auth/rbac";
import AdminLogsClient from "@/components/admin/AdminLogsClient";
import { getDateFrom } from "@/lib/date-filter";

export const metadata = { title: "Journal d'activité | Administration CEEC" };

async function getLogs(egliseFilter?: string, actionFilter?: string, dateFilter?: string) {
  try {
    const where: {
      egliseId?: number;
      action?: string;
      createdAt?: { gte: Date };
    } = {};

    if (egliseFilter) {
      const eglise = await prisma.eglise.findUnique({ where: { slug: egliseFilter }, select: { id: true } });
      where.egliseId = eglise?.id ?? -1;
    }
    if (actionFilter) {
      where.action = actionFilter;
    }
    const dateFrom = getDateFrom(dateFilter ?? "");
    if (dateFrom) {
      where.createdAt = { gte: dateFrom };
    }

    const [logs, eglises] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      prisma.eglise.findMany({
        orderBy: { nom: "asc" },
        select: { id: true, nom: true, slug: true },
      }),
    ]);

    return {
      logs: logs.map((l) => ({
        id: l.id,
        acteurNom: l.acteurNom,
        action: l.action,
        entiteType: l.entiteType,
        entiteId: l.entiteId,
        entiteLabel: l.entiteLabel,
        egliseNom: l.egliseNom,
        createdAt: l.createdAt.toISOString(),
      })),
      eglises: eglises.map((e) => ({ id: e.id, nom: e.nom, slug: e.slug ?? "" })),
    };
  } catch {
    return { logs: [], eglises: [] };
  }
}

export default async function AdminLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ eglise?: string; action?: string; date?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  if (!await isSuperAdmin(userId)) redirect("/sign-in");

  const sp = await searchParams;
  const { logs, eglises } = await getLogs(sp.eglise, sp.action, sp.date);

  return (
    <div style={{ padding: "2rem", maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>
          Journal d&apos;activité global
        </h1>
        <p style={{ color: "#64748b", marginTop: 4, fontSize: 14 }}>
          50 dernières actions — filtrez par église, type d&apos;action et période
        </p>
      </div>
      <AdminLogsClient
        logs={logs}
        eglises={eglises}
        selectedEglise={sp.eglise ?? ""}
        selectedAction={sp.action ?? ""}
        selectedDate={sp.date ?? ""}
      />
    </div>
  );
}
