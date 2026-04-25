import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { SITE_URL } from "@/lib/seo";
import {
  MapPin, Phone, Mail, User, Clock, Globe,
  ExternalLink, Megaphone, CalendarDays, Users,
  ChevronRight, MessageCircle,
} from "lucide-react";

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
  const data = await prisma.eglise
    .findUnique({
      where: { id: parseInt(id) },
      select: { nom: true, ville: true, description: true, logoUrl: true, photoUrl: true },
    })
    .catch(() => null);
  if (!data) return { title: "Paroisse" };
  const description = data.description ?? `Découvrez la paroisse ${data.nom} de la CEEC à ${data.ville}.`;
  const ogImage = data.photoUrl ?? data.logoUrl ?? null;
  return {
    title: `${data.nom} — ${data.ville}`,
    description,
    openGraph: {
      title: `${data.nom} | CEEC`,
      description,
      url: `${SITE_URL}/paroisses/${id}`,
      type: "website",
      ...(ogImage ? { images: [{ url: ogImage, alt: data.nom }] } : {}),
    },
    twitter: {
      card: ogImage ? ("summary_large_image" as const) : ("summary" as const),
      title: `${data.nom} | CEEC`,
      description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  };
}

const socialLinks = [
  { key: "siteWeb", icon: Globe, label: "Site web officiel", color: "text-primary" },
  { key: "facebook", icon: Globe, label: "Facebook", color: "text-[#1877f2]" },
  { key: "youtube", icon: Globe, label: "YouTube", color: "text-[#ff0000]" },
  { key: "instagram", icon: Globe, label: "Instagram", color: "text-[#e1306c]" },
  { key: "twitter", icon: Globe, label: "Twitter / X", color: "text-[#1da1f2]" },
] as const;

const moisFR = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Aoû", "Sep", "Oct", "Nov", "Déc"];

