import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { prisma } from "@/lib/db";

type ClerkUserEvent = {
  type: string;
  data: {
    id: string;
    email_addresses: Array<{ email_address: string; id: string }>;
    primary_email_address_id: string;
    first_name: string | null;
    last_name: string | null;
  };
};

function getPrimaryEmail(data: ClerkUserEvent["data"]): string {
  const primary = data.email_addresses.find(
    (e) => e.id === data.primary_email_address_id
  );
  return primary?.email_address ?? data.email_addresses[0]?.email_address ?? "";
}

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json(
      { error: "Webhook secret non configuré" },
      { status: 500 }
    );
  }

  const svixId = req.headers.get("svix-id");
  const svixTimestamp = req.headers.get("svix-timestamp");
  const svixSignature = req.headers.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "Headers manquants" }, { status: 400 });
  }

  const payload = await req.text();

  const wh = new Webhook(webhookSecret);
  let event: ClerkUserEvent;
  try {
    event = wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkUserEvent;
  } catch {
    return NextResponse.json({ error: "Signature invalide" }, { status: 400 });
  }

  const { type, data } = event;

  try {
    if (type === "user.created") {
      const email = getPrimaryEmail(data);
      const nom = data.last_name ?? "";
      const prenom = data.first_name ?? "";

      const existing = await prisma.membre.findFirst({
        where: { clerkUserId: data.id, egliseId: null },
      });

      if (!existing) {
        await prisma.membre.create({
          data: {
            clerkUserId: data.id,
            email,
            nom,
            prenom,
            role: "fidele",
            statut: "actif",
          },
        });
      }
    }

    if (type === "user.updated") {
      const email = getPrimaryEmail(data);
      const nom = data.last_name ?? "";
      const prenom = data.first_name ?? "";

      await prisma.membre.updateMany({
        where: { clerkUserId: data.id },
        data: { email, nom, prenom },
      });
    }

    if (type === "user.deleted") {
      await prisma.membre.updateMany({
        where: { clerkUserId: data.id },
        data: { statut: "inactif" },
      });
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[webhook/clerk] Erreur:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
