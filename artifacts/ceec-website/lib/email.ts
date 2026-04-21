import { prisma } from "@/lib/db";

const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL ??
  (process.env.REPLIT_DEV_DOMAIN
    ? `https://${process.env.REPLIT_DEV_DOMAIN}`
    : "http://localhost:3000");

function buildInviteLink(token: string) {
  return `${BASE_URL}/setup/${token}`;
}

// ─── Shared send helper ───────────────────────────────────────────────────────

async function sendEmail(
  to: string | string[],
  subject: string,
  html: string
): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const toList = Array.isArray(to) ? to.join(", ") : to;

  if (!apiKey) {
    console.log("=== EMAIL (Resend non configuré — console) ===");
    console.log(`À : ${toList}`);
    console.log(`Objet : ${subject}`);
    console.log("================================================");
    return { success: true };
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: "CEEC Platform <noreply@ceec-rdc.org>",
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error("Email send failed:", err);
    return { success: false, error: String(err) };
  }
}

// ─── Base HTML wrapper ────────────────────────────────────────────────────────

function emailWrapper(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Arial,sans-serif">
  <div style="max-width:580px;margin:40px auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
    <div style="background:linear-gradient(135deg,#1e3a8a,#1e2d6b);padding:32px 40px;text-align:center">
      <div style="font-size:12px;color:#fcd34d;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:10px">CEEC — Communauté Évangélique</div>
      <h1 style="color:white;margin:0;font-size:22px;font-weight:800;line-height:1.3">${title}</h1>
    </div>
    <div style="padding:32px 40px">${body}</div>
    <div style="background:#f8fafc;padding:18px 40px;text-align:center;border-top:1px solid #e2e8f0">
      <p style="color:#94a3b8;font-size:12px;margin:0">CEEC — Communauté des Églises Évangéliques du Congo</p>
    </div>
  </div>
</body>
</html>`;
}

function p(text: string) {
  return `<p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 14px">${text}</p>`;
}

function callout(color: string, bg: string, text: string) {
  return `<div style="background:${bg};border-left:4px solid ${color};border-radius:8px;padding:14px 18px;margin:20px 0"><p style="color:${color};font-size:14px;line-height:1.6;margin:0">${text}</p></div>`;
}

function cta(href: string, label: string) {
  return `<div style="text-align:center;margin:28px 0"><a href="${href}" style="display:inline-block;background:#1e3a8a;color:white;padding:14px 36px;border-radius:10px;font-size:15px;font-weight:700;text-decoration:none">${label} →</a></div>`;
}

// ─── Helpers : find recipients ────────────────────────────────────────────────

export async function getChurchStaffEmails(egliseId: number): Promise<string[]> {
  const staffRoles = ["admin_eglise", "pasteur", "secretaire"];
  const userRoles = await prisma.userRole.findMany({
    where: { egliseId, role: { nom: { in: staffRoles } } },
    select: { clerkUserId: true },
  });
  if (userRoles.length === 0) return [];

  const clerkIds = [...new Set(userRoles.map((ur) => ur.clerkUserId))];
  const membres = await prisma.membre.findMany({
    where: { clerkUserId: { in: clerkIds }, egliseId },
    select: { email: true },
  });
  return membres.map((m) => m.email).filter(Boolean);
}

export async function getSuperAdminEmails(): Promise<string[]> {
  try {
    const userRoles = await prisma.userRole.findMany({
      where: { role: { nom: "super_admin" }, egliseId: null },
      select: { clerkUserId: true },
    });
    if (userRoles.length === 0) return [];

    const { clerkClient } = await import("@clerk/nextjs/server");
    const clerk = await clerkClient();
    const emails: string[] = [];
    for (const ur of userRoles) {
      try {
        const user = await clerk.users.getUser(ur.clerkUserId);
        const email = user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)?.emailAddress;
        if (email) emails.push(email);
      } catch {
        // skip
      }
    }
    return emails;
  } catch {
    return [];
  }
}

