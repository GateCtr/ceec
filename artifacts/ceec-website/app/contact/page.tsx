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
          background: "linear-gradient(135deg, #1e3a8a, #1e2d6b)",
          color: "white", padding: "4rem 1rem", textAlign: "center"
        }}>
          <h1 style={{ fontSize: "2.5rem", fontWeight: 800, marginBottom: 12 }}>Contactez-nous</h1>
          <p style={{ opacity: 0.8, fontSize: 16 }}>Notre équipe est disponible pour répondre à vos questions</p>
        </section>

        <section style={{ padding: "4rem 1rem", background: "#f8fafc" }}>
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
