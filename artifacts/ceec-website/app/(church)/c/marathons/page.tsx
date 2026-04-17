import { headers } from "next/headers";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import MembreMarathonsClient from "./MembreMarathonsClient";

export const metadata = { title: "Marathons | Espace membre" };

export default async function MembreMarathonsPage() {
  const headersList = await headers();
  const egliseIdHeader = headersList.get("x-eglise-id");
  if (!egliseIdHeader) redirect("/c");
  const egliseId = parseInt(egliseIdHeader, 10);

  const { userId } = await auth();
  if (!userId) redirect("/c/connexion");

  const membre = await prisma.membre.findFirst({
    where: { clerkUserId: userId, egliseId },
    select: { id: true },
  });
  if (!membre) redirect("/c");

  const marathons = await prisma.marathon.findMany({
    where: { egliseId },
    orderBy: { dateDebut: "desc" },
    include: { _count: { select: { participants: true } } },
  });

  const mesInscriptions = await prisma.marathonParticipant.findMany({
    where: { membreId: membre.id },
    select: { marathonId: true },
  });
  const mesMarathonIds = new Set(mesInscriptions.map((i) => i.marathonId));

  return (
    <MembreMarathonsClient
      marathons={marathons.map((m) => ({
        id: m.id, titre: m.titre, theme: m.theme, dateDebut: m.dateDebut.toISOString(),
        nombreJours: m.nombreJours, statut: m.statut,
        nbParticipants: m._count.participants,
        inscrit: mesMarathonIds.has(m.id),
      }))}
      egliseId={egliseId}
    />
  );
}