// ─── Template 1 : Invitation (admin setup) ───────────────────────────────────

export async function sendInviteEmail(
  to: string,
  token: string,
  egliseNom: string
): Promise<{ success: boolean; error?: string }> {
  const inviteLink = buildInviteLink(token);
  const html = emailWrapper(
    "Invitation à rejoindre la plateforme",
    p("Bonjour,") +
    p(`Vous avez été désigné(e) comme administrateur principal de l'église <strong style="color:#1e3a8a">${egliseNom}</strong> sur la plateforme CEEC.`) +
    p("Cliquez sur le bouton ci-dessous pour créer votre compte et configurer votre espace de gestion d'église.") +
    cta(inviteLink, "Configurer mon espace") +
    `<p style="color:#94a3b8;font-size:13px;line-height:1.6;margin:0">Ce lien est valable 7 jours. Si vous n'avez pas demandé cette invitation, vous pouvez ignorer cet email.</p>
     <hr style="border:none;border-top:1px solid #f1f5f9;margin:24px 0">
     <p style="color:#94a3b8;font-size:12px;text-align:center;margin:0">Lien direct : <a href="${inviteLink}" style="color:#1e3a8a">${inviteLink}</a></p>`
  );
  return sendEmail(to, `Invitation — Configurez l'espace de ${egliseNom} sur CEEC`, html);
}

// ─── Template 2 : Contenu approuvé ───────────────────────────────────────────

export async function sendContentApprovedEmail(
  to: string,
  contenuTitre: string,
  type: "annonce" | "evenement",
  egliseNom: string
): Promise<{ success: boolean; error?: string }> {
  const label = type === "annonce" ? "annonce" : "événement";
  const html = emailWrapper(
    `Votre ${label} a été approuvé(e) ✓`,
    p("Bonjour,") +
    p(`Bonne nouvelle ! Votre ${label} <strong style="color:#1e3a8a">${contenuTitre}</strong> pour l'église <strong>${egliseNom}</strong> a été <strong style="color:#16a34a">approuvé(e)</strong> par l'administration.`) +
    callout("#16a34a", "#dcfce7", `Votre ${label} est maintenant visible sur la page publique de votre église.`) +
    p("Merci pour votre contribution à la vie de votre communauté.")
  );
  return sendEmail(to, `✓ ${label.charAt(0).toUpperCase() + label.slice(1)} approuvé(e) — ${egliseNom}`, html);
}

// ─── Template 3 : Contenu rejeté ─────────────────────────────────────────────

export async function sendContentRejectedEmail(
  to: string,
  contenuTitre: string,
  type: "annonce" | "evenement",
  egliseNom: string,
  commentaire?: string | null
): Promise<{ success: boolean; error?: string }> {
  const label = type === "annonce" ? "annonce" : "événement";
  const html = emailWrapper(
    `Votre ${label} n'a pas été publié(e)`,
    p("Bonjour,") +
    p(`Votre ${label} <strong style="color:#1e3a8a">${contenuTitre}</strong> pour l'église <strong>${egliseNom}</strong> a été <strong style="color:#dc2626">refusé(e)</strong> par l'administration.`) +
    (commentaire ? callout("#b91c1c", "#fee2e2", `<strong>Motif du rejet :</strong> ${commentaire}`) : "") +
    p("Vous pouvez modifier votre contenu et le resoumettre depuis votre espace de gestion.") +
    p("Si vous pensez qu'il s'agit d'une erreur, veuillez contacter l'administration.")
  );
  return sendEmail(to, `Votre ${label} n'a pas été publié(e) — ${egliseNom}`, html);
}

// ─── Template 4 : Nouveau membre (notif au staff) ────────────────────────────

