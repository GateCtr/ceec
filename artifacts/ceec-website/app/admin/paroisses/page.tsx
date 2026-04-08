import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { isSuperAdmin, hasAnyAdminRole } from "@/lib/auth/rbac";
import AdminParoissesClient from "@/components/admin/AdminParoissesClient";

async function isAdminUser(userId: string): Promise<boolean> {
  if (await isSuperAdmin(userId)) return true;
  return hasAnyAdminRole(userId);
}

export const metadata = { title: "Paroisses | CEEC Admin" };

export default async function AdminParoissesPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  if (!await isAdminUser(userId)) redirect("/dashboard");

  const eglisesList = await prisma.eglise.findMany({ orderBy: { nom: "asc" } });

  return (
    <div style={{ padding: "2rem", maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>
          Paroisses
        </h1>
        <p style={{ color: "#64748b", marginTop: 4, fontSize: 14 }}>
          {eglisesList.length} paroisse{eglisesList.length !== 1 ? "s" : ""} enregistrée{eglisesList.length !== 1 ? "s" : ""}
        </p>
      </div>
      <AdminParoissesClient initialParoisses={eglisesList} />
    </div>
  );
}
