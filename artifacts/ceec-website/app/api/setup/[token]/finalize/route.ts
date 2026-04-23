import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { isSuperAdmin, isAdminPlatteforme, isPlatformAdmin, getUserRoles } from "@/lib/auth/rbac";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL;
const DEV_DOMAIN = process.env.REPLIT_DEV_DOMAIN;

function buildRedirectUrl(slug: string): string {
  if (APP_URL && !DEV_DOMAIN) {
    const url = new URL(APP_URL);
    url.hostname = `${slug}.${url.hostname}`;
    return `${url.origin}/gestion`;
  }
  return `/gestion?eglise=${slug}`;
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Vous devez être connecté pour finaliser la configuration" },
        { status: 401 }
      );
    }

    const { token } = await params;

    const invite = await prisma.inviteToken.findUnique({
      where: { token },
      include: { eglise: true, role: true },
    });

    if (!invite) {
      return NextResponse.json({ error: "Token introuvable" }, { status: 404 });
    }

    if (invite.usedAt) {
      const slug = invite.eglise?.slug ?? null;
      return NextResponse.json(
        { error: "Ce lien a déjà été utilisé", slug, redirectUrl: slug ? buildRedirectUrl(slug) : null },
        { status: 410 }
      );
    }

    if (invite.expiresAt < new Date()) {
      return NextResponse.json({ error: "Ce lien a expiré" }, { status: 410 });
    }

    if (!invite.eglise || !invite.roleId) {
      return NextResponse.json({ error: "Configuration du token invalide" }, { status: 400 });
    }

    const client = await clerkClient();
    const clerkUser = await client.users.getUser(userId);
    const verifiedEmails = clerkUser.emailAddresses
      .filter((ea) => ea.verification?.status === "verified")
      .map((ea) => ea.emailAddress.toLowerCase());

    if (!verifiedEmails.includes(invite.email.toLowerCase())) {
      return NextResponse.json(
        {
          error: `Ce lien d'invitation est destiné à ${invite.email}. Connectez-vous avec cette adresse e-mail.`,
        },
        { status: 403 }
      );
    }

    await prisma.$transaction([
      prisma.inviteToken.update({
        where: { token },
        data: { usedAt: new Date() },
      }),

      prisma.userRole.upsert({
        where: {
          user_role_unique: {
            clerkUserId: userId,
            roleId: invite.roleId,
            egliseId: invite.eglise.id,
          },
        },
        update: {},
        create: {
          clerkUserId: userId,
          roleId: invite.roleId,
          egliseId: invite.eglise.id,
        },
      }),

      prisma.eglise.update({
        where: { id: invite.eglise.id },
        data: { statut: "actif" },
      }),

      prisma.membre.upsert({
        where: {
          membre_clerk_eglise_unique: {
            clerkUserId: userId,
            egliseId: invite.eglise.id,
          },
        },
        update: {},
        create: {
          clerkUserId: userId,
          nom: clerkUser.lastName ?? "",
          prenom: clerkUser.firstName ?? "",
          email: invite.email,
          egliseId: invite.eglise.id,
          statut: "actif",
        },
      }),
    ]);

    const slug = invite.eglise.slug;
    const egliseId = invite.eglise.id;

    // Synchroniser immédiatement les rôles dans les métadonnées Clerk
    // pour que le middleware reflète le nouveau rôle sans attendre une reconnexion.
    try {
      const [superAdmin, adminPlatteformeFlag, platformMember, userRoles] = await Promise.all([
        isSuperAdmin(userId),
        isAdminPlatteforme(userId),
        isPlatformAdmin(userId),
        getUserRoles(userId),
      ]);

      const churchRoles = userRoles
        .filter((ur) => ur.egliseId !== null && ur.role.scope === "church")
        .map((ur) => ({ egliseId: ur.egliseId as number, role: ur.role.nom }));

      const clerkMeta = await clerkClient();
      await clerkMeta.users.updateUserMetadata(userId, {
        publicMetadata: {
          isSuperAdmin: superAdmin,
          isAdminPlatteforme: adminPlatteformeFlag,
          isPlatformMember: platformMember,
          churchRoles,
        },
      });
    } catch (metaErr) {
      console.error("[setup/finalize] Erreur synchro metadata Clerk:", metaErr);
    }

    // Auto-create default home page if it doesn't exist yet
    const existingHome = await prisma.pageEglise.findFirst({
      where: { egliseId, type: "accueil" },
    });

    if (!existingHome) {
      const homePage = await prisma.pageEglise.create({
        data: {
          egliseId,
          titre: "Accueil",
          slug: "",
          type: "accueil",
          ordre: 0,
          publie: true,
        },
      });

      await prisma.sectionPage.createMany({
        data: [
          {
            pageId: homePage.id,
            type: "hero",
            ordre: 1,
            config: {
              titre: invite.eglise.nom ?? "Bienvenue",
              sousTitre: "",
              description: "Rejoignez notre communauté de foi.",
              ctaLabel1: "Rejoindre l'église",
              ctaHref1: "/c/inscription",
              ctaLabel2: "Nos événements",
              ctaHref2: "/c/evenements",
            },
          },
          {
            pageId: homePage.id,
            type: "annonces",
            ordre: 2,
            config: { titre: "Annonces", limite: "3" },
          },
          {
            pageId: homePage.id,
            type: "evenements",
            ordre: 3,
            config: { titre: "Événements à venir", limite: "3" },
          },
          {
            pageId: homePage.id,
            type: "contact",
            ordre: 4,
            config: { titre: "Contactez-nous" },
          },
        ],
      });
    }

    const redirectUrl = slug ? buildRedirectUrl(slug) : "/auth/redirect";

    return NextResponse.json({
      success: true,
      slug,
      egliseId,
      redirectUrl,
    });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
