export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

export const passwordRules = [
  { id: 'len', label: 'At least 12 characters', test: (p: string) => p.length >= 12 },
  { id: 'case', label: 'Upper and lower case letters', test: (p: string) => /[a-z]/.test(p) && /[A-Z]/.test(p) },
  { id: 'num', label: 'At least one number', test: (p: string) => /\d/.test(p) },
] as const;

export const passwordScore = (p: string) => passwordRules.filter((r) => r.test(p)).length;

/** Parses a rupee amount typed by a person, e.g. "18,40,000". Returns null when invalid. */
export function parseAmount(v: string): number | null {
  const n = Number(v.replace(/[,\s₹]/g, ''));
  return Number.isFinite(n) && n > 0 ? n : null;
}
