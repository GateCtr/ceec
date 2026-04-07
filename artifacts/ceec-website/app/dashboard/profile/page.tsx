import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProfileForm from "@/components/ProfileForm";
import { prisma } from "@/lib/db";

async function getMemberAndEglises(clerkUserId: string) {
  try {
    const [member, eglisesList] = await Promise.all([
      prisma.membre.findFirst({ where: { clerkUserId } }),
      prisma.eglise.findMany({ where: { statut: "actif" }, orderBy: { nom: "asc" } }),
    ]);
    return { member, eglisesList };
  } catch {
    return { member: null, eglisesList: [] };
  }
}

export const metadata = {
  title: "Mon profil | CEEC",
};

export default async function ProfilePage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await currentUser();
  const { member, eglisesList } = await getMemberAndEglises(userId);

  return (
    <>
      <Navbar />
      <main style={{ minHeight: "100vh", background: "#f8fafc" }}>
        <div style={{ background: "linear-gradient(135deg, #1e3a8a, #1e2d6b)", color: "white", padding: "2.5rem 1rem" }}>
          <div style={{ maxWidth: 700, margin: "0 auto" }}>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 700 }}>Mon profil</h1>
            <p style={{ opacity: 0.8, marginTop: 4 }}>Gerez vos informations personnelles</p>
          </div>
        </div>
        <div style={{ maxWidth: 700, margin: "0 auto", padding: "2rem 1rem" }}>
          <ProfileForm
            clerkUserId={userId}
            userEmail={user?.emailAddresses?.[0]?.emailAddress || ""}
            existingMember={member}
            paroissesList={eglisesList}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
