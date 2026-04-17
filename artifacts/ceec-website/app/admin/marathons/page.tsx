import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { isAdminPlatteforme, isSuperAdmin } from "@/lib/auth/rbac";
import AdminMarathonsClient from "@/components/admin/AdminMarathonsClient";
import { Trophy } from "lucide-react";

export const metadata = { title: "Marathons | CEEC Admin" };

export default async function AdminMarathonsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  if (!(await isSuperAdmin(userId)) && !(await isAdminPlatteforme(userId))) redirect("/admin");

  const [marathons, eglises] = await Promise.all([
    prisma.marathon.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        eglise: { select: { id: true, nom: true, slug: true, ville: true } },
        _count: { select: { participants: true } },
      },
    }),
    prisma.eglise.findMany({ orderBy: { nom: "asc" }, select: { id: true, nom: true, slug: true, ville: true } }),
  ]);

  return (
    <div style={{ padding: "2rem", maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "2rem" }}>
        <div style={{ width: 44, height: 44, borderRadius: 10, background: "#1e3a8a", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Trophy size={22} color="white" />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 800, color: "#0f172a" }}>Marathons de prière</h1>
          <p style={{ margin: 0, color: "#64748b", fontSize: 14, marginTop: 2 }}>
            Vue globale — {marathons.length} marathon{marathons.length !== 1 ? "s" : ""} sur {eglises.length} église{eglises.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <AdminMarathonsClient
        initialMarathons={marathons.map((m) => ({ ...m, dateDebut: m.dateDebut.toISOString() }))}
        eglises={eglises}
      />
    </div>
  );
}