export default async function ParoisseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const egliseId = parseInt(id);
  if (isNaN(egliseId)) notFound();

  const data = await getEgliseData(egliseId);
  if (!data?.eglise) notFound();

  const { eglise, config, membresCount, annoncesList, evenementsList } = data;
  const churchUrl = eglise.slug ? `https://${eglise.slug}.${ROOT_DOMAIN}` : null;
  const hasSocial = config && (config.facebook || config.youtube || config.instagram || config.twitter || config.whatsapp || config.siteWeb);

  return (
    <main>
      {/* ── HERO ─────────────────────────────────────────── */}
      <section
        className="text-white pt-32 px-4 pb-16 min-h-[48vh] sm:min-h-[52vh] flex items-end relative overflow-hidden"
        style={{
          background: eglise.photoUrl
            ? `linear-gradient(to bottom, rgba(15,23,42,0.72) 0%, rgba(30,42,107,0.85) 100%), url(${eglise.photoUrl}) center/cover no-repeat`
            : "linear-gradient(135deg, #1e3a8a 0%, #1e2d6b 100%)",
        }}
      >
        {!eglise.photoUrl && (
          <>
            <div aria-hidden className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
            <div aria-hidden className="absolute top-[20%] right-[15%] w-[500px] h-[500px] rounded-full bg-secondary opacity-[0.06] blur-[120px] pointer-events-none" />
          </>
        )}

        <div className="max-w-[1000px] mx-auto w-full relative pb-4">
          <Link href="/paroisses" className="text-white/65 text-[13px] mb-6 inline-flex items-center gap-1.5 no-underline hover:text-white/90 transition-colors">
            ← Retour aux paroisses
          </Link>

          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5 sm:gap-6">
            {/* Logo ou initiale */}
            <div
              className="w-20 h-20 sm:w-[84px] sm:h-[84px] rounded-2xl shrink-0 border-[2.5px] border-secondary/60 flex items-center justify-center overflow-hidden"
              style={{ background: eglise.logoUrl ? "white" : "rgba(197,155,46,0.22)" }}
            >
              {eglise.logoUrl
                ? <img src={eglise.logoUrl} alt={eglise.nom} className="w-full h-full object-contain" />
                : <span className="text-4xl font-black text-gold">{eglise.nom.charAt(0)}</span>
              }
            </div>

            <div className="flex-1 min-w-0">
              <span className="inline-block text-[11px] font-bold tracking-widest uppercase text-secondary bg-secondary/15 rounded-full px-3.5 py-[3px] mb-2.5">
                Paroisse CEEC
              </span>
              <h1 className="text-2xl sm:text-[clamp(1.7rem,4vw,2.8rem)] font-black m-0 mb-2 leading-[1.1]">
                {eglise.nom}
              </h1>
              <div className="flex gap-4 flex-wrap items-center">
                <span className="flex items-center gap-1.5 text-white/75 text-sm">
                  <MapPin size={14} /> {eglise.ville}
                </span>
                {membresCount > 0 && (
                  <span className="flex items-center gap-1.5 text-white/60 text-[13px]">
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
                className="inline-flex items-center gap-2 py-2.5 px-5 rounded-lg bg-secondary text-primary font-bold text-sm no-underline shrink-0 hover:brightness-110 transition-all"
              >
                <ExternalLink size={15} /> Visiter la page
              </a>
            )}
          </div>
        </div>
      </section>

      {/* ── CONTENU ──────────────────────────────────────── */}
      <section className="pt-10 sm:pt-12 px-4 pb-16">
        <div className="max-w-[1000px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 lg:gap-9">

            {/* ─ Colonne principale ─ */}
            <div className="min-w-0 order-2 lg:order-1">

              {/* Description */}
              {eglise.description && (
                <div className="mb-9">
                  <h2 className="font-extrabold text-primary mb-4 text-lg">À propos</h2>
                  <p className="text-slate-600 leading-[1.85] text-[15px]">{eglise.description}</p>
                </div>
              )}

              {/* Annonces */}
              <div className="mb-9">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-extrabold text-primary text-lg m-0 flex items-center gap-2">
                    <Megaphone size={18} /> Annonces récentes
                  </h2>
                  {churchUrl && (
                    <a href={`${churchUrl}/c/annonces`} target="_blank" rel="noopener noreferrer" className="text-[13px] text-primary font-semibold no-underline inline-flex items-center gap-1 hover:gap-2 transition-all">
                      Tout voir <ChevronRight size={13} />
                    </a>
                  )}
                </div>
                {annoncesList.length === 0 ? (
                  <p className="text-slate-400 text-sm italic py-4">Aucune annonce publiée pour cette paroisse.</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {annoncesList.map((annonce) => (
                      <div key={annonce.id} className="card p-5">
                        <h4 className="font-bold text-foreground mb-1.5 text-[15px]">{annonce.titre}</h4>
                        <p className="text-muted-foreground text-sm leading-relaxed m-0 mb-2">{annonce.contenu}</p>
                        <p className="text-slate-400 text-xs m-0">
                          {new Date(annonce.datePublication).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Événements */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-extrabold text-primary text-lg m-0 flex items-center gap-2">
                    <CalendarDays size={18} /> Prochains événements
                  </h2>
                  {churchUrl && (
                    <a href={`${churchUrl}/c/evenements`} target="_blank" rel="noopener noreferrer" className="text-[13px] text-primary font-semibold no-underline inline-flex items-center gap-1 hover:gap-2 transition-all">
                      Tout voir <ChevronRight size={13} />
                    </a>
                  )}
                </div>
                {evenementsList.length === 0 ? (
                  <p className="text-slate-400 text-sm italic py-4">Aucun événement à venir pour cette paroisse.</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {evenementsList.map((evt) => {
                      const d = new Date(evt.dateDebut);
                      return (
                        <div key={evt.id} className="card p-5 flex gap-4 items-start">
                          <div
                            className="shrink-0 w-14 h-14 rounded-xl flex flex-col items-center justify-center text-white"
                            style={{ background: "linear-gradient(135deg, #1e3a8a, #1e2d6b)" }}
                          >
                            <div className="text-xl font-black leading-none">{d.getDate()}</div>
                            <div className="text-[10px] font-semibold opacity-80 uppercase">{moisFR[d.getMonth()]}</div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-foreground mb-1 text-[15px]">{evt.titre}</h4>
                            {evt.lieu && (
                              <p className="text-muted-foreground text-[13px] m-0 mb-1 flex items-center gap-1">
                                <MapPin size={12} /> {evt.lieu}
                              </p>
                            )}
                            {evt.description && (
                              <p className="text-slate-600 text-[13px] m-0 leading-normal">{evt.description}</p>
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
            <div className="flex flex-col gap-5 order-1 lg:order-2 lg:sticky lg:top-20 lg:self-start">

              {/* Visiter la page dédiée */}
              {churchUrl && (
                <div className="rounded-2xl p-6" style={{ background: "linear-gradient(135deg, #1e3a8a, #1e2d6b)" }}>
                  <div className="text-xs font-bold uppercase tracking-widest text-white/60 mb-2">Page dédiée</div>
                  <p className="text-white/80 text-[13px] m-0 mb-3.5 leading-relaxed">
                    Cette paroisse possède son propre espace en ligne.
                  </p>
                  <a
                    href={churchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 py-2.5 rounded-lg w-full bg-secondary text-primary font-bold text-sm no-underline hover:brightness-110 transition-all"
                  >
                    <ExternalLink size={14} /> Visiter {eglise.nom}
                  </a>
                </div>
              )}

              {/* Contact */}
              <div className="card p-6">
                <h3 className="font-bold text-primary mb-4 text-[15px] m-0">Informations de contact</h3>
                <div className="flex flex-col gap-4">
                  {eglise.pasteur && (
                    <div className="flex gap-3 items-start">
                      <User size={15} className="text-secondary shrink-0 mt-px" />
                      <div>
                        <div className="overline text-slate-400 mb-0.5">Pasteur</div>
                        <div className="text-slate-700 font-semibold text-sm">{eglise.pasteur}</div>
                      </div>
                    </div>
                  )}
                  {eglise.adresse && (
                    <div className="flex gap-3 items-start">
                      <MapPin size={15} className="text-secondary shrink-0 mt-px" />
                      <div>
                        <div className="overline text-slate-400 mb-0.5">Adresse</div>
                        <div className="text-slate-700 font-semibold text-sm">{eglise.adresse}</div>
                      </div>
                    </div>
                  )}
                  {eglise.telephone && (
                    <a href={`tel:${eglise.telephone}`} className="flex gap-3 items-center text-slate-700 no-underline hover:text-primary transition-colors">
                      <Phone size={15} className="text-secondary shrink-0" />
                      <span className="font-semibold text-sm">{eglise.telephone}</span>
                    </a>
                  )}
                  {eglise.email && (
                    <a href={`mailto:${eglise.email}`} className="flex gap-3 items-center text-slate-700 no-underline hover:text-primary transition-colors break-all">
                      <Mail size={15} className="text-secondary shrink-0" />
                      <span className="font-semibold text-sm">{eglise.email}</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Horaires */}
              {config?.horaires && (
                <div className="card p-6">
                  <h3 className="font-bold text-primary mb-3 text-[15px] m-0 flex items-center gap-1.5">
                    <Clock size={15} /> Horaires de culte
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed m-0 whitespace-pre-line">{config.horaires}</p>
                </div>
              )}

              {/* Réseaux sociaux */}
              {hasSocial && (
                <div className="card p-6">
                  <h3 className="font-bold text-primary mb-3 text-[15px] m-0">Retrouvez-nous</h3>
                  <div className="flex flex-col gap-2">
                    {socialLinks.map(({ key, label, color }) => {
                      const value = config?.[key as keyof typeof config] as string | null;
                      if (!value) return null;
                      return (
                        <a key={key} href={value} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-slate-700 no-underline text-sm font-medium py-1.5 px-3 rounded-lg bg-white border border-border hover:border-primary/30 transition-colors">
                          <Globe size={15} className={color} /> {label}
                        </a>
                      );
                    })}
                    {config?.whatsapp && (
                      <a href={`https://wa.me/${config.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-slate-700 no-underline text-sm font-medium py-1.5 px-3 rounded-lg bg-white border border-border hover:border-primary/30 transition-colors">
                        <MessageCircle size={15} className="text-[#25d366]" /> WhatsApp
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Retour */}
              <div className="text-center pt-1">
                <Link href="/paroisses" className="text-[13px] text-slate-400 no-underline font-medium hover:text-primary transition-colors">
                  ← Voir toutes les paroisses CEEC
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
