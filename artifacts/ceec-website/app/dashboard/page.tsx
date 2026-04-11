import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { isSuperAdmin, getUserRoles, ROLES } from "@/lib/auth/rbac";

export const metadata = { title: "Mon espace | CEEC" };

async function getPageData(userId: string) {
  try {
    const [memberData, superAdmin, userRoles] = await Promise.all([
      prisma.membre.findFirst({ where: { clerkUserId: userId }, include: { eglise: true } }),
      isSuperAdmin(userId),
      getUserRoles(userId),
    ]);

    const CHURCH_STAFF = new Set<string>([
      ROLES.ADMIN_EGLISE, ROLES.PASTEUR, ROLES.DIACRE,
      ROLES.SECRETAIRE, ROLES.TRESORIER,
    ]);
    const churchAdminRoles = userRoles.filter(
      (ur) => ur.eglise?.slug && CHURCH_STAFF.has(ur.role.nom)
    );

    return { memberData, superAdmin, churchAdminRoles };
  } catch {
    return { memberData: null, superAdmin: false, churchAdminRoles: [] };
  }
}

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await currentUser();
  const { memberData, superAdmin, churchAdminRoles } = await getPageData(userId);

  const roleLabel = superAdmin
    ? "Super Administrateur CEEC"
    : churchAdminRoles.length > 0
    ? churchAdminRoles[0].role.nom === ROLES.ADMIN_EGLISE ? "Administrateur d'église"
      : churchAdminRoles[0].role.nom === ROLES.PASTEUR ? "Pasteur"
      : churchAdminRoles[0].role.nom === ROLES.DIACRE ? "Diacre"
      : churchAdminRoles[0].role.nom === ROLES.SECRETAIRE ? "Secrétaire"
      : churchAdminRoles[0].role.nom === ROLES.TRESORIER ? "Trésorier"
      : "Personnel d'église"
    : memberData?.role === "admin"
    ? "Administrateur"
    : "Fidèle";

  return (
    <>
      <Navbar />
      <main style={{ minHeight: "100vh", background: "#f8fafc" }}>

        {/* En-tête */}
        <div style={{ background: "linear-gradient(135deg, #1e3a8a, #1e2d6b)", color: "white", padding: "3rem 1rem 2rem" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <p style={{ fontSize: 13, opacity: 0.6, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>
              Mon espace
            </p>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 800, marginBottom: 6 }}>
              Bienvenue, {user?.firstName || "Fidèle"} !
            </h1>
            <span style={{
              display: "inline-block",
              background: "rgba(197,155,46,0.25)",
              color: "#c59b2e",
              fontSize: 12,
              fontWeight: 700,
              padding: "4px 12px",
              borderRadius: 99,
              border: "1px solid rgba(197,155,46,0.4)",
            }}>
              {roleLabel}
            </span>
          </div>
        </div>

        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem 1rem" }}>

          {/* Raccourcis admin selon le rôle */}
          {(superAdmin || churchAdminRoles.length > 0) && (
            <div style={{ marginBottom: 24, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>

              {superAdmin && (
                <Link href="/admin" style={{ textDecoration: "none" }}>
                  <div style={{
                    background: "linear-gradient(135deg, #1e3a8a 0%, #1e2d6b 100%)",
                    borderRadius: 14,
                    padding: "1.5rem",
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    boxShadow: "0 4px 20px rgba(30,58,138,0.25)",
                    transition: "transform 0.15s",
                  }}>
                    <div style={{ fontSize: 32, flexShrink: 0 }}>🛡</div>
                    <div>
                      <div style={{ color: "#c59b2e", fontWeight: 800, fontSize: 15, marginBottom: 4 }}>
                        Administration CEEC
                      </div>
                      <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}>
                        Gérer toutes les paroisses, membres et contenus de la plateforme
                      </div>
                    </div>
                  </div>
                </Link>
              )}

              {churchAdminRoles.map((ur) => (
                <Link
                  key={ur.id}
                  href={`/gestion?eglise=${ur.eglise!.slug}`}
                  style={{ textDecoration: "none" }}
                >
                  <div style={{
                    background: "white",
                    borderRadius: 14,
                    padding: "1.5rem",
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    border: "2px solid #c59b2e",
                    boxShadow: "0 4px 20px rgba(197,155,46,0.12)",
                  }}>
                    <div style={{
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #1e3a8a, #1e2d6b)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontWeight: 800,
                      fontSize: 18,
                      flexShrink: 0,
                    }}>
                      {ur.eglise!.nom.charAt(0)}
                    </div>
                    <div>
                      <div style={{ color: "#1e3a8a", fontWeight: 800, fontSize: 15, marginBottom: 2 }}>
                        Gérer {ur.eglise!.nom}
                      </div>
                      <div style={{ color: "#64748b", fontSize: 13 }}>
                        {ur.eglise!.ville} · {ur.role.nom}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 24 }}>

            {/* Colonne gauche — Profil */}
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
                      <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase" }}>Rôle</div>
                      <div style={{ color: "#334155", fontWeight: 600, marginTop: 2 }}>{roleLabel}</div>
                    </div>
                    {memberData.eglise && (
                      <div style={{ background: "#f8fafc", borderRadius: 8, padding: "10px 14px" }}>
                        <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase" }}>Église</div>
                        <div style={{ color: "#334155", fontWeight: 600, marginTop: 2 }}>{memberData.eglise.nom}</div>
                      </div>
                    )}
                    <div style={{ background: "#f8fafc", borderRadius: 8, padding: "10px 14px" }}>
                      <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase" }}>Statut</div>
                      <div style={{ color: memberData.statut === "actif" ? "#16a34a" : "#dc2626", fontWeight: 600, marginTop: 2 }}>
                        {memberData.statut === "actif" ? "Actif" : "Inactif"}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ background: "#fef3c7", borderRadius: 10, padding: "1rem", textAlign: "center" }}>
                    <p style={{ color: "#92400e", fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
                      Profil non complété
                    </p>
                    <Link href="/dashboard/profile" style={{ display: "inline-block", padding: "8px 20px", borderRadius: 8, background: "#c59b2e", color: "#1e3a8a", fontWeight: 700, fontSize: 13, textDecoration: "none" }}>
                      Compléter mon profil
                    </Link>
                  </div>
                )}

                <Link href="/dashboard/profile" style={{ display: "block", marginTop: 16, padding: "10px", borderRadius: 8, border: "1px solid #e2e8f0", color: "#1e3a8a", fontWeight: 600, textAlign: "center", fontSize: 14, textDecoration: "none" }}>
                  Modifier mon profil
                </Link>
              </div>

              {memberData?.eglise && (
                <div style={{ background: "linear-gradient(135deg, #1e3a8a, #1e2d6b)", borderRadius: 14, padding: "1.5rem", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                  <h4 style={{ fontWeight: 700, color: "white", marginBottom: 12, fontSize: 15 }}>Mon église</h4>
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
                  <Link href={`/paroisses/${memberData.eglise.id}`} style={{ display: "block", marginTop: 16, padding: "8px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.3)", color: "white", fontWeight: 600, textAlign: "center", fontSize: 13, textDecoration: "none" }}>
                    Voir mon église
                  </Link>
                </div>
              )}
            </div>

            {/* Colonne droite — liens rapides vers les pages de la plateforme */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ background: "white", borderRadius: 14, padding: "1.75rem", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                <h2 style={{ fontWeight: 700, color: "#1e3a8a", fontSize: 18, marginBottom: 16 }}>Accès rapides</h2>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {[
                    { href: "/paroisses",  icon: "⛪", label: "Paroisses",   desc: "Explorer les églises" },
                    { href: "/evenements", icon: "📅", label: "Événements",  desc: "Voir le calendrier" },
                    { href: "/annonces",   icon: "📢", label: "Annonces",    desc: "Dernières nouvelles" },
                    { href: "/contact",    icon: "✉️", label: "Contact",     desc: "Nous contacter" },
                  ].map((item) => (
                    <Link key={item.href} href={item.href} style={{ textDecoration: "none" }}>
                      <div style={{
                        background: "#f8fafc",
                        borderRadius: 10,
                        padding: "1rem",
                        border: "1px solid #e2e8f0",
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        transition: "border-color 0.15s",
                      }}>
                        <span style={{ fontSize: 22 }}>{item.icon}</span>
                        <div>
                          <div style={{ fontWeight: 700, color: "#1e3a8a", fontSize: 14 }}>{item.label}</div>
                          <div style={{ color: "#94a3b8", fontSize: 12 }}>{item.desc}</div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              <div style={{ background: "white", borderRadius: 14, padding: "1.75rem", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <h2 style={{ fontWeight: 700, color: "#1e3a8a", fontSize: 16 }}>Annonces récentes</h2>
                  <Link href="/annonces" style={{ color: "#c59b2e", fontWeight: 600, fontSize: 13, textDecoration: "none" }}>Tout voir</Link>
                </div>
                <p style={{ color: "#94a3b8", fontSize: 13, textAlign: "center", padding: "1rem 0" }}>
                  Connectez-vous à une paroisse pour voir ses annonces.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
