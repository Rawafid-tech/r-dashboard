/**
 * Decode JWT payload without verification (client-side capability hints only).
 * Authorization is always enforced by the API.
 */
export function decodeJwtPayload(
  token: string | null | undefined,
): Record<string, unknown> | null {
  if (!token?.trim()) return null;

  const parts = token.split(".");
  if (parts.length < 2) return null;

  try {
    const base64 = parts[1]!.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const json = atob(padded);
    const parsed: unknown = JSON.parse(json);
    return parsed && typeof parsed === "object"
      ? (parsed as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

function normalizePermissionList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }

  if (typeof value === "string" && value.trim()) {
    return value.split(/\s+/).filter(Boolean);
  }

  return [];
}

/** Read permission codes embedded in the merchant access token, if present. */
export function getPermissionCodesFromAccessToken(
  token: string | null | undefined,
): string[] {
  const payload = decodeJwtPayload(token);
  if (!payload) return [];

  const candidates = [
    payload.permissions,
    payload.permissionCodes,
    payload.perms,
    payload.scope,
    payload.scp,
  ];

  for (const candidate of candidates) {
    const list = normalizePermissionList(candidate);
    if (list.length > 0) return list;
  }

  return [];
}
