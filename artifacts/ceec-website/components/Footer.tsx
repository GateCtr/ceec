import Link from "next/link";

export default function Footer() {
  return (
    <footer style={{
      background: "#0f172a", color: "#94a3b8",
      padding: "3rem 1rem 1.5rem"
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "2rem", marginBottom: "2rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div style={{
                width: 40, height: 40, borderRadius: "50%",
                background: "#c59b2e", display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 700, fontSize: 16, color: "#1e3a8a", flexShrink: 0
              }}>C</div>
              <div>
                <div style={{ color: "white", fontWeight: 700, fontSize: 16 }}>CEEC</div>
                <div style={{ fontSize: 11 }}>Communauté Évangélique au Congo</div>
              </div>
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.7 }}>
              La Communauté des Églises Évangéliques au Congo, unie dans la foi et le service à Dieu et à la nation congolaise.
            </p>
          </div>

          <div>
            <h4 style={{ color: "white", fontWeight: 600, marginBottom: 12, fontSize: 15 }}>Liens rapides</h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { href: "/paroisses", label: "Nos paroisses" },
                { href: "/evenements", label: "Événements" },
                { href: "/annonces", label: "Annonces" },
                { href: "/contact", label: "Contact" },
              ].map(link => (
                <li key={link.href}>
                  <Link href={link.href} style={{ color: "#94a3b8", fontSize: 14, transition: "color 0.2s" }}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 style={{ color: "white", fontWeight: 600, marginBottom: 12, fontSize: 15 }}>Mon espace</h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { href: "/sign-in", label: "Se connecter" },
                { href: "/sign-up", label: "Créer un compte" },
                { href: "/dashboard", label: "Mon tableau de bord" },
                { href: "/dashboard/profile", label: "Mon profil" },
              ].map(link => (
                <li key={link.href}>
                  <Link href={link.href} style={{ color: "#94a3b8", fontSize: 14 }}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 style={{ color: "white", fontWeight: 600, marginBottom: 12, fontSize: 15 }}>Contact</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 14 }}>
              <p>Kinshasa, République Démocratique du Congo</p>
              <p>contact@ceec-rdc.org</p>
              <p>+243 xxx xxx xxx</p>
            </div>
          </div>
        </div>

        <div style={{ borderTop: "1px solid #1e293b", paddingTop: 24, textAlign: "center", fontSize: 13 }}>
          <p>© {new Date().getFullYear()} CEEC — Communauté des Églises Évangéliques au Congo. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}
