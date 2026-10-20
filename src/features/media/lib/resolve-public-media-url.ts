import { API_BASE_URL } from "@/shared/lib/constants";

/**
 * Turn an app-relative public media path into a full URL for `<img src>`.
 * Returns null for empty values; leaves absolute URLs unchanged.
 */
export function resolvePublicMediaUrl(
  path: string | null | undefined,
): string | null {
  if (!path?.trim()) return null;
  const trimmed = path.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  const origin =
    API_BASE_URL ||
    (typeof window !== "undefined" ? window.location.origin : "");
  if (!origin) return trimmed;
  return `${origin.replace(/\/$/, "")}${trimmed.startsWith("/") ? "" : "/"}${trimmed}`;
}
