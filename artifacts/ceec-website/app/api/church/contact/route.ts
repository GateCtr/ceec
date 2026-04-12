import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/index";
import { sendContactEmail } from "@/lib/email";

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT_MAX = 3;

function getIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { egliseId: rawId, nom, email, telephone, sujet, message } = body;

    const egliseId = parseInt(String(rawId), 10);
    if (isNaN(egliseId)) {
      return NextResponse.json({ error: "Église introuvable" }, { status: 400 });
    }

    if (!nom || typeof nom !== "string" || nom.trim().length < 2) {
      return NextResponse.json({ error: "Nom requis (2 caractères minimum)" }, { status: 400 });
    }
    if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Adresse email invalide" }, { status: 400 });
    }
    if (!message || typeof message !== "string" || message.trim().length < 10) {
      return NextResponse.json({ error: "Message trop court (10 caractères minimum)" }, { status: 400 });
    }
    if (nom.length > 255 || email.length > 255 || message.length > 5000) {
      return NextResponse.json({ error: "Données trop longues" }, { status: 400 });
    }

    const config = await prisma.egliseConfig.findUnique({ where: { egliseId } });
    if (!config) {
      return NextResponse.json({ error: "Église introuvable" }, { status: 404 });
    }

    const ip = getIp(req);
    const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS);

    const recentCount = await prisma.messageContact.count({
      where: {
        configId: config.id,
        ipAdresse: ip,
        createdAt: { gte: windowStart },
      },
    });

    if (recentCount >= RATE_LIMIT_MAX) {
      return NextResponse.json(
        { error: "Trop de messages envoyés. Veuillez réessayer dans une heure." },
        { status: 429 }
      );
    }

    const stored = await prisma.messageContact.create({
      data: {
        configId: config.id,
        nom: nom.trim(),
        email: email.trim().toLowerCase(),
        telephone: telephone ? String(telephone).trim().slice(0, 30) : null,
        sujet: sujet ? String(sujet).trim().slice(0, 255) : null,
        message: message.trim(),
        ipAdresse: ip,
      },
    });

    const destinataire = config.contactEmailDestinataire;
    if (destinataire) {
      try {
        const emailResult = await sendContactEmail({
          to: destinataire,
          nom: stored.nom,
          emailExpediteur: stored.email,
          telephone: stored.telephone ?? undefined,
          sujet: stored.sujet ?? undefined,
          message: stored.message,
        });
        if (!emailResult.success) {
          console.error("[contact] Email send failed for message", stored.id, emailResult.error);
        }
      } catch (emailErr) {
        console.error("[contact] Email send threw for message", stored.id, emailErr);
      }
    }

    const confirmation =
      (config.contactMessageConfirmation as string | null) ??
      "Merci pour votre message ! Nous vous répondrons dans les plus brefs délais.";

    return NextResponse.json({ success: true, confirmation });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
