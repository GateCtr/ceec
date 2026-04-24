import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

/**
 * Retourne le filtre de visibilité pour les contenus publics.
 * - Visiteur non connecté : ["public"]
 * - Membre actif connecté : ["public", "communaute"]
 */
export async function getVisibiliteFilter(): Promise<string[]> {
  const { userId } = await auth();

  if (!userId) return ["public"];

  const member = await prisma.membre.findFirst({
    where: { clerkUserId: userId, statut: "actif" },
    select: { id: true },
  });

  return member ? ["public", "communaute"] : ["public"];
}
