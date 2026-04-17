import { prisma } from "@/lib/db";
import { computeMarathonDays, toDateString } from "@/lib/marathon-utils";
import { sendMarathonAlertEmail, getChurchStaffEmails } from "@/lib/email";

export interface AlertCheckResult {
  checked: boolean;
  sent: boolean;
  alreadySent?: boolean;
  timeNotReached?: boolean;
  aboveThreshold?: boolean;
  noSession?: boolean;
  noRecipients?: boolean;
  taux?: number;
  scanned?: number;
  expected?: number;
  numeroJour?: number;
  seuil?: number;
  recipients?: number;
  error?: string;
}

/**
 * Server-side automated alert check for a marathon session.
 * Evaluates: attendance threshold + optional time checkpoint + DB dedup.
 * Safe to call from any API route (scan, stats, etc.) — idempotent per day.
 *
 * @param marathonId - The marathon ID
 * @param forceOverride - If true, skips DB dedup (for manual "force send" from the UI)
 */
export async function checkAndSendMarathonAlert(
  marathonId: number,
  forceOverride = false
): Promise<AlertCheckResult> {
  try {
    const marathon = await prisma.marathon.findUnique({
      where: { id: marathonId },
      select: {
        id: true,
        titre: true,
        egliseId: true,
        alerteSeuil: true,
        alerteHeure: true,
        dateDebut: true,
        nombreJours: true,
        joursExclus: true,
        statut: true,
      },
    });
    if (!marathon || marathon.statut !== "ouvert") return { checked: false, sent: false };

    const days = computeMarathonDays(marathon.dateDebut, marathon.nombreJours, marathon.joursExclus);
    const todayStr = toDateString(new Date());
    const todayIdx = days.findIndex((d) => toDateString(d) === todayStr);
    if (todayIdx === -1) return { checked: true, sent: false, noSession: true };

    const numeroJour = todayIdx + 1;

    if (!forceOverride) {
      const existingAlerte = await prisma.marathonAlerte.findUnique({
        where: { marathonId_numeroJour: { marathonId, numeroJour } },
      });
      if (existingAlerte) return { checked: true, sent: false, alreadySent: true, numeroJour };
    }

    if (marathon.alerteHeure) {
      const [hh, mm] = marathon.alerteHeure.split(":").map(Number);
      const now = new Date();
      const checkTime = new Date(now);
      checkTime.setHours(hh, mm, 0, 0);
      if (now < checkTime) {
        return { checked: true, sent: false, timeNotReached: true, numeroJour };
      }
    }

    const totalParticipants = await prisma.marathonParticipant.count({ where: { marathonId } });
    const scanned = await prisma.marathonPresence.count({
      where: { marathonId, numeroJour, statut: "present" },
    });
    const expected = totalParticipants;
    const taux = expected > 0 ? Math.round((scanned / expected) * 100) : 0;

    if (taux >= marathon.alerteSeuil) {
      return { checked: true, sent: false, aboveThreshold: true, taux, scanned, expected, seuil: marathon.alerteSeuil, numeroJour };
    }

    const recipients = await getChurchStaffEmails(marathon.egliseId);
    if (recipients.length === 0) {
      return { checked: true, sent: false, noRecipients: true, taux, scanned, expected, seuil: marathon.alerteSeuil, numeroJour };
    }

    const result = await sendMarathonAlertEmail({
      to: recipients,
      marathonTitre: marathon.titre,
      numeroJour,
      scanned,
      expected,
      taux,
      seuil: marathon.alerteSeuil,
      marathonId: marathon.id,
    });

    if (result.success) {
      await prisma.marathonAlerte.upsert({
        where: { marathonId_numeroJour: { marathonId, numeroJour } },
        create: { marathonId, numeroJour, taux },
        update: { taux, envoyeAt: new Date() },
      });
    }

    return {
      checked: true,
      sent: result.success,
      taux,
      scanned,
      expected,
      seuil: marathon.alerteSeuil,
      numeroJour,
      recipients: recipients.length,
      error: result.error,
    };
  } catch (err) {
    console.error("[marathon-alert] Error:", err);
    return { checked: false, sent: false, error: String(err) };
  }
}
