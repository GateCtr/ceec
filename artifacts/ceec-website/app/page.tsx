import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { prisma } from "@/lib/db";

async function getData() {
  try {
    const [eglisesList, annoncesList, evenementsList] = await Promise.all([
      prisma.eglise.findMany({ where: { statut: "actif" }, take: 6, orderBy: { nom: "asc" } }),
      prisma.annonce.findMany({ where: { publie: true }, orderBy: { datePublication: "desc" }, take: 3 }),
      prisma.evenement.findMany({ where: { publie: true }, orderBy: { dateDebut: "asc" }, take: 3 }),
    ]);
    return { eglisesList, annoncesList, evenementsList };
  } catch {
    return { eglisesList: [], annoncesList: [], evenementsList: [] };
  }
}

export default async function HomePage() {
  const { eglisesList, annoncesList, evenementsList } = await getData();

  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section style={{
          background: "linear-gradient(135deg, #1e3a8a 0%, #1e2d6b 60%, #0f172a 100%)",
          color: "white",
          padding: "6rem 1rem",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
            background: "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.03\"%3E%3Cpath d=\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')",
            opacity: 0.4
          }} />
          <div style={{ maxWidth: 800, margin: "0 auto", position: "relative" }}>
            <div style={{
              display: "inline-block",
              background: "rgba(197,155,46,0.2)",
              border: "1px solid rgba(197,155,46,0.4)",
              borderRadius: 100,
              padding: "6px 20px",
              fontSize: 13,
              color: "#fcd34d",
              marginBottom: 24,
              letterSpacing: "0.05em",
              textTransform: "uppercase" as const,
            }}>
              Communaute des Eglises Evangeliques au Congo
            </div>
            <h1 style={{
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              fontWeight: 800,
              lineHeight: 1.2,
              marginBottom: 20,
              textShadow: "0 2px 10px rgba(0,0,0,0.3)"
            }}>
              Ensemble dans la Foi,
              <br />
              <span style={{ color: "#fcd34d" }}>unis pour le Congo</span>
            </h1>
            <p style={{
              fontSize: "clamp(1rem, 2vw, 1.25rem)",
              opacity: 0.85,
              marginBottom: 40,
              maxWidth: 600,
              margin: "0 auto 40px",
              lineHeight: 1.7
            }}>
              La CEEC regroupe plusieurs eglises evangeliques a travers le Congo, toutes unies dans la foi, la priere et le service au peuple congolais.
            </p>
            <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" as const }}>
              <Link href="/paroisses" style={{
                padding: "14px 32px", borderRadius: 8,
                background: "#c59b2e", color: "#1e3a8a",
                fontWeight: 700, fontSize: 16, display: "inline-block"
              }}>
                Nos Eglises
              </Link>
              <Link href="/sign-up" style={{
                padding: "14px 32px", borderRadius: 8,
                background: "rgba(255,255,255,0.15)", color: "white",
                fontWeight: 600, fontSize: 16, display: "inline-block",
                border: "1px solid rgba(255,255,255,0.3)"
              }}>
                Rejoindre la CEEC
              </Link>
            </div>
          </div>
        </section>

        {/* Valeurs */}
        <section style={{ padding: "5rem 1rem", background: "#f8fafc" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "3rem" }}>
              <h2 style={{ fontSize: "2rem", fontWeight: 700, color: "#1e3a8a", marginBottom: 12 }}>
                Nos Valeurs Fondamentales
              </h2>
              <p style={{ color: "#64748b", maxWidth: 500, margin: "0 auto" }}>
                Ces valeurs guident chacune de nos eglises et notre engagement envers Dieu et la nation.
              </p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 24 }}>
              {[
                { titre: "La Foi", desc: "Une foi solide fondee sur la Parole de Dieu, vecue au quotidien dans nos communautes.", icon: "✝" },
                { titre: "La Fraternite", desc: "Des liens fraternels forts entre toutes les eglises membres de la CEEC a travers le Congo.", icon: "🤝" },
                { titre: "Le Service", desc: "Un engagement constant au service de la communaute congolaise, dans le respect et l'amour.", icon: "♡" },
                { titre: "La Priere", desc: "La priere comme fondement de notre vie communautaire et de nos actions quotidiennes.", icon: "🙏" },
              ].map((valeur) => (
                <div key={valeur.titre} style={{
                  background: "white",
                  borderRadius: 12,
                  padding: "2rem",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  border: "1px solid #e2e8f0",
                  textAlign: "center"
                }}>
                  <div style={{
                    fontSize: 36, marginBottom: 16,
                    width: 64, height: 64,
                    background: "rgba(30,58,138,0.08)",
                    borderRadius: 16,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    margin: "0 auto 16px"
                  }}>
                    {valeur.icon}
                  </div>
                  <h3 style={{ fontWeight: 700, color: "#1e3a8a", marginBottom: 8, fontSize: 18 }}>{valeur.titre}</h3>
                  <p style={{ color: "#64748b", lineHeight: 1.6, fontSize: 14 }}>{valeur.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Eglises */}
        <section style={{ padding: "5rem 1rem", background: "white" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2.5rem", flexWrap: "wrap" as const, gap: 12 }}>
              <div>
                <h2 style={{ fontSize: "2rem", fontWeight: 700, color: "#1e3a8a" }}>Nos Eglises</h2>
                <p style={{ color: "#64748b", marginTop: 4 }}>Decouvrez les eglises membres de la CEEC</p>
              </div>
              <Link href="/paroisses" style={{
                padding: "10px 24px", borderRadius: 8,
                border: "2px solid #1e3a8a", color: "#1e3a8a",
                fontWeight: 600, fontSize: 14
              }}>
                Voir toutes les eglises
              </Link>
            </div>
            {eglisesList.length === 0 ? (
              <div style={{ textAlign: "center", padding: "3rem", background: "#f8fafc", borderRadius: 12, border: "1px dashed #e2e8f0" }}>
                <p style={{ color: "#64748b" }}>Les eglises seront affichees ici une fois ajoutees par les administrateurs.</p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24 }}>
                {eglisesList.map((eglise) => (
                  <Link key={eglise.id} href={`/paroisses/${eglise.id}`} style={{ display: "block" }}>
                    <div style={{
                      borderRadius: 12, overflow: "hidden",
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                      transition: "transform 0.2s, box-shadow 0.2s",
                      cursor: "pointer",
                      background: "white"
                    }}>
                      <div style={{
                        height: 160, background: "linear-gradient(135deg, #1e3a8a, #1e2d6b)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "white", fontSize: 48, fontWeight: 700
                      }}>
                        {eglise.nom.charAt(0)}
                      </div>
                      <div style={{ padding: "1.25rem" }}>
                        <h3 style={{ fontWeight: 700, color: "#0f172a", marginBottom: 4, fontSize: 16 }}>{eglise.nom}</h3>
                        <p style={{ color: "#c59b2e", fontSize: 14, fontWeight: 600, marginBottom: 8 }}>{eglise.ville}</p>
                        {eglise.pasteur && (
                          <p style={{ color: "#64748b", fontSize: 13 }}>Pasteur : {eglise.pasteur}</p>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Annonces & Evenements */}
        <section style={{ padding: "5rem 1rem", background: "#f8fafc" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "3rem" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1e3a8a" }}>Annonces</h2>
                  <Link href="/annonces" style={{ color: "#c59b2e", fontWeight: 600, fontSize: 14 }}>Tout voir</Link>
                </div>
                {annoncesList.length === 0 ? (
                  <p style={{ color: "#64748b", background: "white", padding: "1.5rem", borderRadius: 10, border: "1px dashed #e2e8f0" }}>
                    Aucune annonce pour le moment.
                  </p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {annoncesList.map((annonce) => (
                      <div key={annonce.id} style={{ background: "white", borderRadius: 10, padding: "1.25rem", border: "1px solid #e2e8f0", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                        <div style={{ display: "inline-block", fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 100, background: annonce.priorite === "urgente" ? "#fee2e2" : "#e0f2fe", color: annonce.priorite === "urgente" ? "#dc2626" : "#0369a1", marginBottom: 8 }}>
                          {annonce.priorite === "urgente" ? "Urgent" : "Info"}
                        </div>
                        <h4 style={{ fontWeight: 600, color: "#0f172a", marginBottom: 6, fontSize: 15 }}>{annonce.titre}</h4>
                        <p style={{ color: "#64748b", fontSize: 13, lineHeight: 1.5 }}>
                          {annonce.contenu.substring(0, 100)}...
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1e3a8a" }}>Evenements</h2>
                  <Link href="/evenements" style={{ color: "#c59b2e", fontWeight: 600, fontSize: 14 }}>Tout voir</Link>
                </div>
                {evenementsList.length === 0 ? (
                  <p style={{ color: "#64748b", background: "white", padding: "1.5rem", borderRadius: 10, border: "1px dashed #e2e8f0" }}>
                    Aucun evenement planifie pour le moment.
                  </p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {evenementsList.map((evt) => (
                      <div key={evt.id} style={{ background: "white", borderRadius: 10, padding: "1.25rem", border: "1px solid #e2e8f0", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", display: "flex", gap: 16 }}>
                        <div style={{ flexShrink: 0, width: 56, height: 56, background: "#1e3a8a", borderRadius: 10, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "white" }}>
                          <div style={{ fontSize: 18, fontWeight: 700 }}>{new Date(evt.dateDebut).getDate()}</div>
                          <div style={{ fontSize: 10, opacity: 0.8 }}>{new Date(evt.dateDebut).toLocaleString("fr-FR", { month: "short" }).toUpperCase()}</div>
                        </div>
                        <div>
                          <h4 style={{ fontWeight: 600, color: "#0f172a", marginBottom: 4, fontSize: 15 }}>{evt.titre}</h4>
                          {evt.lieu && <p style={{ color: "#64748b", fontSize: 13 }}>{evt.lieu}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: "5rem 1rem", background: "linear-gradient(135deg, #c59b2e 0%, #d4af5a 100%)", textAlign: "center" }}>
          <div style={{ maxWidth: 600, margin: "0 auto" }}>
            <h2 style={{ fontSize: "2rem", fontWeight: 800, color: "#1e3a8a", marginBottom: 16 }}>
              Faites partie de notre communaute
            </h2>
            <p style={{ color: "#1e3a8a", opacity: 0.8, marginBottom: 32, fontSize: 16, lineHeight: 1.7 }}>
              Rejoignez la CEEC, accedez aux ressources de votre eglise, restez informe des evenements et annonces de toute la communaute.
            </p>
            <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" as const }}>
              <Link href="/sign-up" style={{ padding: "14px 32px", borderRadius: 8, background: "#1e3a8a", color: "white", fontWeight: 700, fontSize: 16, display: "inline-block" }}>
                Creer mon compte
              </Link>
              <Link href="/contact" style={{ padding: "14px 32px", borderRadius: 8, background: "rgba(30,58,138,0.1)", color: "#1e3a8a", fontWeight: 600, fontSize: 16, display: "inline-block", border: "2px solid rgba(30,58,138,0.3)" }}>
                Nous contacter
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
