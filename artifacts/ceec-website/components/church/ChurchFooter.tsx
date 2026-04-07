import Link from "next/link";
import type { EgliseData } from "@/lib/church-context";

export default function ChurchFooter({ eglise }: { eglise: EgliseData }) {
  return (
    <footer style={{
      background: "#0f172a",
      color: "#94a3b8",
      padding: "3rem 1rem 1.5rem",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "2rem",
          marginBottom: "2rem",
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              {eglise.logoUrl ? (
                <img
                  src={eglise.logoUrl}
                  alt={eglise.nom}
                  style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover" }}
                />
              ) : (
                <div style={{
                  width: 40, height: 40, borderRadius: "50%",
                  background: "#c59b2e",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 700, fontSize: 16, color: "#1e3a8a", flexShrink: 0,
                }}>
                  {eglise.nom.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <div style={{ color: "white", fontWeight: 700, fontSize: 15 }}>{eglise.nom}</div>
                <div style={{ fontSize: 11 }}>{eglise.ville} — CEEC</div>
              </div>
            </div>
            {eglise.description && (
              <p style={{ fontSize: 13, lineHeight: 1.7 }}>{eglise.description}</p>
            )}
          </div>

          <div>
            <h4 style={{ color: "white", fontWeight: 600, marginBottom: 12, fontSize: 15 }}>
              Espace église
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { href: "/c", label: "Accueil" },
                { href: "/c/annonces", label: "Annonces" },
                { href: "/c/evenements", label: "Événements" },
                { href: "/c/inscription", label: "Rejoindre l'église" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} style={{ color: "#94a3b8", fontSize: 14, textDecoration: "none" }}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 style={{ color: "white", fontWeight: 600, marginBottom: 12, fontSize: 15 }}>
              Contact
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13 }}>
              {eglise.adresse && <p style={{ margin: 0 }}>{eglise.adresse}</p>}
              <p style={{ margin: 0 }}>{eglise.ville}, RDC</p>
              {eglise.telephone && <p style={{ margin: 0 }}>{eglise.telephone}</p>}
              {eglise.email && <p style={{ margin: 0 }}>{eglise.email}</p>}
              {eglise.pasteur && (
                <p style={{ margin: 0, marginTop: 4 }}>
                  Pasteur : <span style={{ color: "white" }}>{eglise.pasteur}</span>
                </p>
              )}
            </div>
          </div>

          <div>
            <h4 style={{ color: "white", fontWeight: 600, marginBottom: 12, fontSize: 15 }}>
              CEEC
            </h4>
            <p style={{ fontSize: 13, lineHeight: 1.7 }}>
              Membre de la Communauté des Églises Évangéliques au Congo.
            </p>
            <Link
              href="/"
              style={{
                display: "inline-block",
                marginTop: 10,
                fontSize: 13,
                color: "#c59b2e",
                textDecoration: "none",
              }}
            >
              ceec.cd →
            </Link>
          </div>
        </div>

        <div style={{
          borderTop: "1px solid #1e293b",
          paddingTop: 24,
          textAlign: "center",
          fontSize: 13,
        }}>
          <p>
            © {new Date().getFullYear()} {eglise.nom} — Communauté des Églises Évangéliques au Congo (CEEC). Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}
