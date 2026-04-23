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

  // Auth optionnelle — la page est publique, seule la participation est protégée
  const { userId } = await auth();
  const isConnected = !!userId;

  const membre = userId
    ? await prisma.membre.findFirst({
        where: { clerkUserId: userId, egliseId },
        select: { id: true },
      })
    : null;

  const marathons = await prisma.marathon.findMany({
    where: { egliseId },
    orderBy: { dateDebut: "desc" },
    include: { _count: { select: { participants: true } } },
  });

  const mesMarathonIds = membre
    ? new Set(
        (
          await prisma.marathonParticipant.findMany({
            where: { membreId: membre.id },
            select: { marathonId: true },
          })
        ).map((i) => i.marathonId)
      )
    : new Set<number>();

  return (
    <MembreMarathonsClient
      marathons={marathons.map((m) => ({
        id: m.id, titre: m.titre, theme: m.theme, dateDebut: m.dateDebut.toISOString(),
        nombreJours: m.nombreJours, statut: m.statut,
        nbParticipants: m._count.participants,
        inscrit: mesMarathonIds.has(m.id),
      }))}
      egliseId={egliseId}
      isConnected={isConnected}
      isMembre={!!membre}
    />
  );
}
