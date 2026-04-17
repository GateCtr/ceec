import crypto from "crypto";

/**
 * Compute the list of actual marathon days (Date objects).
 * joursExclus: array of ISO date strings ("YYYY-MM-DD") to skip.
 * The marathon spans enough calendar days to accumulate `nombreJours` active days.
 */
export function computeMarathonDays(
  dateDebut: Date | string,
  nombreJours: number,
  joursExclus: string[]
): Date[] {
  const excludedSet = new Set(joursExclus);
  const days: Date[] = [];
  const start = new Date(typeof dateDebut === "string" ? dateDebut + "T12:00:00Z" : dateDebut);
  let offset = 0;

  while (days.length < nombreJours) {
    const d = new Date(start);
    d.setUTCDate(d.getUTCDate() + offset);
    const dateStr = toDateString(d);
    if (!excludedSet.has(dateStr)) {
      days.push(d);
    }
    offset++;
    if (offset > nombreJours + 365) break;
  }
  return days;
}

/**
 * Returns the 1-based day number for a given date in the marathon calendar.
 * Returns null if the date is not a marathon day.
 */
export function getMarathonDayNumber(
  dateDebut: Date | string,
  nombreJours: number,
  joursExclus: string[],
  targetDate: Date
): number | null {
  const days = computeMarathonDays(dateDebut, nombreJours, joursExclus);
  const targetStr = toDateString(targetDate);
  const idx = days.findIndex((d) => toDateString(d) === targetStr);
  return idx === -1 ? null : idx + 1;
}

/** Format a Date to YYYY-MM-DD string (UTC) */
export function toDateString(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Generate a unique QR token */
export function generateQrToken(): string {
  return crypto.randomBytes(24).toString("hex");
}

/** Format a participant ID: M{marathonId}-{seq:03d} */
export function formatNumeroId(marathonId: number, seq: number): string {
  return `M${marathonId}-${String(seq).padStart(3, "0")}`;
}

/** Generate a daily access code (6 chars alphanumeric) */
export function generateAccessCode(): string {
  return crypto.randomBytes(3).toString("hex").toUpperCase();
}

/** Get elapsed day numbers (1-based) for days already past */
export function getElapsedDayNumbers(
  dateDebut: Date | string,
  nombreJours: number,
  joursExclus: string[]
): number[] {
  const days = computeMarathonDays(dateDebut, nombreJours, joursExclus);
  const today = toDateString(new Date());
  const elapsed: number[] = [];
  for (let i = 0; i < days.length; i++) {
    if (toDateString(days[i]) < today) {
      elapsed.push(i + 1);
    }
  }
  return elapsed;
}
