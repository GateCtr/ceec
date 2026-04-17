import crypto from "crypto";

/**
 * Compute the list of actual marathon days (date objects) 
 * excluding the specified day-offsets (1-based indexes from dateDebut).
 * joursExclus contains 1-based day numbers to exclude.
 */
export function computeMarathonDays(
  dateDebut: Date,
  nombreJours: number,
  joursExclus: number[]
): Date[] {
  const excludedSet = new Set(joursExclus);
  const days: Date[] = [];
  let dayIndex = 1;
  let offset = 0;

  while (days.length < nombreJours) {
    offset++;
    if (excludedSet.has(offset)) continue;
    const d = new Date(dateDebut);
    d.setDate(d.getDate() + offset - 1);
    days.push(d);
    dayIndex++;
  }
  return days;
}

/**
 * Returns the day number (1-based) for a given date in the marathon calendar.
 * Returns null if the date is not a marathon day.
 */
export function getMarathonDayNumber(
  dateDebut: Date,
  nombreJours: number,
  joursExclus: number[],
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

/** Format a participant ID: MRT-001 */
export function formatNumeroId(marathonId: number, seq: number): string {
  return `M${marathonId}-${String(seq).padStart(3, "0")}`;
}

/** Generate a daily access code (6 chars alphanumeric) */
export function generateAccessCode(): string {
  return crypto.randomBytes(3).toString("hex").toUpperCase();
}

/** Get the last elapsed day numbers for a marathon (days that have passed) */
export function getElapsedDayNumbers(
  dateDebut: Date,
  nombreJours: number,
  joursExclus: number[]
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
