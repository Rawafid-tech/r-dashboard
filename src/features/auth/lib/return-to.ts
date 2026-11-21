/**
 * Where to send the user after login or sign-up: the page they were on, with its full query string.
 * The query matters: `/connect?client_id=…&state=…` (docs/2026-11-20-connect-with-rawafid.md §2) must
 * come back exactly as it left. Only same-site relative paths are accepted, so this can never be
 * used to redirect to another site.
 */

const AUTH_PAGES = ["/login", "/register", "/forgot-password", "/reset-password"];

interface FromState {
  from?: { pathname?: string; search?: string; hash?: string };
}

/** A relative path inside this site, or null (e.g. "//evil.com", "https://…", "/\\evil.com"). */
export function safeReturnPath(value: string | null | undefined): string | null {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return null;
  const pathname = value.split(/[?#]/)[0] ?? "";
  if (AUTH_PAGES.includes(pathname)) return null;
  return value;
}

/** The return path from router state (set by ProtectedRoute) or a `returnTo` query parameter. */
export function returnPathFrom(state: unknown, search: string, fallback = "/"): string {
  const from = (state as FromState | null)?.from;
  if (from?.pathname) {
    const fromState = safeReturnPath(`${from.pathname}${from.search ?? ""}${from.hash ?? ""}`);
    if (fromState) return fromState;
  }
  return safeReturnPath(new URLSearchParams(search).get("returnTo")) ?? fallback;
}

/** A login URL that brings the user back to where they are now (for hard redirects). */
export function loginUrlReturningHere(loginPath: string): string {
  const here = safeReturnPath(`${window.location.pathname}${window.location.search}${window.location.hash}`);
  return here && here !== "/" ? `${loginPath}?returnTo=${encodeURIComponent(here)}` : loginPath;
}
