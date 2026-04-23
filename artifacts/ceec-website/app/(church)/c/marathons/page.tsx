import { headers } from "next/headers";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import MembreMarathonsClient from "./MembreMarathonsClient";

export const metadata = { title: "Marathons | Espace membre" };

export default async function MembreMarathonsPage() {
  const headersList = await headers();
  const egliseIdHeader = headersList.get("x-eglise-id");
  const egliseSlug = headersList.get("x-eglise-slug");
  if (!egliseIdHeader) redirect("/c");
  const egliseId = parseInt(egliseIdHeader, 10);

  const eglise = egliseSlug
    ? await prisma.eglise.findUnique({ where: { slug: egliseSlug }, select: { nom: true } })
    : null;

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
    <>
      {/* Hero */}
      <section
        style={{
          background: "linear-gradient(135deg, var(--church-primary, #1e3a8a), #1e2d6b)",
          color: "white", padding: "7rem 1rem 4rem", textAlign: "center",
          marginTop: -64,
        }}
      >
        <h1 style={{ fontSize: "clamp(1.8rem,4vw,2.5rem)", fontWeight: 900, marginBottom: 10 }}>
          Marathons de prière
        </h1>
        <p style={{ opacity: 0.8, fontSize: 15 }}>
          Retraites spirituelles {eglise ? `de ${eglise.nom}` : "de votre église"}
        </p>
      </section>

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
    </>
  );
}
