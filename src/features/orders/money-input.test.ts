import { describe, expect, it } from "vitest";
import { parseMoneyInput } from "@/features/orders/schema";

describe("parseMoneyInput", () => {
  it("reads Arabic digits, commas and spaces as the number the merchant meant", () => {
    expect(parseMoneyInput("٥٠")).toBe(50);
    expect(parseMoneyInput("50,5")).toBe(50.5);
    expect(parseMoneyInput("٤٥٠٫٧٥")).toBe(450.75);
    expect(parseMoneyInput(" 1 250.555 ")).toBe(1250.56);
  });

  it("gives undefined, never NaN (which JSON would send as null), for empty or invalid text", () => {
    expect(parseMoneyInput("")).toBeUndefined();
    expect(parseMoneyInput("   ")).toBeUndefined();
    expect(parseMoneyInput(undefined)).toBeUndefined();
    expect(parseMoneyInput("abc")).toBeUndefined();
  });
});
