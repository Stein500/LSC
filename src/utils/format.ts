/**
 * Format helpers — prix FCFA, téléphones, dates.
 */

export function formatFCFA(amount: number | string): string {
  const n = typeof amount === "string" ? parseInt(amount.replace(/\s/g, ""), 10) : amount;
  if (Number.isNaN(n)) return String(amount);
  return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(n) + " FCFA";
}

export function formatPhoneBJ(raw: string): string {
  // raw = "2290167409408"
  const local = raw.replace(/^229/, "");
  // 01 67 40 94 08
  if (local.length === 10) {
    return local.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, "$1 $2 $3 $4 $5");
  }
  return local;
}

export function formatDateFR(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function generateTicketId(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const r = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `CLB-${ts}-${r}`;
}

export function isValidRef(ref: string): boolean {
  const value = ref.trim().toUpperCase();
  return /^CLB-[A-Z0-9]+-[A-Z0-9]{4}$/.test(value);
}
