import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { getVisibiliteFilter } from "@/lib/auth/visibility";
import Link from "next/link";
import { ChevronLeft, MapPin, Calendar, Clock, Tag, ExternalLink } from "lucide-react";
import type { Metadata } from "next";
import { SITE_URL, SITE_NAME } from "@/lib/seo";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const evt = await prisma.evenement
    .findUnique({
      where: { id: parseInt(id, 10) },
      select: { titre: true, description: true, imageUrl: true, dateDebut: true, lieu: true, eglise: { select: { nom: true } } },
    })
    .catch(() => null);
  if (!evt) return { title: "Événement" };
  const description =
    evt.description?.slice(0, 160) ??
    `Événement du ${new Date(evt.dateDebut).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}${evt.lieu ? ` à ${evt.lieu}` : ""} — ${SITE_NAME}`;
  return {
    title: evt.titre,
    description,
    openGraph: {
      title: `${evt.titre} | ${SITE_NAME}`,
      description,
      url: `${SITE_URL}/evenements/${id}`,
      type: "article",
      ...(evt.imageUrl ? { images: [{ url: evt.imageUrl, alt: evt.titre }] } : {}),
    },
    twitter: {
      card: evt.imageUrl ? ("summary_large_image" as const) : ("summary" as const),
      title: `${evt.titre} | ${SITE_NAME}`,
      description,
      ...(evt.imageUrl ? { images: [evt.imageUrl] } : {}),
    },
  };
}

