import Link from "next/link";
import { notFound } from "next/navigation";
import NavbarServer from "@/components/NavbarServer";
import Footer from "@/components/Footer";
import { prisma } from "@/lib/db";
import { MapPin, Phone, Mail, User, Clock, Globe, Facebook, Youtube, Instagram, Twitter, ExternalLink, Megaphone, CalendarDays, Users } from "lucide-react";

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "ceec-rdc.org";

async function getEgliseData(id: number) {
  try {
    const [eglise, config, membresCount, annoncesList, evenementsList] = await Promise.all([
      prisma.eglise.findUnique({ where: { id } }),
      prisma.egliseConfig.findUnique({ where: { egliseId: id } }),
      prisma.membre.count({ where: { egliseId: id, statut: "actif" } }),
      prisma.annonce.findMany({
        where: { egliseId: id, statutContenu: "publie" },
        orderBy: { datePublication: "desc" },
        take: 5,
      }),
      prisma.evenement.findMany({
        where: { egliseId: id, statutContenu: "publie", dateDebut: { gte: new Date() } },
        orderBy: { dateDebut: "asc" },
        take: 5,
      }),
    ]);
    return { eglise, config, membresCount, annoncesList, evenementsList };
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await prisma.eglise.findUnique({ where: { id: parseInt(id) }, select: { nom: true, ville: true } }).catch(() => null);
  if (!data) return { title: "Paroisse | CEEC" };
  return {
    title: `${data.nom} — ${data.ville} | CEEC`,
    description: `Découvrez la paroisse ${data.nom} de la CEEC à ${data.ville}.`,
  };
}

export default async function ParoisseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const egliseId = parseInt(id);
  if (isNaN(egliseId)) notFound();

  const data = await getEgliseData(egliseId);
  if (!data?.eglise) notFound();

  const { eglise, config, membresCount, annoncesList, evenementsList } = data;

  const churchUrl = eglise.slug
    ? `https://${eglise.slug}.${ROOT_DOMAIN}`
    : null;

  const hasSocial = config && (config.facebook || config.youtube || config.instagram || config.twitter || config.whatsapp || config.siteWeb);

  const moisFR = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Aoû", "Sep", "Oct", "Nov", "Déc"];

  return (
    <>
      <NavbarServer />
      <main>
        {/* ── HERO ─────────────────────────────────────────── */}
        <section style={{
          background: eglise.photoUrl
            ? `linear-gradient(to bottom, rgba(15,23,42,0.72) 0%, rgba(30,42,107,0.85) 100%), url(${eglise.photoUrl}) center/cover no-repeat`
            : "linear-gradient(135deg, #1e3a8a 0%, #1e2d6b 100%)",
          color: "white",
          padding: "8rem 1rem 4rem",
          minHeight: "52vh",
          display: "flex",
          alignItems: "flex-end",
          position: "relative",
          overflow: "hidden",
        }}>
          {!eglise.photoUrl && (
            <>
              <div aria-hidden style={{
                position: "absolute", inset: 0, opacity: 0.04,
                backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
                backgroundSize: "28px 28px",
              }} />
              <div aria-hidden style={{
                position: "absolute", top: "20%", right: "15%",
                width: 500, height: 500, borderRadius: "50%",
                background: "#c59b2e", opacity: 0.06, filter: "blur(120px)",
                pointerEvents: "none",
              }} />
            </>
          )}

          <div style={{ maxWidth: 1000, margin: "0 auto", width: "100%", position: "relative", paddingBottom: "1rem" }}>
            <Link href="/paroisses" style={{
              color: "rgba(255,255,255,0.65)", fontSize: 13,
              marginBottom: 24, display: "inline-flex", alignItems: "center", gap: 5,
              textDecoration: "none",
            }}>
              ← Retour aux paroisses
            </Link>

            <div style={{ display: "flex", alignItems: "flex-end", gap: 24, flexWrap: "wrap" }}>
              {/* Logo ou initiale */}
              <div style={{
                width: 84, height: 84, borderRadius: 16, flexShrink: 0,
                background: eglise.logoUrl ? "white" : "rgba(197,155,46,0.22)",
                border: "2.5px solid rgba(197,155,46,0.6)",
                display: "flex", alignItems: "center", justifyContent: "center",
                overflow: "hidden",
              }}>
                {eglise.logoUrl
                  ? <img src={eglise.logoUrl} alt={eglise.nom} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                  : <span style={{ fontSize: 38, fontWeight: 900, color: "#fcd34d" }}>{eglise.nom.charAt(0)}</span>
                }
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{
                  display: "inline-block", fontSize: 11, fontWeight: 700,
                  letterSpacing: "0.1em", textTransform: "uppercase",
                  color: "rgba(197,155,46,1)", background: "rgba(197,155,46,0.15)",
                  borderRadius: 20, padding: "3px 14px", marginBottom: 10,
                }}>
                  Paroisse CEEC
                </span>
                <h1 style={{ fontSize: "clamp(1.7rem, 4vw, 2.8rem)", fontWeight: 900, margin: "0 0 8px", lineHeight: 1.1 }}>
                  {eglise.nom}
                </h1>
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 5, color: "rgba(255,255,255,0.75)", fontSize: 14 }}>
                    <MapPin size={14} /> {eglise.ville}
                  </span>
                  {membresCount > 0 && (
                    <span style={{ display: "flex", alignItems: "center", gap: 5, color: "rgba(255,255,255,0.6)", fontSize: 13 }}>
                      <Users size={13} /> {membresCount} membre{membresCount > 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              </div>

              {churchUrl && (
                <a
                  href={churchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    padding: "11px 22px", borderRadius: 9,
                    background: "#c59b2e", color: "#1e3a8a",
                    fontWeight: 700, fontSize: 14, textDecoration: "none",
                    flexShrink: 0,
                  }}
                >
                  <ExternalLink size={15} />
                  Visiter la page
                </a>
              )}
            </div>
          </div>
        </section>

        {/* ── CONTENU ──────────────────────────────────────── */}
        <section style={{ padding: "3rem 1rem 4rem" }}>
          <div style={{ maxWidth: 1000, margin: "0 auto" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 36 }}>

              {/* ─ Colonne principale ─ */}
              <div style={{ minWidth: 0 }}>

                {/* Description */}
                {eglise.description && (
                  <div style={{ marginBottom: 36 }}>
                    <h2 style={s.sectionTitle}>À propos</h2>
                    <p style={{ color: "#475569", lineHeight: 1.85, fontSize: 15 }}>{eglise.description}</p>
                  </div>
                )}

                {/* Annonces */}
                <div style={{ marginBottom: 36 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                    <h2 style={{ ...s.sectionTitle, marginBottom: 0 }}>
                      <Megaphone size={18} style={{ display: "inline", verticalAlign: "middle", marginRight: 8, color: "#1e3a8a" }} />
                      Annonces récentes
                    </h2>
                    {churchUrl && (
                      <a href={`${churchUrl}/c/annonces`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: "#1e3a8a", fontWeight: 600, textDecoration: "none" }}>
                        Toutes les annonces →
                      </a>
                    )}
                  </div>
                  {annoncesList.length === 0 ? (
                    <p style={s.emptyText}>Aucune annonce publiée pour cette paroisse.</p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {annoncesList.map(annonce => (
                        <div key={annonce.id} style={s.card}>
                          <h4 style={{ fontWeight: 700, color: "#0f172a", marginBottom: 6, fontSize: 15 }}>{annonce.titre}</h4>
                          <p style={{ color: "#64748b", fontSize: 14, lineHeight: 1.6, margin: "0 0 8px" }}>{annonce.contenu}</p>
                          <p style={{ color: "#94a3b8", fontSize: 12 }}>
                            {new Date(annonce.datePublication).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Événements */}
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                    <h2 style={{ ...s.sectionTitle, marginBottom: 0 }}>
                      <CalendarDays size={18} style={{ display: "inline", verticalAlign: "middle", marginRight: 8, color: "#1e3a8a" }} />
                      Prochains événements
                    </h2>
                    {churchUrl && (
                      <a href={`${churchUrl}/c/evenements`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: "#1e3a8a", fontWeight: 600, textDecoration: "none" }}>
                        Tous les événements →
                      </a>
                    )}
                  </div>
                  {evenementsList.length === 0 ? (
                    <p style={s.emptyText}>Aucun événement à venir pour cette paroisse.</p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {evenementsList.map(evt => {
                        const d = new Date(evt.dateDebut);
                        return (
                          <div key={evt.id} style={{ ...s.card, display: "flex", gap: 16, alignItems: "flex-start" }}>
                            <div style={{
                              flexShrink: 0, width: 54, height: 54,
                              background: "linear-gradient(135deg, #1e3a8a, #1e2d6b)",
                              borderRadius: 10, display: "flex", flexDirection: "column",
                              alignItems: "center", justifyContent: "center", color: "white",
                            }}>
                              <div style={{ fontSize: 20, fontWeight: 900, lineHeight: 1 }}>{d.getDate()}</div>
                              <div style={{ fontSize: 10, fontWeight: 600, opacity: 0.8, textTransform: "uppercase" }}>{moisFR[d.getMonth()]}</div>
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <h4 style={{ fontWeight: 700, color: "#0f172a", marginBottom: 4, fontSize: 15 }}>{evt.titre}</h4>
                              {evt.lieu && (
                                <p style={{ color: "#64748b", fontSize: 13, margin: "0 0 3px", display: "flex", alignItems: "center", gap: 4 }}>
                                  <MapPin size={12} /> {evt.lieu}
                                </p>
                              )}
                              {evt.description && (
                                <p style={{ color: "#475569", fontSize: 13, margin: "4px 0 0", lineHeight: 1.5 }}>{evt.description}</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* ─ Sidebar ─ */}
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

                {/* Visiter la page dédiée */}
                {churchUrl && (
                  <div style={{ ...s.sidebar, background: "linear-gradient(135deg, #1e3a8a, #1e2d6b)", border: "none" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(255,255,255,0.6)", marginBottom: 8 }}>
                      Page dédiée
                    </div>
                    <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, margin: "0 0 14px", lineHeight: 1.6 }}>
                      Cette paroisse possède son propre espace en ligne avec son contenu et son équipe.
                    </p>
                    <a
                      href={churchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                        padding: "10px 0", borderRadius: 8, width: "100%",
                        background: "#c59b2e", color: "#1e3a8a",
                        fontWeight: 700, fontSize: 14, textDecoration: "none",
                      }}
                    >
                      <ExternalLink size={14} />
                      Visiter {eglise.nom}
                    </a>
                  </div>
                )}

                {/* Contact */}
                <div style={s.sidebar}>
                  <h3 style={s.sidebarTitle}>Informations de contact</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {eglise.pasteur && (
                      <div style={s.infoRow}>
                        <User size={15} color="#1e3a8a" style={{ flexShrink: 0, marginTop: 1 }} />
                        <div>
                          <div style={s.infoLabel}>Pasteur</div>
                          <div style={s.infoValue}>{eglise.pasteur}</div>
                        </div>
                      </div>
                    )}
                    {eglise.adresse && (
                      <div style={s.infoRow}>
                        <MapPin size={15} color="#1e3a8a" style={{ flexShrink: 0, marginTop: 1 }} />
                        <div>
                          <div style={s.infoLabel}>Adresse</div>
                          <div style={s.infoValue}>{eglise.adresse}</div>
                        </div>
                      </div>
                    )}
                    {eglise.telephone && (
                      <div style={s.infoRow}>
                        <Phone size={15} color="#1e3a8a" style={{ flexShrink: 0, marginTop: 1 }} />
                        <div>
                          <div style={s.infoLabel}>Téléphone</div>
                          <a href={`tel:${eglise.telephone}`} style={{ ...s.infoValue, color: "#1e3a8a", textDecoration: "none" }}>{eglise.telephone}</a>
                        </div>
                      </div>
                    )}
                    {eglise.email && (
                      <div style={s.infoRow}>
                        <Mail size={15} color="#1e3a8a" style={{ flexShrink: 0, marginTop: 1 }} />
                        <div>
                          <div style={s.infoLabel}>Email</div>
                          <a href={`mailto:${eglise.email}`} style={{ ...s.infoValue, color: "#1e3a8a", textDecoration: "none", wordBreak: "break-all" }}>{eglise.email}</a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Horaires */}
                {config?.horaires && (
                  <div style={s.sidebar}>
                    <h3 style={s.sidebarTitle}>
                      <Clock size={15} style={{ display: "inline", verticalAlign: "middle", marginRight: 6, color: "#1e3a8a" }} />
                      Horaires de culte
                    </h3>
                    <p style={{ color: "#475569", fontSize: 14, lineHeight: 1.75, margin: 0, whiteSpace: "pre-line" }}>{config.horaires}</p>
                  </div>
                )}

                {/* Réseaux sociaux */}
                {hasSocial && (
                  <div style={s.sidebar}>
                    <h3 style={s.sidebarTitle}>Retrouvez-nous</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {config?.siteWeb && (
                        <a href={config.siteWeb} target="_blank" rel="noopener noreferrer" style={s.socialLink}>
                          <Globe size={16} color="#1e3a8a" /> Site web officiel
                        </a>
                      )}
                      {config?.facebook && (
                        <a href={config.facebook} target="_blank" rel="noopener noreferrer" style={s.socialLink}>
                          <Facebook size={16} color="#1877f2" /> Facebook
                        </a>
                      )}
                      {config?.youtube && (
                        <a href={config.youtube} target="_blank" rel="noopener noreferrer" style={s.socialLink}>
                          <Youtube size={16} color="#ff0000" /> YouTube
                        </a>
                      )}
                      {config?.instagram && (
                        <a href={config.instagram} target="_blank" rel="noopener noreferrer" style={s.socialLink}>
                          <Instagram size={16} color="#e1306c" /> Instagram
                        </a>
                      )}
                      {config?.twitter && (
                        <a href={config.twitter} target="_blank" rel="noopener noreferrer" style={s.socialLink}>
                          <Twitter size={16} color="#1da1f2" /> Twitter / X
                        </a>
                      )}
                      {config?.whatsapp && (
                        <a href={`https://wa.me/${config.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" style={s.socialLink}>
                          <Phone size={16} color="#25d366" /> WhatsApp
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Toutes les paroisses */}
                <div style={{ textAlign: "center", paddingTop: 4 }}>
                  <Link href="/paroisses" style={{ fontSize: 13, color: "#94a3b8", textDecoration: "none", fontWeight: 500 }}>
                    ← Voir toutes les paroisses CEEC
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

const s: Record<string, React.CSSProperties> = {
  sectionTitle: { fontWeight: 800, color: "#1e3a8a", marginBottom: 16, fontSize: 18 },
  card: { padding: "1.1rem 1.25rem", borderRadius: 10, border: "1px solid #e2e8f0", background: "#f8fafc" },
  emptyText: { color: "#94a3b8", fontSize: 14, fontStyle: "italic", padding: "1rem 0" },
  sidebar: { background: "#f8fafc", borderRadius: 14, border: "1px solid #e2e8f0", padding: "1.4rem" },
  sidebarTitle: { fontWeight: 700, color: "#1e3a8a", marginBottom: 14, fontSize: 15, marginTop: 0 },
  infoRow: { display: "flex", gap: 10, alignItems: "flex-start" },
  infoLabel: { fontSize: 11, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase" as const, marginBottom: 2, letterSpacing: "0.06em" },
  infoValue: { color: "#334155", fontWeight: 600, fontSize: 14 },
  socialLink: { display: "flex", alignItems: "center", gap: 9, color: "#334155", textDecoration: "none", fontSize: 14, fontWeight: 500, padding: "6px 10px", borderRadius: 7, background: "white", border: "1px solid #e2e8f0" },
};