export async function sendNewMemberEmail(
  to: string | string[],
  membrePrenom: string,
  membreNom: string,
  membreEmail: string,
  egliseNom: string
): Promise<{ success: boolean; error?: string }> {
  const toArr = Array.isArray(to) ? to : [to];
  if (toArr.length === 0) return { success: true };
  const html = emailWrapper(
    `Nouveau membre — ${egliseNom}`,
    p("Bonjour,") +
    p(`Un nouveau fidèle vient de rejoindre l'église <strong style="color:#1e3a8a">${egliseNom}</strong> sur la plateforme CEEC.`) +
    callout("#1e3a8a", "#eff6ff",
      `<strong>Nom :</strong> ${membrePrenom} ${membreNom}<br><strong>Email :</strong> <a href="mailto:${membreEmail}" style="color:#1e3a8a">${membreEmail}</a>`
    ) +
    p("Vous pouvez consulter la liste complète de vos membres depuis votre espace de gestion.")
  );
  return sendEmail(toArr, `Nouveau membre — ${egliseNom}`, html);
}

// ─── Template 5 : Confirmation inscription événement (pour le membre) ─────────

export async function sendParticipationConfirmationEmail(
  to: string,
  membrePrenom: string,
  evenementTitre: string,
  dateDebut: Date,
  lieu?: string | null,
  egliseNom?: string
): Promise<{ success: boolean; error?: string }> {
  const dateStr = dateDebut.toLocaleDateString("fr-FR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
  const heureStr = dateDebut.toLocaleTimeString("fr-FR", {
    hour: "2-digit", minute: "2-digit",
  });
  const html = emailWrapper(
    "Inscription confirmée ✓",
    p(`Bonjour ${membrePrenom},`) +
    p(`Votre inscription à l'événement <strong style="color:#1e3a8a">${evenementTitre}</strong>${egliseNom ? ` (${egliseNom})` : ""} est bien enregistrée.`) +
    callout("#1e3a8a", "#eff6ff",
      `📅 <strong>Date :</strong> ${dateStr} à ${heureStr}` +
      (lieu ? `<br>📍 <strong>Lieu :</strong> ${lieu}` : "")
    ) +
    p("Nous avons hâte de vous accueillir ! Si vous ne pouvez plus participer, annulez depuis votre espace membre.")
  );
  return sendEmail(to, `Inscription confirmée — ${evenementTitre}`, html);
}

// ─── Template 6 : Nouvelle église créée (pour les super admins) ──────────────

export async function sendNewChurchNotificationEmail(
  to: string | string[],
  egliseNom: string,
  ville: string,
  emailAdmin: string
): Promise<{ success: boolean; error?: string }> {
  const toArr = Array.isArray(to) ? to : [to];
  if (toArr.length === 0) return { success: true };
  const html = emailWrapper(
    "Nouvelle église — En attente de validation",
    p("Bonjour,") +
    p("Une nouvelle église vient d'être créée sur la plateforme CEEC et est en attente de validation.") +
    callout("#c59b2e", "#fefce8",
      `<strong>Nom :</strong> ${egliseNom}<br><strong>Ville :</strong> ${ville}<br><strong>Email admin :</strong> ${emailAdmin}`
    ) +
    p("Un email d'invitation a été envoyé à l'administrateur désigné. L'église est au statut <em>En attente</em>.") +
    cta(`${BASE_URL}/admin/eglises`, "Voir les églises")
  );
  return sendEmail(toArr, `Nouvelle église — ${egliseNom} (${ville})`, html);
}

// ─── Template 7 : Alerte présence marathon ───────────────────────────────────

export async function sendMarathonAlertEmail({
  to,
  marathonTitre,
  numeroJour,
  scanned,
  expected,
  taux,
  seuil,
  marathonId,
}: {
  to: string | string[];
  marathonTitre: string;
  numeroJour: number;
  scanned: number;
  expected: number;
  taux: number;
  seuil: number;
  marathonId: number;
}): Promise<{ success: boolean; error?: string }> {
  const toArr = Array.isArray(to) ? to : [to];
  if (toArr.length === 0) return { success: true };
  const dashboardUrl = `${BASE_URL}/gestion/marathons/${marathonId}?tab=live`;
  const html = emailWrapper(
    `⚠️ Alerte présence — ${marathonTitre}`,
    p("Bonjour,") +
    p(`Le taux de présence du <strong>Jour ${numeroJour}</strong> du marathon <strong style="color:#1e3a8a">${marathonTitre}</strong> est en dessous du seuil d&apos;alerte configuré.`) +
    callout("#b45309", "#fffbeb",
      `<strong>Scannés :</strong> ${scanned} / ${expected} participants<br>` +
      `<strong>Taux de présence :</strong> <span style="color:#b91c1c;font-weight:700">${taux}%</span><br>` +
      `<strong>Seuil d&apos;alerte :</strong> ${seuil}%`
    ) +
    p("Des participants n&apos;ont pas encore été scannés. Vérifiez le tableau de bord en direct pour voir la liste des absents.") +
    cta(dashboardUrl, "Voir le suivi en direct")
  );
  return sendEmail(toArr, `⚠️ Alerte présence J${numeroJour} — ${marathonTitre}`, html);
}

// ─── Template 9 : Badge marathon par email ───────────────────────────────────

export async function sendMarathonBadgeEmail({
  to,
  participantPrenom,
  participantNom,
  participantNumeroId,
  participantQrToken,
  marathonTitre,
  marathonTheme,
  marathonReferenceBiblique,
  marathonDenomination,
  marathonDateRange,
}: {
  to: string;
  participantPrenom: string;
  participantNom: string;
  participantNumeroId: string;
  participantQrToken: string;
  marathonTitre: string;
  marathonTheme?: string | null;
  marathonReferenceBiblique?: string | null;
  marathonDenomination: string;
  marathonDateRange: string;
}): Promise<{ success: boolean; error?: string }> {
  const QRCode = (await import("qrcode")).default;
  const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");

  const qrDataUrl = await QRCode.toDataURL(participantQrToken, {
    width: 200,
    margin: 1,
    color: { dark: "#1e3a8a", light: "#ffffff" },
  });
  const qrPngBuffer = Buffer.from(qrDataUrl.split(",")[1], "base64");

  const PRIMARY_COLOR = rgb(30 / 255, 58 / 255, 138 / 255);
  const GOLD_COLOR = rgb(197 / 255, 155 / 255, 46 / 255);
  const WHITE_COLOR = rgb(1, 1, 1);
  const mmToPt = (mm: number) => mm * 2.835;
  const W = mmToPt(86);
  const H = mmToPt(54);

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([W, H]);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontReg = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const qrImage = await pdfDoc.embedPng(qrPngBuffer);
  const truncate = (s: string, max: number) => (s.length > max ? s.slice(0, max) + "\u2026" : s);

  const headerH = mmToPt(16);
  page.drawRectangle({ x: 0, y: H - headerH, width: W, height: headerH, color: PRIMARY_COLOR });
  page.drawText(truncate(marathonDenomination, 38), { x: 6, y: H - 10, size: 6.5, font: fontBold, color: WHITE_COLOR });
  page.drawText(truncate(marathonTitre, 42), { x: 6, y: H - 18, size: 5.5, font: fontReg, color: rgb(0.8, 0.85, 1) });
  page.drawText(marathonDateRange, { x: 6, y: H - 25, size: 4.5, font: fontReg, color: rgb(0.65, 0.7, 0.9) });

  const qrSize = mmToPt(22);
  const qrX = W - qrSize - 6;
  const qrY = H - headerH - qrSize - 4;
  page.drawRectangle({ x: qrX - 2, y: qrY - 2, width: qrSize + 4, height: qrSize + 4, color: GOLD_COLOR });
  page.drawImage(qrImage, { x: qrX, y: qrY, width: qrSize, height: qrSize });

  const nameY = qrY + qrSize - 4;
  page.drawText(truncate(`${participantPrenom} ${participantNom}`, 22), { x: 6, y: nameY, size: 9, font: fontBold, color: PRIMARY_COLOR });
  page.drawText(participantNumeroId, { x: 6, y: nameY - 13, size: 8, font: fontBold, color: GOLD_COLOR });
  if (marathonReferenceBiblique) {
    page.drawText(truncate(marathonReferenceBiblique, 28), { x: 6, y: nameY - 24, size: 5.5, font: fontReg, color: rgb(0.4, 0.4, 0.5) });
  }
  if (marathonTheme) {
    page.drawText(truncate(marathonTheme, 30), { x: 6, y: nameY - 34, size: 5, font: fontReg, color: rgb(0.5, 0.5, 0.6) });
  }
  page.drawRectangle({ x: 0, y: 0, width: W, height: 2, color: GOLD_COLOR });
  page.drawRectangle({ x: 0, y: H - 1, width: W, height: 1, color: GOLD_COLOR });

  const pdfBytes = await pdfDoc.save();
  const pdfBuffer = Buffer.from(pdfBytes);

  const html = emailWrapper(
    `Votre badge — ${marathonTitre}`,
    `<p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 14px">Bonjour <strong>${participantPrenom}</strong>,</p>` +
    `<p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 14px">Votre carte de participant pour le marathon <strong style="color:#1e3a8a">${marathonTitre}</strong> est jointe à cet email en format PDF.</p>` +
    `<div style="background:#eff6ff;border-left:4px solid #1e3a8a;border-radius:8px;padding:14px 18px;margin:20px 0">` +
    `<p style="color:#1e3a8a;font-size:14px;line-height:1.6;margin:0">` +
    `<strong>N° de participant :</strong> ${participantNumeroId}<br>` +
    `<strong>Période :</strong> ${marathonDateRange}` +
    (marathonTheme ? `<br><strong>Thème :</strong> ${marathonTheme}` : "") +
    `</p></div>` +
    `<p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 14px">Présentez le code QR figurant sur votre carte à l'entrée de chaque journée du marathon pour enregistrer votre présence.</p>` +
    `<p style="color:#94a3b8;font-size:13px;line-height:1.6;margin:0">Si vous avez des questions, contactez l'équipe organisatrice.</p>`
  );

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log("=== BADGE EMAIL (Resend non configuré — console) ===");
    console.log(`À : ${to} | Participant : ${participantPrenom} ${participantNom} (${participantNumeroId})`);
    console.log("====================================================");
    return { success: true };
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: "CEEC Platform <noreply@ceec-rdc.org>",
      to: [to],
      subject: `Votre badge de participant — ${marathonTitre}`,
      html,
      attachments: [
        {
          filename: `badge-marathon-${participantNumeroId}.pdf`,
          content: pdfBuffer,
        },
      ],
    });
    if (error) {
      console.error("Resend badge error:", error);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err) {
    console.error("Badge email send failed:", err);
    return { success: false, error: String(err) };
  }
}

// ─── Template 9 : Message de contact reçu ───────────────────────────────────

export async function sendContactEmail({
  to,
  nom,
  emailExpediteur,
  telephone,
  sujet,
  message,
}: {
  to: string;
  nom: string;
  emailExpediteur: string;
  telephone?: string;
  sujet?: string;
  message: string;
}): Promise<{ success: boolean; error?: string }> {
  const html = emailWrapper(
    "Nouveau message de contact",
    p("Vous avez reçu un nouveau message via le formulaire de contact de votre site.") +
    callout("#1e3a8a", "#eff6ff",
      `<strong>Nom :</strong> ${nom}<br>` +
      `<strong>Email :</strong> ${emailExpediteur}<br>` +
      (telephone ? `<strong>Téléphone :</strong> ${telephone}<br>` : "") +
      (sujet ? `<strong>Sujet :</strong> ${sujet}<br>` : "") +
      `<strong>Message :</strong><br><em>${message.replace(/\n/g, "<br>")}</em>`
    ) +
    p("Vous pouvez répondre directement à cet email pour contacter l'expéditeur.")
  );
  return sendEmail(to, `Nouveau message${sujet ? ` — ${sujet}` : ""} de ${nom}`, html);
}
