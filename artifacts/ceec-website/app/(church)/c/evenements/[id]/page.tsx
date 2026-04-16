import { auth } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, Timer, MapPin, Users, CalendarDays, Tag, ExternalLink } from "lucide-react";
import type { Metadata } from "next";
import { prisma } from "@/lib/db/index";
import ParticipationButton from "@/components/church/ParticipationButton";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: "Événement" };
}

export default async function EvenementDetailPage({ params }: Props) {
  const headersList = await headers();
  const slug = headersList.get("x-eglise-slug");
  if (!slug) redirect("/");

  const { id } = await params;
  const evtId = parseInt(id, 10);
  if (isNaN(evtId)) notFound();

  const { userId } = await auth();

  const eglise = await prisma.eglise.findUnique({ where: { slug } });
  if (!eglise) notFound();

  let visibiliteFilter: string[] = ["public"];
  if (userId) {
    const [memberOfThis, memberOfAny] = await Promise.all([
      prisma.membre.findFirst({ where: { clerkUserId: userId, egliseId: eglise.id, statut: "actif" } }),
      prisma.membre.findFirst({ where: { clerkUserId: userId, statut: "actif" } }),
    ]);
    if (memberOfThis) {
      visibiliteFilter = ["public", "communaute", "prive"];
    } else if (memberOfAny) {
      visibiliteFilter = ["public", "communaute"];
    }
  }

  const evt = await prisma.evenement.findFirst({
    where: { id: evtId, egliseId: eglise.id, statutContenu: "publie", visibilite: { in: visibiliteFilter } },
  });
  if (!evt) notFound();

  const isUpcoming = new Date(evt.dateDebut) >= new Date();

  // Check membership and participation in parallel
  const [membre, participation] = await Promise.all([
    userId
      ? prisma.membre.findFirst({ where: { clerkUserId: userId, egliseId: eglise.id }, select: { id: true } })
      : Promise.resolve(null),
    userId
      ? prisma.participation.findFirst({
          where: {
            evenementId: evtId,
            membre: { clerkUserId: userId, egliseId: eglise.id },
          },
        })
      : Promise.resolve(null),
  ]);

  const isMembre = !!membre;
  const initialParticipe = !!participation;

  // Other upcoming events (respect same visibility filter)
  const autres = await prisma.evenement.findMany({
    where: {
      egliseId: eglise.id,
      statutContenu: "publie",
      visibilite: { in: visibiliteFilter },
      id: { not: evtId },
      dateDebut: { gte: new Date() },
    },
    orderBy: { dateDebut: "asc" },
    take: 3,
  });

  // Count participants
  const nbParticipants = await prisma.participation.count({ where: { evenementId: evtId } });

  return (
    <>
      {/* Header */}
      <section
        style={{
          background: evt.imageUrl
            ? `linear-gradient(rgba(15,23,42,0.65), rgba(15,23,42,0.75)), url(${evt.imageUrl}) center/cover no-repeat`
            : "linear-gradient(135deg, var(--church-primary, #1e3a8a), #1e2d6b)",
          color: "white", padding: "5rem 1rem",
        }}
      >
        <div style={{ maxWidth: 820, margin: "0 auto" }}>
          <Link href="/c/evenements" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.75)", fontSize: 14, textDecoration: "none", marginBottom: 20 }}>
            <ArrowLeft size={14} /> Tous les événements
          </Link>
          {!isUpcoming && (
            <span style={{ display: "inline-block", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99, background: "rgba(255,255,255,0.15)", marginBottom: 12, marginLeft: 0 }}>
              Événement passé
            </span>
          )}
          <h1 style={{ fontSize: "clamp(1.75rem,4vw,2.5rem)", fontWeight: 900, marginBottom: 16, lineHeight: 1.2 }}>
            {evt.titre}
          </h1>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap", fontSize: 14, opacity: 0.85 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <Clock size={14} />
              {new Date(evt.dateDebut).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              {" "}à{" "}
              {new Date(evt.dateDebut).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
            </span>
            {evt.dateFin && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <Timer size={14} /> Jusqu&apos;au {new Date(evt.dateFin).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
              </span>
            )}
            {evt.lieu && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <MapPin size={14} /> {evt.lieu}
              </span>
            )}
            {nbParticipants > 0 && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <Users size={14} /> {nbParticipants} participant{nbParticipants > 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>
      </section>

      <section style={{ padding: "3rem 1rem 5rem", background: "#f8fafc" }}>
        <div style={{ maxWidth: 820, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: autres.length > 0 ? "1fr 280px" : "1fr", gap: "2rem", alignItems: "start" }}>
            {/* Main content */}
            <div>
              <div style={{ background: "white", borderRadius: 16, padding: "2rem", boxShadow: "0 2px 12px rgba(0,0,0,0.07)", marginBottom: 16 }}>
                {evt.description ? (
                  <div style={{ fontSize: 15, lineHeight: 1.85, color: "#334155", whiteSpace: "pre-wrap" }}>
                    {evt.description}
                  </div>
                ) : (
                  <p style={{ color: "#94a3b8", fontStyle: "italic" }}>Aucune description pour cet événement.</p>
                )}
              </div>

              {/* Meta card */}
              <div style={{ background: "white", borderRadius: 16, padding: "1.5rem", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                <h3 style={{ fontWeight: 700, color: "var(--church-primary, #1e3a8a)", fontSize: 15, margin: "0 0 14px" }}>
                  Informations
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 14, color: "#475569" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <CalendarDays size={15} style={{ flexShrink: 0 }} />
                    {new Date(evt.dateDebut).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Clock size={15} style={{ flexShrink: 0 }} />
                    {new Date(evt.dateDebut).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                    {evt.dateFin && ` – ${new Date(evt.dateFin).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`}
                  </div>
                  {evt.lieu && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <MapPin size={15} style={{ flexShrink: 0 }} />{evt.lieu}
                    </div>
                  )}
                  {evt.categorie && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Tag size={15} style={{ flexShrink: 0 }} />{evt.categorie}
                    </div>
                  )}
                  {nbParticipants > 0 && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Users size={15} style={{ flexShrink: 0 }} />{nbParticipants} participant{nbParticipants > 1 ? "s" : ""}
                    </div>
                  )}

                  {/* Participation button — only for upcoming events */}
                  {isUpcoming && (
                    <div style={{ marginTop: 8 }}>
                      <ParticipationButton
                        evenementId={evtId}
                        initialParticipe={initialParticipe}
                        isSignedIn={!!userId}
                        isMembre={isMembre}
                      />
                    </div>
                  )}

                  {evt.lienInscription && (
                    <a
                      href={evt.lienInscription}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "inline-block", marginTop: 8,
                        padding: "10px 20px", borderRadius: 8,
                        background: "var(--church-primary, #1e3a8a)", color: "white",
                        fontWeight: 700, fontSize: 14, textDecoration: "none",
                      }}
                    >
                      S&apos;inscrire à cet événement <ExternalLink size={13} style={{ marginLeft: 4 }} />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar: upcoming events */}
            {autres.length > 0 && (
              <div>
                <h3 style={{ fontWeight: 700, color: "var(--church-primary, #1e3a8a)", fontSize: 15, marginBottom: 14 }}>
                  Autres événements
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {autres.map((a) => (
                    <Link key={a.id} href={`/c/evenements/${a.id}`} style={{ textDecoration: "none" }}>
                      <div style={{ background: "white", borderRadius: 12, overflow: "hidden", border: "1px solid #e2e8f0", display: "flex" }}>
                        <div style={{
                          width: 60, flexShrink: 0,
                          background: "linear-gradient(135deg, var(--church-primary, #1e3a8a), #1e2d6b)",
                          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                          color: "white", padding: "0.5rem",
                        }}>
                          <div style={{ fontSize: 18, fontWeight: 900, lineHeight: 1 }}>{new Date(a.dateDebut).getDate()}</div>
                          <div style={{ fontSize: 10, opacity: 0.8 }}>{new Date(a.dateDebut).toLocaleString("fr-FR", { month: "short" }).toUpperCase()}</div>
                        </div>
                        <div style={{ padding: "0.75rem", flex: 1 }}>
                          <div style={{ fontWeight: 600, color: "#0f172a", fontSize: 13, lineHeight: 1.3 }}>{a.titre}</div>
                          {a.lieu && <div style={{ color: "#94a3b8", fontSize: 11, marginTop: 3 }}>{a.lieu}</div>}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div style={{ marginTop: 32, textAlign: "center" }}>
            <Link
              href="/c/evenements"
              style={{
                padding: "12px 28px", borderRadius: 10, background: "var(--church-primary, #1e3a8a)",
                color: "white", fontWeight: 700, fontSize: 14, textDecoration: "none",
                display: "inline-flex", alignItems: "center", gap: 8,
              }}
            >
              <ArrowLeft size={15} /> Retour aux événements
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
