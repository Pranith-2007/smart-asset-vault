const DAY = 86_400_000;
const HOUR = 3_600_000;

export const daysAgo = (n: number) => new Date(Date.now() - n * DAY).toISOString();
export const daysAhead = (n: number) => new Date(Date.now() + n * DAY).toISOString();
export const hoursAgo = (n: number) => new Date(Date.now() - n * HOUR).toISOString();
export const nowIso = () => new Date().toISOString();

/** Whole days from `from` until `iso`. Negative when `iso` is in the past. */
export function daysUntil(iso: string, from: Date = new Date()): number {
  return Math.ceil((new Date(iso).getTime() - from.getTime()) / DAY);
}

export function daysSince(iso: string, from: Date = new Date()): number {
  return Math.floor((from.getTime() - new Date(iso).getTime()) / DAY);
}
