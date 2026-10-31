import { describe, expect, it } from "vitest";
import {
  decodeJwtPayload,
  getPermissionCodesFromAccessToken,
} from "@/shared/lib/jwt";

function tokenWith(payload: Record<string, unknown>): string {
  const encoded = btoa(JSON.stringify(payload))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  return `header.${encoded}.signature`;
}

describe("decodeJwtPayload", () => {
  it("decodes a base64url payload without padding", () => {
    expect(decodeJwtPayload(tokenWith({ sub: "user-1" }))).toEqual({
      sub: "user-1",
    });
  });

  it("returns null for empty or malformed tokens", () => {
    expect(decodeJwtPayload(null)).toBeNull();
    expect(decodeJwtPayload("")).toBeNull();
    expect(decodeJwtPayload("not-a-jwt")).toBeNull();
    expect(decodeJwtPayload("a.%%%.c")).toBeNull();
  });
});

describe("getPermissionCodesFromAccessToken", () => {
  it("reads an array claim", () => {
    const token = tokenWith({ permissions: ["page:orders", "order:read", 7] });
    expect(getPermissionCodesFromAccessToken(token)).toEqual([
      "page:orders",
      "order:read",
    ]);
  });

  it("reads a space-separated scope claim", () => {
    const token = tokenWith({ scope: "page:users  user:read" });
    expect(getPermissionCodesFromAccessToken(token)).toEqual([
      "page:users",
      "user:read",
    ]);
  });

  it("returns an empty list when no claim is present", () => {
    expect(getPermissionCodesFromAccessToken(tokenWith({ sub: "x" }))).toEqual(
      [],
    );
  });
});
