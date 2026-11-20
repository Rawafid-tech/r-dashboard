import { describe, expect, it } from "vitest";
import {
  isEgyptianMobile,
  isMobileOptionField,
  normalizeMobile,
} from "@/features/shipping-partners/lib/carrier-mobile";
import { toOptionsMap } from "@/features/shipping-partners/lib/connection-payload";
import type { CarrierField } from "@/features/shipping-partners/types";

const followupPhone: CarrierField = {
  key: "followupPhone",
  kind: "TEXT",
  required: false,
  label: "Follow-up mobile",
  defaultValue: null,
  options: [],
};

describe("isEgyptianMobile", () => {
  it.each(["01012345678", "01112345678", "01212345678", "01512345678"])(
    "accepts %s",
    (value) => {
      expect(isEgyptianMobile(value)).toBe(true);
    },
  );

  it.each(["+201012345678", "00201012345678", "010 1234 5678", "010-1234-5678"])(
    "accepts the prefixed or spaced form %s",
    (value) => {
      expect(isEgyptianMobile(value)).toBe(true);
    },
  );

  it("accepts Arabic-Indic digits", () => {
    expect(isEgyptianMobile("٠١٠١٢٣٤٥٦٧٨")).toBe(true);
  });

  it.each(["0221234567", "01312345678", "0101234567", "010123456789", "abc"])(
    "refuses %s",
    (value) => {
      expect(isEgyptianMobile(value)).toBe(false);
    },
  );
});

describe("normalizeMobile", () => {
  it("keeps Latin digits only, and the + prefix", () => {
    expect(normalizeMobile(" +20 (101) 234-5678 ")).toBe("+201012345678");
    expect(normalizeMobile("۰۱۰۱۲۳۴۵۶۷۸")).toBe("01012345678");
  });
});

describe("isMobileOptionField", () => {
  it("is true only for a TEXT follow-up phone", () => {
    expect(isMobileOptionField(followupPhone)).toBe(true);
    expect(isMobileOptionField({ key: "followupPhone", kind: "SECRET" })).toBe(false);
    expect(isMobileOptionField({ key: "reference", kind: "TEXT" })).toBe(false);
  });
});

describe("toOptionsMap with a mobile field", () => {
  it("sends the mobile normalized and drops it when blank", () => {
    expect(toOptionsMap([followupPhone], { followupPhone: "010 1234 5678" })).toEqual({
      followupPhone: "01012345678",
    });
    expect(toOptionsMap([followupPhone], { followupPhone: "  " })).toEqual({});
  });
});
