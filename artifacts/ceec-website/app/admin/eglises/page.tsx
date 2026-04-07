import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { isSuperAdmin } from "@/lib/auth/rbac";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdminEglisesClient from "@/components/admin/AdminEglisesClient";

export const metadata = { title: "Gestion des Églises | CEEC Admin" };

export default async function AdminEglisesPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  if (!await isSuperAdmin(userId)) redirect("/dashboard?error=acces-refuse");

  const eglises = await prisma.eglise.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { membres: true } },
      inviteTokens: {
        where: { usedAt: null, expiresAt: { gt: new Date() } },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  const eglisesData = eglises.map((e) => ({
    id: e.id,
    nom: e.nom,
    slug: e.slug,
    ville: e.ville,
    statut: e.statut,
    createdAt: e.createdAt.toISOString(),
    membresCount: e._count.membres,
    hasInvitePending: e.inviteTokens.length > 0,
  }));

  return (
    <>
      <Navbar />
      <main style={{ minHeight: "100vh", background: "#f8fafc" }}>
        <div style={{ background: "linear-gradient(135deg, #1e3a8a, #1e2d6b)", color: "white", padding: "2.5rem 1rem" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
              <div>
                <Link href="/admin" style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                  ← Administration
                </Link>
                <h1 style={{ fontSize: "1.8rem", fontWeight: 800, margin: 0 }}>Gestion des Églises</h1>
                <p style={{ opacity: 0.8, marginTop: 4, margin: "4px 0 0" }}>{eglises.length} église{eglises.length !== 1 ? "s" : ""} enregistrée{eglises.length !== 1 ? "s" : ""}</p>
              </div>
              <Link href="/admin/eglises/nouveau" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#c59b2e", color: "white", padding: "12px 24px", borderRadius: 10, fontWeight: 700, textDecoration: "none", fontSize: 15 }}>
                + Ajouter une église
              </Link>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem 1rem" }}>
          <AdminEglisesClient initialEglises={eglisesData} />
        </div>
      </main>
      <Footer />
    </>
  );
}
