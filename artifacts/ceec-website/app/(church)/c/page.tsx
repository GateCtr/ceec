import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";

async function getChurchData(egliseId: number) {
  try {
    const [annonces, evenements] = await Promise.all([
      prisma.annonce.findMany({
        where: { egliseId, publie: true },
        orderBy: { datePublication: "desc" },
        take: 3,
      }),
      prisma.evenement.findMany({
        where: { egliseId, publie: true, dateDebut: { gte: new Date() } },
        orderBy: { dateDebut: "asc" },
        take: 3,
      }),
    ]);
    return { annonces, evenements };
  } catch {
    return { annonces: [], evenements: [] };
  }
}

export default async function ChurchHomePage() {
  const headersList = await headers();
  const slug = headersList.get("x-eglise-slug");
  if (!slug) redirect("/");

  const eglise = await prisma.eglise.findUnique({
    where: { slug },
  });
  if (!eglise) redirect("/eglise-introuvable");

  const { annonces, evenements } = await getChurchData(eglise.id);

  const prioriteStyle = (p: string) => {
    if (p === "urgente") return { bg: "#fee2e2", color: "#dc2626", label: "Urgent" };
    if (p === "haute") return { bg: "#fef3c7", color: "#d97706", label: "Important" };
    return { bg: "#e0f2fe", color: "#0369a1", label: "Information" };
  };

  return (
    <>
      <section style={{
        background: "linear-gradient(135deg, #1e3a8a 0%, #1e2d6b 60%, #0f172a 100%)",
        color: "white",
        padding: "5rem 1rem",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        }} />
        <div style={{ maxWidth: 700, margin: "0 auto", position: "relative" }}>
          {eglise.logoUrl ? (
            <img
              src={eglise.logoUrl}
              alt={eglise.nom}
              style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover", marginBottom: 20, border: "3px solid #c59b2e" }}
            />
          ) : (
            <div style={{
              width: 80, height: 80, borderRadius: "50%",
              background: "#c59b2e",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 800, fontSize: 32, color: "#1e3a8a",
              margin: "0 auto 20px",
            }}>
              {eglise.nom.charAt(0).toUpperCase()}
            </div>
          )}
          <h1 style={{ fontSize: "2.5rem", fontWeight: 800, marginBottom: 12, lineHeight: 1.2 }}>
            {eglise.nom}
          </h1>
          <p style={{ opacity: 0.85, fontSize: 16, marginBottom: 8 }}>
            {eglise.ville}, République Démocratique du Congo
          </p>
          {eglise.pasteur && (
            <p style={{ opacity: 0.7, fontSize: 14 }}>
              Pasteur : {eglise.pasteur}
            </p>
          )}
          {eglise.description && (
            <p style={{
              marginTop: 20, opacity: 0.85, fontSize: 15, lineHeight: 1.7,
              maxWidth: 560, margin: "20px auto 0",
            }}>
              {eglise.description}
            </p>
          )}
          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 28, flexWrap: "wrap" }}>
            <Link href="/c/inscription" style={{
              padding: "12px 28px", borderRadius: 8, background: "#c59b2e",
              color: "#1e3a8a", fontWeight: 700, fontSize: 15, textDecoration: "none",
            }}>
              Rejoindre l&apos;église
            </Link>
            <Link href="/c/evenements" style={{
              padding: "12px 28px", borderRadius: 8,
              background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)",
              color: "white", fontWeight: 600, fontSize: 15, textDecoration: "none",
            }}>
              Voir les événements
            </Link>
          </div>
        </div>
      </section>

      {annonces.length > 0 && (
        <section style={{ padding: "4rem 1rem", background: "#f8fafc" }}>
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
              <h2 style={{ fontWeight: 800, color: "#1e3a8a", fontSize: "1.75rem", margin: 0 }}>
                Dernières annonces
              </h2>
              <Link href="/c/annonces" style={{
                color: "#1e3a8a", fontWeight: 600, fontSize: 14, textDecoration: "none",
              }}>
                Voir toutes →
              </Link>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {annonces.map((annonce) => {
                const style = prioriteStyle(annonce.priorite);
                return (
                  <div key={annonce.id} style={{
                    background: "white", borderRadius: 12, padding: "1.5rem",
                    border: "1px solid #e2e8f0", boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
                      <span style={{
                        display: "inline-block", fontSize: 12, fontWeight: 700,
                        padding: "3px 10px", borderRadius: 100,
                        background: style.bg, color: style.color,
                      }}>
                        {style.label}
                      </span>
                      <span style={{ color: "#94a3b8", fontSize: 13 }}>
                        {new Date(annonce.datePublication).toLocaleDateString("fr-FR", {
                          day: "numeric", month: "long", year: "numeric",
                        })}
                      </span>
                    </div>
                    <h3 style={{ fontWeight: 700, color: "#0f172a", marginBottom: 8, fontSize: 17, margin: "0 0 8px" }}>
                      {annonce.titre}
                    </h3>
                    <p style={{ color: "#475569", fontSize: 14, lineHeight: 1.7, margin: 0 }}>
                      {annonce.contenu.length > 200 ? annonce.contenu.slice(0, 200) + "…" : annonce.contenu}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {evenements.length > 0 && (
        <section style={{ padding: "4rem 1rem", background: annonces.length > 0 ? "white" : "#f8fafc" }}>
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
              <h2 style={{ fontWeight: 800, color: "#1e3a8a", fontSize: "1.75rem", margin: 0 }}>
                Prochains événements
              </h2>
              <Link href="/c/evenements" style={{
                color: "#1e3a8a", fontWeight: 600, fontSize: 14, textDecoration: "none",
              }}>
                Voir tous →
              </Link>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {evenements.map((evt) => (
                <div key={evt.id} style={{
                  background: "white", borderRadius: 12, overflow: "hidden",
                  border: "1px solid #e2e8f0", boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                  display: "flex",
                }}>
                  <div style={{
                    width: 90, flexShrink: 0,
                    background: "linear-gradient(135deg, #1e3a8a, #1e2d6b)",
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    color: "white", padding: "1rem",
                  }}>
                    <div style={{ fontSize: 28, fontWeight: 800 }}>
                      {new Date(evt.dateDebut).getDate()}
                    </div>
                    <div style={{ fontSize: 12, opacity: 0.85 }}>
                      {new Date(evt.dateDebut).toLocaleString("fr-FR", { month: "short" }).toUpperCase()}
                    </div>
                    <div style={{ fontSize: 11, opacity: 0.7, marginTop: 2 }}>
                      {new Date(evt.dateDebut).getFullYear()}
                    </div>
                  </div>
                  <div style={{ padding: "1.25rem", flex: 1 }}>
                    <h3 style={{ fontWeight: 700, color: "#0f172a", marginBottom: 6, fontSize: 16, margin: "0 0 6px" }}>
                      {evt.titre}
                    </h3>
                    {evt.lieu && (
                      <p style={{ color: "#64748b", fontSize: 13, margin: "0 0 6px" }}>
                        📍 {evt.lieu}
                      </p>
                    )}
                    {evt.description && (
                      <p style={{ color: "#475569", fontSize: 13, lineHeight: 1.6, margin: 0 }}>
                        {evt.description.length > 150 ? evt.description.slice(0, 150) + "…" : evt.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {annonces.length === 0 && evenements.length === 0 && (
        <section style={{ padding: "5rem 1rem", background: "#f8fafc", textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⛪</div>
          <h2 style={{ color: "#1e3a8a", fontWeight: 700, marginBottom: 12 }}>
            Bienvenue à {eglise.nom}
          </h2>
          <p style={{ color: "#64748b", fontSize: 16, maxWidth: 500, margin: "0 auto 24px" }}>
            Cette église vient de rejoindre la CEEC. Les annonces et événements seront publiés prochainement.
          </p>
          <Link href="/c/inscription" style={{
            padding: "12px 28px", borderRadius: 8, background: "#1e3a8a",
            color: "white", fontWeight: 700, fontSize: 15, textDecoration: "none",
          }}>
            Rejoindre la communauté
          </Link>
        </section>
      )}

      {eglise.telephone || eglise.email || eglise.adresse ? (
        <section style={{ padding: "3rem 1rem", background: "#1e3a8a", color: "white" }}>
          <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
            <h2 style={{ fontWeight: 700, fontSize: "1.5rem", marginBottom: 20 }}>Nous contacter</h2>
            <div style={{ display: "flex", gap: 24, justifyContent: "center", flexWrap: "wrap", fontSize: 15 }}>
              {eglise.adresse && <span>📍 {eglise.adresse}</span>}
              {eglise.telephone && <span>📞 {eglise.telephone}</span>}
              {eglise.email && <span>✉️ {eglise.email}</span>}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
