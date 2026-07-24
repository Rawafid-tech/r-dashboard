type CookieOptions = {
  maxAgeSeconds?: number;
  path?: string;
  sameSite?: "Lax" | "Strict" | "None";
  secure?: boolean;
};

function resolveSecureFlag(secure?: boolean) {
  if (secure !== undefined) return secure;
  return (
    typeof window !== "undefined" &&
    window.location.protocol === "https:"
  );
}

export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;

  const prefix = `${encodeURIComponent(name)}=`;
  const match = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(prefix));

  if (!match) return null;

  const value = match.slice(prefix.length);
  try {
    return decodeURIComponent(value);
  } catch {
    return null;
  }
}

export function setCookie(
  name: string,
  value: string,
  options: CookieOptions = {},
) {
  if (typeof document === "undefined") return;

  const parts = [
    `${encodeURIComponent(name)}=${encodeURIComponent(value)}`,
    `Path=${options.path ?? "/"}`,
    `SameSite=${options.sameSite ?? "Lax"}`,
  ];

  if (options.maxAgeSeconds !== undefined) {
    parts.push(`Max-Age=${Math.max(0, Math.floor(options.maxAgeSeconds))}`);
  }

  if (resolveSecureFlag(options.secure)) {
    parts.push("Secure");
  }

  document.cookie = parts.join("; ");
}

export function removeCookie(name: string, path = "/") {
  if (typeof document === "undefined") return;
  document.cookie = `${encodeURIComponent(name)}=; Path=${path}; Max-Age=0; SameSite=Lax`;
}
