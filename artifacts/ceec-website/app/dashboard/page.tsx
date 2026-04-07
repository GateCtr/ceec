import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { prisma } from "@/lib/db";
import Link from "next/link";

async function getMemberData(clerkUserId: string) {
  try {
    return await prisma.membre.findFirst({
      where: { clerkUserId },
      include: { eglise: true },
    });
  } catch {
    return null;
  }
}

async function getAnnonces() {
  try {
    return await prisma.annonce.findMany({
      where: { publie: true },
      orderBy: { datePublication: "desc" },
      take: 5,
    });
  } catch {
    return [];
  }
}

async function getEvenements() {
  try {
    return await prisma.evenement.findMany({
      where: { publie: true },
      orderBy: { dateDebut: "asc" },
      take: 4,
    });
  } catch {
    return [];
  }
}

export const metadata = {
  title: "Mon espace | CEEC",
};

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await currentUser();
  const [memberData, annoncesList, evenementsList] = await Promise.all([
    getMemberData(userId),
    getAnnonces(),
    getEvenements(),
  ]);

  return (
    <>
      <Navbar />
      <main style={{ minHeight: "100vh", background: "#f8fafc" }}>
        <div style={{ background: "linear-gradient(135deg, #1e3a8a, #1e2d6b)", color: "white", padding: "2.5rem 1rem" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: 4 }}>
              Bienvenue, {user?.firstName || "Fidele"} !
            </h1>
            <p style={{ opacity: 0.8 }}>
              {memberData?.eglise ? `Eglise : ${memberData.eglise.nom}` : "Votre espace personnel CEEC"}
            </p>
          </div>
        </div>

        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem 1rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 24, flexWrap: "wrap" as const }}>
            <div>
              <div style={{ background: "white", borderRadius: 14, padding: "1.75rem", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", marginBottom: 20 }}>
                <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#1e3a8a", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: 24, margin: "0 auto 16px" }}>
                  {user?.firstName?.charAt(0) || "?"}
                </div>
                <h3 style={{ fontWeight: 700, color: "#0f172a", textAlign: "center", marginBottom: 4 }}>
                  {user?.firstName} {user?.lastName}
                </h3>
                <p style={{ color: "#64748b", fontSize: 13, textAlign: "center", marginBottom: 16 }}>
                  {user?.emailAddresses?.[0]?.emailAddress}
                </p>
                {memberData ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ background: "#f8fafc", borderRadius: 8, padding: "10px 14px" }}>
                      <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase" as const }}>Role</div>
                      <div style={{ color: "#334155", fontWeight: 600, marginTop: 2 }}>
                        {memberData.role === "admin" ? "Administrateur" : "Fidele"}
                      </div>
                    </div>
                    {memberData.eglise && (
                      <div style={{ background: "#f8fafc", borderRadius: 8, padding: "10px 14px" }}>
                        <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase" as const }}>Eglise</div>
                        <div style={{ color: "#334155", fontWeight: 600, marginTop: 2 }}>{memberData.eglise.nom}</div>
                      </div>
                    )}
                    <div style={{ background: "#f8fafc", borderRadius: 8, padding: "10px 14px" }}>
                      <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase" as const }}>Statut</div>
                      <div style={{ color: memberData.statut === "actif" ? "#16a34a" : "#dc2626", fontWeight: 600, marginTop: 2 }}>
                        {memberData.statut === "actif" ? "Actif" : "Inactif"}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ background: "#fef3c7", borderRadius: 10, padding: "1rem", textAlign: "center" }}>
                    <p style={{ color: "#92400e", fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
                      Profil non complete
                    </p>
                    <Link href="/dashboard/profile" style={{ display: "inline-block", padding: "8px 20px", borderRadius: 8, background: "#c59b2e", color: "#1e3a8a", fontWeight: 700, fontSize: 13 }}>
                      Completer mon profil
                    </Link>
                  </div>
                )}
                <Link href="/dashboard/profile" style={{ display: "block", marginTop: 16, padding: "10px", borderRadius: 8, border: "1px solid #e2e8f0", color: "#1e3a8a", fontWeight: 600, textAlign: "center", fontSize: 14 }}>
                  Modifier mon profil
                </Link>
              </div>

              {memberData?.eglise && (
                <div style={{ background: "linear-gradient(135deg, #1e3a8a, #1e2d6b)", borderRadius: 14, padding: "1.5rem", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                  <h4 style={{ fontWeight: 700, color: "white", marginBottom: 12, fontSize: 15 }}>Mon eglise</h4>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#c59b2e", display: "flex", alignItems: "center", justifyContent: "center", color: "#1e3a8a", fontWeight: 800, fontSize: 18, marginBottom: 10 }}>
                    {memberData.eglise.nom.charAt(0)}
                  </div>
                  <p style={{ color: "white", fontWeight: 600, marginBottom: 4 }}>{memberData.eglise.nom}</p>
                  <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}>{memberData.eglise.ville}</p>
                  {memberData.eglise.pasteur && (
                    <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, marginTop: 4 }}>
                      Pasteur : {memberData.eglise.pasteur}
                    </p>
                  )}
                  <Link href={`/paroisses/${memberData.eglise.id}`} style={{ display: "block", marginTop: 16, padding: "8px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.3)", color: "white", fontWeight: 600, textAlign: "center", fontSize: 13 }}>
                    Voir mon eglise
                  </Link>
                </div>
              )}
            </div>

            <div>
              <div style={{ background: "white", borderRadius: 14, padding: "1.75rem", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", marginBottom: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <h2 style={{ fontWeight: 700, color: "#1e3a8a", fontSize: 18 }}>Dernieres annonces</h2>
                  <Link href="/annonces" style={{ color: "#c59b2e", fontWeight: 600, fontSize: 13 }}>Tout voir</Link>
                </div>
                {annoncesList.length === 0 ? (
                  <p style={{ color: "#64748b", textAlign: "center", padding: "1rem" }}>Aucune annonce pour le moment.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {annoncesList.map(annonce => (
                      <div key={annonce.id} style={{ padding: "1rem", borderRadius: 10, border: "1px solid #f1f5f9", background: "#fafafa" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6, flexWrap: "wrap" as const, gap: 4 }}>
                          <h4 style={{ fontWeight: 600, color: "#0f172a", fontSize: 15 }}>{annonce.titre}</h4>
                          <span style={{ fontSize: 12, color: "#94a3b8", flexShrink: 0 }}>
                            {new Date(annonce.datePublication).toLocaleDateString("fr-FR")}
                          </span>
                        </div>
                        <p style={{ color: "#64748b", fontSize: 13, lineHeight: 1.6 }}>
                          {annonce.contenu.substring(0, 150)}{annonce.contenu.length > 150 ? "..." : ""}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ background: "white", borderRadius: 14, padding: "1.75rem", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <h2 style={{ fontWeight: 700, color: "#1e3a8a", fontSize: 18 }}>Prochains evenements</h2>
                  <Link href="/evenements" style={{ color: "#c59b2e", fontWeight: 600, fontSize: 13 }}>Tout voir</Link>
                </div>
                {evenementsList.length === 0 ? (
                  <p style={{ color: "#64748b", textAlign: "center", padding: "1rem" }}>Aucun evenement planifie.</p>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
                    {evenementsList.map(evt => (
                      <div key={evt.id} style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #e2e8f0" }}>
                        <div style={{ background: "linear-gradient(135deg, #1e3a8a, #1e2d6b)", padding: "1rem", color: "white", textAlign: "center" }}>
                          <div style={{ fontSize: 28, fontWeight: 800 }}>{new Date(evt.dateDebut).getDate()}</div>
                          <div style={{ fontSize: 13, opacity: 0.8 }}>
                            {new Date(evt.dateDebut).toLocaleString("fr-FR", { month: "long", year: "numeric" })}
                          </div>
                        </div>
                        <div style={{ padding: "1rem" }}>
                          <h4 style={{ fontWeight: 600, color: "#0f172a", fontSize: 14, marginBottom: 4 }}>{evt.titre}</h4>
                          {evt.lieu && <p style={{ color: "#64748b", fontSize: 12 }}>&#128205; {evt.lieu}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
