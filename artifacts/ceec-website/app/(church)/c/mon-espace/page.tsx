import { auth, clerkClient } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/index";
import { getMemberChurchRole } from "@/lib/membre-role";
import MonEspaceClient from "@/components/church/MonEspaceClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Mon espace" };

export default async function MonEspacePage() {
  const { userId } = await auth();
  if (!userId) redirect("/c/connexion");

  const headersList = await headers();
  const slug = headersList.get("x-eglise-slug");
  if (!slug) redirect("/");

  const eglise = await prisma.eglise.findUnique({
    where: { slug },
    select: { id: true, nom: true, slug: true },
  });
  if (!eglise) redirect("/");

  const membre = await prisma.membre.findFirst({
    where: { clerkUserId: userId, egliseId: eglise.id },
    include: {
      participations: {
        include: {
          evenement: {
            select: {
              id: true, titre: true, dateDebut: true, lieu: true, imageUrl: true, statutContenu: true,
            },
          },
        },
        orderBy: { evenement: { dateDebut: "asc" } },
      },
    },
  });

  if (!membre) {
    redirect("/sign-up");
  }

  const [clerk, roleNom] = await Promise.all([
    clerkClient().then((c) => c.users.getUser(userId).catch(() => null)),
    getMemberChurchRole(userId, eglise.id),
  ]);

  const photoUrl = clerk?.imageUrl ?? null;

  const maintenant = new Date();
  const evenementsInscrits = membre.participations
    .filter((p) => p.evenement.statutContenu === "publie")
    .map((p) => ({
      id: p.evenement.id,
      titre: p.evenement.titre,
      dateDebut: p.evenement.dateDebut.toISOString(),
      lieu: p.evenement.lieu,
      imageUrl: p.evenement.imageUrl,
      aVenir: new Date(p.evenement.dateDebut) >= maintenant,
    }));

  const annonces = await prisma.annonce.findMany({
    where: { egliseId: eglise.id, statutContenu: "publie" },
    orderBy: { datePublication: "desc" },
    take: 20,
    select: {
      id: true, titre: true, contenu: true, priorite: true,
      datePublication: true, imageUrl: true, categorie: true,
    },
  });

  const profilData = {
    id: membre.id,
    nom: membre.nom,
    prenom: membre.prenom,
    email: membre.email,
    telephone: membre.telephone,
    role: roleNom,
    statut: membre.statut,
    dateAdhesion: membre.dateAdhesion?.toISOString() ?? null,
    createdAt: membre.createdAt.toISOString(),
    photoUrl,
  };

  const annoncesData = annonces.map((a) => ({
    id: a.id,
    titre: a.titre,
    contenu: a.contenu,
    priorite: a.priorite,
    datePublication: a.datePublication.toISOString(),
    imageUrl: a.imageUrl,
    categorie: a.categorie,
  }));

  return (
    <MonEspaceClient
      profil={profilData}
      evenementsInscrits={evenementsInscrits}
      annonces={annoncesData}
      eglise={{ nom: eglise.nom, slug: eglise.slug ?? slug }}
    />
  );
}
