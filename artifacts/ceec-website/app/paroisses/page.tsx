import Link from "next/link";
import NavbarServer from "@/components/NavbarServer";
import Footer from "@/components/Footer";
import { prisma } from "@/lib/db";

async function getEglises() {
  try {
    return await prisma.eglise.findMany({ where: { statut: "actif" }, orderBy: { nom: "asc" } });
  } catch {
    return [];
  }
}

export const metadata = {
  title: "Nos Eglises | CEEC",
  description: "Decouvrez toutes les eglises membres de la CEEC au Congo",
};

export default async function ParoissesPage() {
  const eglisesList = await getEglises();

  return (
    <>
      <NavbarServer />
      <main>
        <section style={{
          background: "linear-gradient(135deg, #1e3a8a 0%, #1e2d6b 100%)",
          minHeight: "75vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "8rem 1rem 5rem",
          color: "white",
          position: "relative",
          overflow: "hidden",
        }}>
          {/* Motif de fond */}
          <div aria-hidden style={{
            position: "absolute", inset: 0, opacity: 0.04,
            backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }} />
          {/* Halo or */}
          <div aria-hidden style={{
            position: "absolute", top: "25%", right: "20%",
            width: 500, height: 500, borderRadius: "50%",
            background: "#c59b2e", opacity: 0.05, filter: "blur(120px)",
            pointerEvents: "none",
          }} />
          <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center", position: "relative" }}>
            <span style={{
              display: "inline-block", fontSize: 12, fontWeight: 700, letterSpacing: "0.12em",
              textTransform: "uppercase", color: "rgba(197,155,46,1)",
              background: "rgba(197,155,46,0.12)", borderRadius: 20, padding: "4px 16px", marginBottom: 20,
            }}>
              Réseau national
            </span>
            <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 900, margin: "0 0 20px", lineHeight: 1.15, color: "#fff" }}>
              Nos Églises membres
            </h1>
            <p style={{ fontSize: 18, opacity: 0.8, lineHeight: 1.7, margin: "0 auto", maxWidth: 580 }}>
              Découvrez les paroisses de la Communauté des Églises Évangéliques au Congo,
              présentes dans toutes les provinces de la République Démocratique du Congo.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 32, flexWrap: "wrap" }}>
              <a href="#liste" style={{
                padding: "12px 28px", borderRadius: 8, background: "#c59b2e",
                color: "#1e3a8a", fontWeight: 700, fontSize: 15, textDecoration: "none",
              }}>
                Voir les églises →
              </a>
              <a href="/contact" style={{
                padding: "12px 28px", borderRadius: 8, border: "1.5px solid rgba(255,255,255,0.35)",
                color: "white", fontWeight: 600, fontSize: 15, textDecoration: "none",
              }}>
                Nous contacter
              </a>
            </div>
          </div>
        </section>

        <section id="liste" style={{ padding: "4rem 1rem", background: "#f8fafc" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            {eglisesList.length === 0 ? (
              <div style={{ textAlign: "center", padding: "4rem", background: "white", borderRadius: 16, border: "1px dashed #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>&#x26EA;</div>
                <h3 style={{ color: "#1e3a8a", fontWeight: 700, marginBottom: 8 }}>Aucune eglise enregistree</h3>
                <p style={{ color: "#64748b" }}>Les eglises seront affichees ici une fois ajoutees par les administrateurs.</p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 24 }}>
                {eglisesList.map((eglise) => (
                  <Link key={eglise.id} href={`/paroisses/${eglise.id}`}>
                    <div style={{ background: "white", borderRadius: 14, overflow: "hidden", border: "1px solid #e2e8f0", boxShadow: "0 2px 10px rgba(0,0,0,0.06)", transition: "transform 0.2s", cursor: "pointer" }}>
                      <div style={{ height: 180, background: "linear-gradient(135deg, #1e3a8a, #1e2d6b)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 64, fontWeight: 800 }}>
                        {eglise.nom.charAt(0)}
                      </div>
                      <div style={{ padding: "1.5rem" }}>
                        <h2 style={{ fontWeight: 700, color: "#0f172a", fontSize: 18, marginBottom: 6 }}>{eglise.nom}</h2>
                        <p style={{ color: "#c59b2e", fontWeight: 600, fontSize: 14, marginBottom: 12 }}>{eglise.ville}</p>
                        {eglise.pasteur && (
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                            <span style={{ fontSize: 14, color: "#64748b" }}>Pasteur :</span>
                            <span style={{ fontSize: 14, fontWeight: 600, color: "#334155" }}>{eglise.pasteur}</span>
                          </div>
                        )}
                        {eglise.adresse && <p style={{ color: "#64748b", fontSize: 13, lineHeight: 1.5 }}>{eglise.adresse}</p>}
                        {eglise.description && (
                          <p style={{ color: "#475569", fontSize: 13, marginTop: 12, lineHeight: 1.6 }}>{eglise.description.substring(0, 120)}...</p>
                        )}
                        <div style={{ marginTop: 16, padding: "8px 0 0", borderTop: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <span style={{ color: "#1e3a8a", fontWeight: 600, fontSize: 14 }}>Voir les details</span>
                          <span style={{ color: "#1e3a8a" }}>&#8594;</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
