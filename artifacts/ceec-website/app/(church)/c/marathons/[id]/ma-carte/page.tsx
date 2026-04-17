import { headers } from "next/headers";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import MaCarteClient from "./MaCarteClient";
import { computeMarathonDays, toDateString } from "@/lib/marathon-utils";

export default async function MaCartePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const headersList = await headers();
  const egliseIdHeader = headersList.get("x-eglise-id");
  if (!egliseIdHeader) redirect("/c");
  const egliseId = parseInt(egliseIdHeader, 10);

  const { userId } = await auth();
  if (!userId) redirect("/c/connexion");

  const { id } = await params;
  const marathonId = parseInt(id, 10);

  const membre = await prisma.membre.findFirst({
    where: { clerkUserId: userId, egliseId },
    select: { id: true, nom: true, prenom: true },
  });
  if (!membre) redirect("/c");

  const participant = await prisma.marathonParticipant.findFirst({
    where: { marathonId, membreId: membre.id, marathon: { egliseId } },
    include: {
      marathon: { include: { eglise: { select: { nom: true, logoUrl: true } } } },
    },
  });
  if (!participant) redirect(`/c/marathons/${marathonId}`);

  const marathon = participant.marathon;
  const allDays = computeMarathonDays(marathon.dateDebut, marathon.nombreJours, marathon.joursExclus);
  const dateFin = allDays[allDays.length - 1] ?? marathon.dateDebut;

  return (
    <MaCarteClient
      marathonId={marathonId}
      marathon={{
        titre: marathon.titre,
        theme: marathon.theme,
        referenceBiblique: marathon.referenceBiblique,
        denomination: marathon.denomination ?? marathon.eglise.nom,
        logoUrl: marathon.logoUrl ?? marathon.eglise.logoUrl,
        dateDebut: toDateString(marathon.dateDebut),
        dateFin: toDateString(dateFin),
      }}
      participant={{
        id: participant.id,
        nom: participant.nom,
        prenom: participant.prenom,
        email: participant.email,
        numeroId: participant.numeroId,
        qrToken: participant.qrToken,
      }}
    />
  );
}
