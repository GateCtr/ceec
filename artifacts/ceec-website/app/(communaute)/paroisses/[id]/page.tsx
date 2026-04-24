import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { SITE_URL } from "@/lib/seo";
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
  const data = await prisma.eglise
    .findUnique({
      where: { id: parseInt(id) },
      select: { nom: true, ville: true, description: true, logoUrl: true, photoUrl: true },
    })
    .catch(() => null);
  if (!data) return { title: "Paroisse" };
  const description =
    data.description ??
    `Découvrez la paroisse ${data.nom} de la CEEC à ${data.ville}.`;
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
    <main>
      {/* ── HERO ─────────────────────────────────────────── */}
      <section
        className="text-white pt-32 pr-4 pb-16 pl-4 min-h-[52vh] flex items-end relative overflow-hidden"
        style={{
          background: eglise.photoUrl
            ? `linear-gradient(to bottom, rgba(15,23,42,0.72) 0%, rgba(30,42,107,0.85) 100%), url(${eglise.photoUrl}) center/cover no-repeat`
            : "linear-gradient(135deg, #1e3a8a 0%, #1e2d6b 100%)",
        }}
      >
        {!eglise.photoUrl && (
          <>
            <div
              aria-hidden
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
                backgroundSize: "28px 28px",
              }}
            />
            <div
              aria-hidden
              className="absolute top-[20%] right-[15%] w-[500px] h-[500px] rounded-full bg-secondary opacity-[0.06] blur-[120px] pointer-events-none"
            />
          </>
        )}

        <div className="max-w-[1000px] mx-auto w-full relative pb-4">
          <Link
            href="/paroisses"
            className="text-white/65 text-[13px] mb-6 inline-flex items-center gap-[5px] no-underline"
          >
            ← Retour aux paroisses
          </Link>

          <div className="flex items-end gap-6 flex-wrap">
            {/* Logo ou initiale */}
            <div className="w-[84px] h-[84px] rounded-2xl shrink-0 border-[2.5px] border-secondary/60 flex items-center justify-center overflow-hidden"
              style={{ background: eglise.logoUrl ? "white" : "rgba(197,155,46,0.22)" }}
            >
              {eglise.logoUrl
                ? <img src={eglise.logoUrl} alt={eglise.nom} className="w-full h-full object-contain" />
                : <span className="text-[38px] font-black text-gold">{eglise.nom.charAt(0)}</span>
              }
            </div>

            <div className="flex-1 min-w-0">
              <span className="inline-block text-[11px] font-bold tracking-widest uppercase text-secondary bg-secondary/15 rounded-[20px] px-3.5 py-[3px] mb-2.5">
                Paroisse CEEC
              </span>
              <h1 className="text-[clamp(1.7rem,4vw,2.8rem)] font-black m-0 mb-2 leading-[1.1]">
                {eglise.nom}
              </h1>
              <div className="flex gap-4 flex-wrap items-center">
                <span className="flex items-center gap-[5px] text-white/75 text-sm">
                  <MapPin size={14} /> {eglise.ville}
                </span>
                {membresCount > 0 && (
                  <span className="flex items-center gap-[5px] text-white/60 text-[13px]">
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
                className="inline-flex items-center gap-2 py-[11px] px-[22px] rounded-[9px] bg-secondary text-primary font-bold text-sm no-underline shrink-0"
              >
                <ExternalLink size={15} />
                Visiter la page
              </a>
            )}
          </div>
        </div>
      </section>


      {/* ── CONTENU ──────────────────────────────────────── */}
      <section className="pt-12 px-4 pb-16">
        <div className="max-w-[1000px] mx-auto">
          <div className="grid grid-cols-[1fr_320px] gap-9">

            {/* ─ Colonne principale ─ */}
            <div className="min-w-0">

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
                  <h2 className="font-extrabold text-primary text-lg mb-0">
                    <Megaphone size={18} className="inline align-middle mr-2 text-primary" />
                    Annonces récentes
                  </h2>
                  {churchUrl && (
                    <a href={`${churchUrl}/c/annonces`} target="_blank" rel="noopener noreferrer" className="text-[13px] text-primary font-semibold no-underline">
                      Toutes les annonces →
                    </a>
                  )}
                </div>
                {annoncesList.length === 0 ? (
                  <p className="text-slate-400 text-sm italic py-4">Aucune annonce publiée pour cette paroisse.</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {annoncesList.map(annonce => (
                      <div key={annonce.id} className="px-5 py-[1.1rem] rounded-[10px] border border-border bg-slate-50">
                        <h4 className="font-bold text-foreground mb-1.5 text-[15px]">{annonce.titre}</h4>
                        <p className="text-muted-foreground text-sm leading-[1.6] mt-0 mb-2">{annonce.contenu}</p>
                        <p className="text-slate-400 text-xs">
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
                  <h2 className="font-extrabold text-primary text-lg mb-0">
                    <CalendarDays size={18} className="inline align-middle mr-2 text-primary" />
                    Prochains événements
                  </h2>
                  {churchUrl && (
                    <a href={`${churchUrl}/c/evenements`} target="_blank" rel="noopener noreferrer" className="text-[13px] text-primary font-semibold no-underline">
                      Tous les événements →
                    </a>
                  )}
                </div>
                {evenementsList.length === 0 ? (
                  <p className="text-slate-400 text-sm italic py-4">Aucun événement à venir pour cette paroisse.</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {evenementsList.map(evt => {
                      const d = new Date(evt.dateDebut);
                      return (
                        <div key={evt.id} className="px-5 py-[1.1rem] rounded-[10px] border border-border bg-slate-50 flex gap-4 items-start">
                          <div
                            className="shrink-0 w-[54px] h-[54px] rounded-[10px] flex flex-col items-center justify-center text-white"
                            style={{ background: "linear-gradient(135deg, #1e3a8a, #1e2d6b)" }}
                          >
                            <div className="text-xl font-black leading-none">{d.getDate()}</div>
                            <div className="text-[10px] font-semibold opacity-80 uppercase">{moisFR[d.getMonth()]}</div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-foreground mb-1 text-[15px]">{evt.titre}</h4>
                            {evt.lieu && (
                              <p className="text-muted-foreground text-[13px] mt-0 mb-[3px] flex items-center gap-1">
                                <MapPin size={12} /> {evt.lieu}
                              </p>
                            )}
                            {evt.description && (
                              <p className="text-slate-600 text-[13px] mt-1 mb-0 leading-normal">{evt.description}</p>
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
            <div className="flex flex-col gap-5">

              {/* Visiter la page dédiée */}
              {churchUrl && (
                <div
                  className="rounded-[14px] p-[1.4rem]"
                  style={{ background: "linear-gradient(135deg, #1e3a8a, #1e2d6b)" }}
                >
                  <div className="text-xs font-bold uppercase tracking-[0.08em] text-white/60 mb-2">
                    Page dédiée
                  </div>
                  <p className="text-white/80 text-[13px] mt-0 mb-3.5 leading-[1.6]">
                    Cette paroisse possède son propre espace en ligne avec son contenu et son équipe.
                  </p>
                  <a
                    href={churchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-[7px] py-2.5 rounded-lg w-full bg-secondary text-primary font-bold text-sm no-underline"
                  >
                    <ExternalLink size={14} />
                    Visiter {eglise.nom}
                  </a>
                </div>
              )}

              {/* Contact */}
              <div className="bg-slate-50 rounded-[14px] border border-border p-[1.4rem]">
                <h3 className="font-bold text-primary mb-3.5 text-[15px] mt-0">Informations de contact</h3>
                <div className="flex flex-col gap-3.5">
                  {eglise.pasteur && (
                    <div className="flex gap-2.5 items-start">
                      <User size={15} className="text-primary shrink-0 mt-px" />
                      <div>
                        <div className="text-[11px] text-slate-400 font-semibold uppercase mb-0.5 tracking-[0.06em]">Pasteur</div>
                        <div className="text-slate-700 font-semibold text-sm">{eglise.pasteur}</div>
                      </div>
                    </div>
                  )}
                  {eglise.adresse && (
                    <div className="flex gap-2.5 items-start">
                      <MapPin size={15} className="text-primary shrink-0 mt-px" />
                      <div>
                        <div className="text-[11px] text-slate-400 font-semibold uppercase mb-0.5 tracking-[0.06em]">Adresse</div>
                        <div className="text-slate-700 font-semibold text-sm">{eglise.adresse}</div>
                      </div>
                    </div>
                  )}
                  {eglise.telephone && (
                    <div className="flex gap-2.5 items-start">
                      <Phone size={15} className="text-primary shrink-0 mt-px" />
                      <div>
                        <div className="text-[11px] text-slate-400 font-semibold uppercase mb-0.5 tracking-[0.06em]">Téléphone</div>
                        <a href={`tel:${eglise.telephone}`} className="text-primary font-semibold text-sm no-underline">{eglise.telephone}</a>
                      </div>
                    </div>
                  )}
                  {eglise.email && (
                    <div className="flex gap-2.5 items-start">
                      <Mail size={15} className="text-primary shrink-0 mt-px" />
                      <div>
                        <div className="text-[11px] text-slate-400 font-semibold uppercase mb-0.5 tracking-[0.06em]">Email</div>
                        <a href={`mailto:${eglise.email}`} className="text-primary font-semibold text-sm no-underline break-all">{eglise.email}</a>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Horaires */}
              {config?.horaires && (
                <div className="bg-slate-50 rounded-[14px] border border-border p-[1.4rem]">
                  <h3 className="font-bold text-primary mb-3.5 text-[15px] mt-0">
                    <Clock size={15} className="inline align-middle mr-1.5 text-primary" />
                    Horaires de culte
                  </h3>
                  <p className="text-slate-600 text-sm leading-[1.75] m-0 whitespace-pre-line">{config.horaires}</p>
                </div>
              )}

              {/* Réseaux sociaux */}
              {hasSocial && (
                <div className="bg-slate-50 rounded-[14px] border border-border p-[1.4rem]">
                  <h3 className="font-bold text-primary mb-3.5 text-[15px] mt-0">Retrouvez-nous</h3>
                  <div className="flex flex-col gap-2.5">
                    {config?.siteWeb && (
                      <a href={config.siteWeb} target="_blank" rel="noopener noreferrer" className="flex items-center gap-[9px] text-slate-700 no-underline text-sm font-medium py-1.5 px-2.5 rounded-[7px] bg-white border border-border">
                        <Globe size={16} className="text-primary" /> Site web officiel
                      </a>
                    )}
                    {config?.facebook && (
                      <a href={config.facebook} target="_blank" rel="noopener noreferrer" className="flex items-center gap-[9px] text-slate-700 no-underline text-sm font-medium py-1.5 px-2.5 rounded-[7px] bg-white border border-border">
                        <Facebook size={16} color="#1877f2" /> Facebook
                      </a>
                    )}
                    {config?.youtube && (
                      <a href={config.youtube} target="_blank" rel="noopener noreferrer" className="flex items-center gap-[9px] text-slate-700 no-underline text-sm font-medium py-1.5 px-2.5 rounded-[7px] bg-white border border-border">
                        <Youtube size={16} color="#ff0000" /> YouTube
                      </a>
                    )}
                    {config?.instagram && (
                      <a href={config.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-[9px] text-slate-700 no-underline text-sm font-medium py-1.5 px-2.5 rounded-[7px] bg-white border border-border">
                        <Instagram size={16} color="#e1306c" /> Instagram
                      </a>
                    )}
                    {config?.twitter && (
                      <a href={config.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center gap-[9px] text-slate-700 no-underline text-sm font-medium py-1.5 px-2.5 rounded-[7px] bg-white border border-border">
                        <Twitter size={16} color="#1da1f2" /> Twitter / X
                      </a>
                    )}
                    {config?.whatsapp && (
                      <a href={`https://wa.me/${config.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-[9px] text-slate-700 no-underline text-sm font-medium py-1.5 px-2.5 rounded-[7px] bg-white border border-border">
                        <Phone size={16} color="#25d366" /> WhatsApp
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Toutes les paroisses */}
              <div className="text-center pt-1">
                <Link href="/paroisses" className="text-[13px] text-slate-400 no-underline font-medium">
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
