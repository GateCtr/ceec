import { headers } from "next/headers";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
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
  );
}
