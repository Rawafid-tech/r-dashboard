import type { DateFormat } from "@/shared/types/enums";

export function formatDate(
  isoString: string,
  format: DateFormat = "DD_MM_YYYY",
): string {
  const date = new Date(isoString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  switch (format) {
    case "DD_MM_YYYY":
      return `${day}/${month}/${year}`;
    case "MM_DD_YYYY":
      return `${month}/${day}/${year}`;
    case "YYYY_MM_DD":
      return `${year}/${month}/${day}`;
    default:
      return `${day}/${month}/${year}`;
  }
}

export function formatCurrency(
  amount: number,
  currency: string = "EGP",
  locale: string = "ar-EG",
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatPhone(phone: string): string {
  return phone;
}

export function formatRelativeTime(isoString: string, locale: string = "ar"): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  if (diffDays === 0) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours === 0) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return rtf.format(-diffMinutes, "minute");
    }
    return rtf.format(-diffHours, "hour");
  }
  if (diffDays < 30) return rtf.format(-diffDays, "day");
  if (diffDays < 365) return rtf.format(-Math.floor(diffDays / 30), "month");
  return rtf.format(-Math.floor(diffDays / 365), "year");
}
