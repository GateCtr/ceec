import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { isSuperAdmin, hasAnyAdminRole } from "@/lib/auth/rbac";
import AdminAnnoncesClient from "@/components/admin/AdminAnnoncesClient";

async function isAdminUser(userId: string): Promise<boolean> {
  if (await isSuperAdmin(userId)) return true;
  return hasAnyAdminRole(userId);
}

export const metadata = { title: "Gestion des Annonces | CEEC Admin" };

export default async function AdminAnnoncesPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  if (!await isAdminUser(userId)) redirect("/dashboard");

  const [annoncesList, eglisesList] = await Promise.all([
    prisma.annonce.findMany({ orderBy: { datePublication: "desc" } }),
    prisma.eglise.findMany({ orderBy: { nom: "asc" } }),
  ]);

  return (
    <>
      <Navbar />
      <main style={{ minHeight: "100vh", background: "#f8fafc" }}>
        <div style={{ background: "linear-gradient(135deg, #1e3a8a, #1e2d6b)", color: "white", padding: "2.5rem 1rem" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <Link href="/admin" style={{ color: "rgba(255,255,255,0.7)", fontSize: 14, marginBottom: 12, display: "inline-block" }}>
              ← Tableau de bord admin
            </Link>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 800 }}>Gestion des Annonces</h1>
          </div>
        </div>
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "2rem 1rem" }}>
          <AdminAnnoncesClient initialAnnonces={annoncesList} paroissesList={eglisesList} />
        </div>
      </main>
      <Footer />
    </>
  );
}
