import NavbarServer from "@/components/NavbarServer";
import Footer from "@/components/Footer";
import ContactForm from "@/components/ContactForm";

export const metadata = {
  title: "Contact | CEEC",
  description: "Contactez la Communauté des Églises Évangéliques au Congo",
};

export default function ContactPage() {
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
            position: "absolute", top: "30%", right: "25%",
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
              Nous rejoindre
            </span>
            <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 900, margin: "0 0 20px", lineHeight: 1.15, color: "#fff" }}>
              Contactez-nous
            </h1>
            <p style={{ fontSize: 18, opacity: 0.8, lineHeight: 1.7, margin: "0 auto", maxWidth: 580 }}>
              Notre équipe est à votre disposition pour répondre à toutes vos questions
              sur la CEEC, ses paroisses et ses programmes.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 32, flexWrap: "wrap" }}>
              <a href="#formulaire" style={{
                padding: "12px 28px", borderRadius: 8, background: "#c59b2e",
                color: "#1e3a8a", fontWeight: 700, fontSize: 15, textDecoration: "none",
              }}>
                Écrire un message →
              </a>
              <a href="/paroisses" style={{
                padding: "12px 28px", borderRadius: 8, border: "1.5px solid rgba(255,255,255,0.35)",
                color: "white", fontWeight: 600, fontSize: 15, textDecoration: "none",
              }}>
                Trouver une église
              </a>
            </div>
          </div>
        </section>

        <section id="formulaire" style={{ padding: "4rem 1rem", background: "#f8fafc" }}>
          <div style={{ maxWidth: 1000, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 40 }}>
            <div>
              <h2 style={{ fontWeight: 700, color: "#1e3a8a", fontSize: 24, marginBottom: 24 }}>
                Informations de contact
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {[
                  { label: "Siège social", value: "Kinshasa, République Démocratique du Congo", icon: "📍" },
                  { label: "Email", value: "contact@ceec-rdc.org", icon: "✉️" },
                  { label: "Téléphone", value: "+243 xxx xxx xxx", icon: "📞" },
                  { label: "Heures d'ouverture", value: "Lundi - Vendredi : 8h00 - 17h00", icon: "🕐" },
                ].map((info) => (
                  <div key={info.label} style={{
                    display: "flex", gap: 16, alignItems: "flex-start",
                    background: "white", padding: "1.25rem",
                    borderRadius: 12, border: "1px solid #e2e8f0"
                  }}>
                    <span style={{ fontSize: 24, flexShrink: 0 }}>{info.icon}</span>
                    <div>
                      <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase" as const, marginBottom: 4 }}>
                        {info.label}
                      </div>
                      <div style={{ color: "#334155", fontWeight: 500 }}>{info.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h2 style={{ fontWeight: 700, color: "#1e3a8a", fontSize: 24, marginBottom: 24 }}>
                Envoyer un message
              </h2>
              <ContactForm />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
