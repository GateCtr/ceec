import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { sendNewMemberEmail, getChurchStaffEmails } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));

    const headersList = await headers();
    const slugFromHeader = headersList.get("x-eglise-slug");
    const slugFromCookie = req.cookies.get("ceec_church_slug")?.value;
    const slug: string | undefined = body.egliseSlug || slugFromHeader || slugFromCookie;

    if (!slug) {
      return NextResponse.json({ error: "Contexte d'église introuvable" }, { status: 400 });
    }

    const eglise = await prisma.eglise.findUnique({
      where: { slug },
      select: { id: true, statut: true },
    });

    if (!eglise || eglise.statut !== "actif") {
      return NextResponse.json({ error: "Église introuvable ou inactive" }, { status: 404 });
    }

    const egliseId = eglise.id;

    const fideleRole = await prisma.role.findFirst({ where: { nom: "fidele" } });

    let isNewMember = false;
    let membreEmail = "";
    let membrePrenom = "";
    let membreNom = "";

    await prisma.$transaction(async (tx) => {
      const existing = await tx.membre.findFirst({
        where: { clerkUserId: userId, egliseId },
      });
      isNewMember = !existing;

      const upserted = await tx.membre.upsert({
        where: { membre_clerk_eglise_unique: { clerkUserId: userId, egliseId } },
        update: {},
        create: {
          clerkUserId: userId,
          nom: body.nom ?? "",
          prenom: body.prenom ?? "",
          email: body.email ?? "",
          egliseId,
          statut: "actif",
        },
      });

      membreEmail = upserted.email;
      membrePrenom = upserted.prenom;
      membreNom = upserted.nom;

      if (fideleRole) {
        await tx.userRole.upsert({
          where: {
            user_role_unique: { clerkUserId: userId, roleId: fideleRole.id, egliseId },
          },
          update: {},
          create: { clerkUserId: userId, roleId: fideleRole.id, egliseId },
        });
      }
    });

    if (isNewMember && membreEmail) {
      const egliseWithNom = await prisma.eglise.findUnique({ where: { id: egliseId }, select: { nom: true } });
      void (async () => {
        try {
          const staffEmails = await getChurchStaffEmails(egliseId);
          if (staffEmails.length > 0 && egliseWithNom) {
            await sendNewMemberEmail(staffEmails, membrePrenom, membreNom, membreEmail, egliseWithNom.nom);
          }
        } catch (err) {
          console.error("Email notification error:", err);
        }
      })();
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