export default async function EvenementDetailPage({ params }: Props) {
  const { id } = await params;
  const numId = parseInt(id, 10);
  if (isNaN(numId)) notFound();

  const visibiliteFilter = await getVisibiliteFilter();

  const evt = await prisma.evenement.findFirst({
    where: { id: numId, statutContenu: "publie", visibilite: { in: visibiliteFilter } },
  });
  if (!evt) notFound();

  const now = new Date();
  const isPast = new Date(evt.dateDebut) < now;

  const autres = await prisma.evenement.findMany({
    where: {
      id: { not: numId },
      statutContenu: "publie",
      visibilite: { in: visibiliteFilter },
      dateDebut: { gte: now },
    },
    orderBy: { dateDebut: "asc" },
    take: 3,
  });

  const formatDate = (d: Date | string) =>
    new Date(d).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const formatTime = (d: Date | string) =>
    new Date(d).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

  return (
    <main className="bg-primary-50 min-h-screen pt-20">
      <div className="max-w-[1100px] mx-auto px-4 pt-8 pb-20">

        {/* Back */}
        <Link href="/evenements" className="inline-flex items-center gap-1.5 text-muted-foreground text-sm no-underline mb-6">
          <ChevronLeft size={16} /> Tous les événements
        </Link>

        <div className={`grid ${autres.length > 0 ? "grid-cols-[1fr_300px]" : "grid-cols-1"} gap-8 items-start`}>

          {/* Main */}
          <div>
            <div className="bg-white rounded-2xl overflow-hidden shadow-md mb-4">
              {evt.imageUrl ? (
                <div className="relative">
                  <img src={evt.imageUrl} alt={evt.titre} className="w-full max-h-[400px] object-cover block" />
                  {isPast && (
                    <div className="absolute top-4 right-4 bg-black/60 text-white text-xs font-bold px-3 py-1 rounded-full">
                      Passé
                    </div>
                  )}
                </div>
              ) : null}
              {evt.videoUrl && (
                <div className="px-6 pt-6">
                  <video
                    src={evt.videoUrl}
                    controls
                    className="w-full rounded-[10px] block bg-black max-h-[400px]"
                  />
                </div>
              )}
              <div className="p-8">
                {isPast && !evt.imageUrl && (
                  <span className="inline-block text-[11px] font-bold px-2.5 py-[3px] rounded-full bg-slate-100 text-muted-foreground mb-3">
                    Événement passé
                  </span>
                )}
                <h1 className="text-[clamp(1.4rem,3vw,2rem)] font-extrabold text-foreground mb-5 leading-tight">
                  {evt.titre}
                </h1>

                {/* Info grid */}
                <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3 mb-6">
                  <div className="bg-primary-50 rounded-[10px] px-4 py-3">
                    <div className="flex items-center gap-1.5 text-primary font-bold text-[13px] mb-1">
                      <Calendar size={14} /> Date de début
                    </div>
                    <p className="text-foreground text-sm font-semibold m-0">{formatDate(evt.dateDebut)}</p>
                    <p className="text-muted-foreground text-[13px] m-0">{formatTime(evt.dateDebut)}</p>
                  </div>
                  {evt.dateFin && (
                    <div className="bg-primary-50 rounded-[10px] px-4 py-3">
                      <div className="flex items-center gap-1.5 text-primary font-bold text-[13px] mb-1">
                        <Clock size={14} /> Date de fin
                      </div>
                      <p className="text-foreground text-sm font-semibold m-0">{formatDate(evt.dateFin)}</p>
                      <p className="text-muted-foreground text-[13px] m-0">{formatTime(evt.dateFin)}</p>
                    </div>
                  )}
                  {evt.lieu && (
                    <div className="bg-primary-50 rounded-[10px] px-4 py-3">
                      <div className="flex items-center gap-1.5 text-primary font-bold text-[13px] mb-1">
                        <MapPin size={14} /> Lieu
                      </div>
                      <p className="text-foreground text-sm font-semibold m-0">{evt.lieu}</p>
                    </div>
                  )}
                  {evt.categorie && (
                    <div className="bg-primary-50 rounded-[10px] px-4 py-3">
                      <div className="flex items-center gap-1.5 text-primary font-bold text-[13px] mb-1">
                        <Tag size={14} /> Catégorie
                      </div>
                      <p className="text-foreground text-sm font-semibold m-0">{evt.categorie}</p>
                    </div>
                  )}
                </div>

                {evt.description && (
                  <div className="text-gray-700 text-base leading-[1.85] whitespace-pre-wrap">
                    {evt.description}
                  </div>
                )}

                {evt.lienInscription && !isPast && (
                  <div className="mt-7">
                    <a
                      href={evt.lienInscription}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-7 py-3 rounded-[10px] bg-primary text-white font-bold text-[15px] no-underline"
                    >
                      <ExternalLink size={16} /> S&apos;inscrire à l&apos;événement
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          {autres.length > 0 && (
            <aside>
              <h3 className="font-bold text-foreground text-[15px] mb-3.5">Prochains événements</h3>
              <div className="flex flex-col gap-3">
                {autres.map((a) => (
                  <Link key={a.id} href={`/evenements/${a.id}`} className="no-underline">
                    <div className="bg-white rounded-xl overflow-hidden border border-border shadow-xs flex gap-3 items-center p-3">
                      {a.imageUrl ? (
                        <img src={a.imageUrl} alt={a.titre} className="w-[52px] h-[52px] object-cover rounded-lg shrink-0" />
                      ) : (
                        <div style={{ background: "linear-gradient(135deg, #1e3a8a, #1e2d6b)" }} className="w-[52px] h-[52px] rounded-lg flex flex-col items-center justify-center text-white shrink-0">
                          <div className="text-base font-extrabold leading-none">{new Date(a.dateDebut).getDate()}</div>
                          <div className="text-[9px]">{new Date(a.dateDebut).toLocaleString("fr-FR", { month: "short" }).toUpperCase()}</div>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-foreground text-[13px] m-0 mb-[3px] leading-tight overflow-hidden text-ellipsis whitespace-nowrap">{a.titre}</p>
                        {a.lieu && <p className="text-muted-foreground text-[11px] m-0 overflow-hidden text-ellipsis whitespace-nowrap">{a.lieu}</p>}
                        <p className="text-slate-400 text-[11px] m-0">
                          {new Date(a.dateDebut).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </aside>
          )}
        </div>
      </div>
    </main>
  );
}
