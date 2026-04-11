import Link from "next/link";
import type { EgliseData } from "@/lib/church-context";
import { safeUrl } from "@/lib/sanitize-url";

type SocialLinks = {
  facebook?: string | null;
  youtube?: string | null;
  instagram?: string | null;
  twitter?: string | null;
  whatsapp?: string | null;
  siteWeb?: string | null;
  horaires?: string | null;
};

type FooterPage = { titre: string; slug: string };

export default function ChurchFooter({
  eglise,
  social,
  pages = [],
}: {
  eglise: EgliseData;
  social?: SocialLinks;
  pages?: FooterPage[];
}) {
  const accent = "var(--church-accent, #c59b2e)";

  const navLinks: FooterPage[] = [
    { titre: "Accueil", slug: "" },
    { titre: "Annonces", slug: "annonces" },
    { titre: "Événements", slug: "evenements" },
    ...pages,
    { titre: "Rejoindre l'église", slug: "inscription" },
  ];

  return (
    <footer style={{ background: "#0f172a", color: "#94a3b8", padding: "3.5rem 1rem 1.5rem" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "2.5rem",
            marginBottom: "2.5rem",
          }}
        >
          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              {eglise.logoUrl ? (
                <img src={eglise.logoUrl} alt={eglise.nom} style={{ width: 42, height: 42, borderRadius: "50%", objectFit: "cover", border: "2px solid #c59b2e" }} />
              ) : (
                <div style={{ width: 42, height: 42, borderRadius: "50%", background: "#c59b2e", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 16, color: "#1e3a8a" }}>
                  {eglise.nom.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <div style={{ color: "white", fontWeight: 700, fontSize: 14 }}>{eglise.nom}</div>
                <div style={{ fontSize: 11 }}>{eglise.ville} — CEEC</div>
              </div>
            </div>
            {eglise.description && (
              <p style={{ fontSize: 13, lineHeight: 1.75, marginBottom: 16 }}>
                {eglise.description.slice(0, 200)}
              </p>
            )}
            {/* Social icons */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {social?.facebook && (
                <a href={safeUrl(social.facebook)} target="_blank" rel="noopener noreferrer" title="Facebook" style={{ color: "#94a3b8", textDecoration: "none", fontSize: 18 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                </a>
              )}
              {social?.youtube && (
                <a href={safeUrl(social.youtube)} target="_blank" rel="noopener noreferrer" title="YouTube" style={{ color: "#94a3b8", textDecoration: "none" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon fill="#0f172a" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/></svg>
                </a>
              )}
              {social?.instagram && (
                <a href={safeUrl(social.instagram)} target="_blank" rel="noopener noreferrer" title="Instagram" style={{ color: "#94a3b8", textDecoration: "none" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                </a>
              )}
              {social?.twitter && (
                <a href={safeUrl(social.twitter)} target="_blank" rel="noopener noreferrer" title="Twitter / X" style={{ color: "#94a3b8", textDecoration: "none" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
              )}
              {social?.whatsapp && (
                <a href={`https://wa.me/${social.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" title="WhatsApp" style={{ color: "#94a3b8", textDecoration: "none" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                </a>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 style={{ color: "white", fontWeight: 600, marginBottom: 16, fontSize: 14 }}>
              Navigation
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
              {navLinks.map((link) => (
                <li key={link.slug}>
                  <Link
                    href={link.slug ? `/c/${link.slug}` : "/c"}
                    style={{ color: "#94a3b8", fontSize: 14, textDecoration: "none" }}
                  >
                    {link.titre}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ color: "white", fontWeight: 600, marginBottom: 16, fontSize: 14 }}>
              Contact
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13 }}>
              {eglise.adresse && <p style={{ margin: 0 }}>📍 {eglise.adresse}</p>}
              {eglise.ville && <p style={{ margin: 0 }}>🇨🇩 {eglise.ville}, RDC</p>}
              {eglise.telephone && (
                <a href={`tel:${eglise.telephone}`} style={{ color: "#94a3b8", textDecoration: "none" }}>
                  📞 {eglise.telephone}
                </a>
              )}
              {eglise.email && (
                <a href={`mailto:${eglise.email}`} style={{ color: "#94a3b8", textDecoration: "none" }}>
                  ✉️ {eglise.email}
                </a>
              )}
              {eglise.pasteur && (
                <p style={{ margin: 0, marginTop: 6 }}>
                  Pasteur : <span style={{ color: "white" }}>{eglise.pasteur}</span>
                </p>
              )}
              {social?.horaires && (
                <p style={{ margin: "8px 0 0", lineHeight: 1.6 }}>
                  🕐 {social.horaires}
                </p>
              )}
              {social?.siteWeb && (
                <a href={safeUrl(social.siteWeb)} target="_blank" rel="noopener noreferrer" style={{ color: accent, textDecoration: "none", marginTop: 4 }}>
                  🌐 {social.siteWeb.replace(/^https?:\/\//, "")}
                </a>
              )}
            </div>
          </div>

          {/* CEEC */}
          <div>
            <h4 style={{ color: "white", fontWeight: 600, marginBottom: 16, fontSize: 14 }}>CEEC</h4>
            <p style={{ fontSize: 13, lineHeight: 1.75, marginBottom: 12 }}>
              Membre de la Communauté des Églises Évangéliques au Congo.
            </p>
            <Link href="/" style={{ display: "inline-block", fontSize: 13, color: accent, textDecoration: "none" }}>
              ceec.cd →
            </Link>
          </div>
        </div>

        <div style={{ borderTop: "1px solid #1e293b", paddingTop: 24, textAlign: "center", fontSize: 13 }}>
          <p style={{ margin: 0 }}>
            © {new Date().getFullYear()} {eglise.nom} — Communauté des Églises Évangéliques au Congo (CEEC)
          </p>
        </div>
      </div>
    </footer>
  );
}
