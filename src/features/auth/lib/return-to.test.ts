import { describe, expect, it } from "vitest";
import { returnPathFrom, safeReturnPath } from "@/features/auth/lib/return-to";

describe("safeReturnPath", () => {
  it("keeps same-site paths with their query", () => {
    expect(safeReturnPath("/connect?client_id=shopify-app&state=x%2By")).toBe(
      "/connect?client_id=shopify-app&state=x%2By",
    );
  });

  it("refuses other sites and the auth pages themselves", () => {
    expect(safeReturnPath("https://evil.example/")).toBeNull();
    expect(safeReturnPath("//evil.example")).toBeNull();
    expect(safeReturnPath("/\\evil.example")).toBeNull();
    expect(safeReturnPath("/login?x=1")).toBeNull();
    expect(safeReturnPath("")).toBeNull();
  });
});

describe("returnPathFrom", () => {
  it("restores pathname + search + hash from the router state set by ProtectedRoute", () => {
    const state = { from: { pathname: "/connect", search: "?client_id=a&state=b", hash: "" } };
    expect(returnPathFrom(state, "")).toBe("/connect?client_id=a&state=b");
  });

  it("falls back to a returnTo query parameter (hard redirects), then to home", () => {
    expect(returnPathFrom(null, "?returnTo=%2Forders%3Ftab%3DPENDING")).toBe("/orders?tab=PENDING");
    expect(returnPathFrom(null, "?returnTo=https%3A%2F%2Fevil.example")).toBe("/");
    expect(returnPathFrom(null, "")).toBe("/");
  });
});
