import { headers } from "next/headers";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/db";
import MembreMarathonDetailClient from "./MembreMarathonDetailClient";
import { computeMarathonDays, toDateString } from "@/lib/marathon-utils";

export default async function MembreMarathonDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const headersList = await headers();
  const egliseIdHeader = headersList.get("x-eglise-id");
  if (!egliseIdHeader) redirect("/c");
  const egliseId = parseInt(egliseIdHeader, 10);

  // Auth optionnelle — la page est publique, seule la participation est protégée
  const { userId } = await auth();
  const isConnected = !!userId;

  const { id } = await params;
  const marathonId = parseInt(id, 10);

  const membre = userId
    ? await prisma.membre.findFirst({
        where: { clerkUserId: userId, egliseId },
        select: { id: true, nom: true, prenom: true },
      })
    : null;

  const marathon = await prisma.marathon.findFirst({
    where: { id: marathonId, egliseId },
    include: { eglise: { select: { nom: true, logoUrl: true } } },
  });
  if (!marathon) redirect("/c/marathons");

  const allDays = computeMarathonDays(marathon.dateDebut, marathon.nombreJours, marathon.joursExclus);
  const dateFin = allDays[allDays.length - 1] ?? marathon.dateDebut;
  const today = new Date().toISOString().slice(0, 10);
  const joursEcoules = allDays.filter((d) => d.toISOString().slice(0, 10) <= today).length;
  const joursRestants = allDays.length - joursEcoules;

  const participant = membre
    ? await prisma.marathonParticipant.findFirst({
        where: { marathonId, membreId: membre.id },
        include: { presences: { orderBy: { numeroJour: "asc" } } },
      })
    : null;

  return (
    <>
      {/* Hero */}
      <section
        style={{
          background: marathon.logoUrl || marathon.eglise.logoUrl
            ? `linear-gradient(rgba(15,23,42,0.70), rgba(15,23,42,0.82)), url(${marathon.logoUrl ?? marathon.eglise.logoUrl}) center/cover no-repeat`
            : "linear-gradient(135deg, var(--church-primary, #1e3a8a), #1e2d6b)",
          color: "white", padding: "7rem 1rem 4rem", marginTop: -64,
        }}
      >
        <div style={{ maxWidth: 820, margin: "0 auto" }}>
          <Link
            href="/c/marathons"
            style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.75)", fontSize: 14, textDecoration: "none", marginBottom: 20 }}
          >
            <ArrowLeft size={14} /> Tous les marathons
          </Link>
          <h1 style={{ fontSize: "clamp(1.6rem,4vw,2.3rem)", fontWeight: 900, marginBottom: 8, lineHeight: 1.25 }}>
            {marathon.titre}
          </h1>
          {marathon.theme && (
            <p style={{ opacity: 0.8, fontSize: 15 }}>{marathon.theme}</p>
          )}
        </div>
      </section>

      <MembreMarathonDetailClient
        marathon={{
          id: marathon.id, titre: marathon.titre, theme: marathon.theme,
          referenceBiblique: marathon.referenceBiblique, dateDebut: marathon.dateDebut.toISOString(),
          dateFin: dateFin.toISOString(), nombreJours: marathon.nombreJours,
          statut: marathon.statut, denomination: marathon.denomination ?? marathon.eglise.nom,
          logoUrl: marathon.logoUrl ?? marathon.eglise.logoUrl,
          joursExclus: marathon.joursExclus,
        }}
        joursEcoules={joursEcoules}
        joursRestants={joursRestants}
        participant={participant ? {
          id: participant.id, nom: participant.nom, prenom: participant.prenom,
          email: participant.email, numeroId: participant.numeroId, qrToken: participant.qrToken,
          presences: participant.presences.map((p) => ({
            numeroJour: p.numeroJour, statut: p.statut, date: p.date.toISOString(),
          })),
        } : null}
        membreId={membre?.id ?? null}
        isConnected={isConnected}
      />
    </>
  );
}
