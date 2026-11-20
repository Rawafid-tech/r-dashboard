import { describe, expect, it } from "vitest";
import {
  isDigitsOnly,
  isEgyptianMobile,
  matchesOptionFormat,
  normalizeDigits,
  optionFormat,
} from "@/features/shipping-partners/lib/carrier-option-formats";
import { toOptionsMap } from "@/features/shipping-partners/lib/connection-payload";
import type { CarrierField } from "@/features/shipping-partners/types";

function textField(key: string): CarrierField {
  return {
    key,
    kind: "TEXT",
    required: false,
    label: key,
    defaultValue: null,
    options: [],
  };
}

const followupPhone = textField("followupPhone");
const merchantId = textField("merchantId");

describe("optionFormat", () => {
  it("knows Turbo's follow-up mobile and Mylerz's merchant id", () => {
    expect(optionFormat(followupPhone)).toBe("mobile");
    expect(optionFormat(merchantId)).toBe("digits");
  });

  it("is null for other keys and for non-TEXT kinds", () => {
    expect(optionFormat(textField("reference"))).toBeNull();
    expect(optionFormat(textField("constructor"))).toBeNull();
    expect(optionFormat({ key: "merchantId", kind: "SECRET" })).toBeNull();
  });
});

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

describe("isDigitsOnly", () => {
  it.each(["12345", "12 345", "١٢٣٤٥", "۱۲۳۴۵"])("accepts %s", (value) => {
    expect(isDigitsOnly(value)).toBe(true);
  });

  it.each(["M-123a", "abc", "12.5x", ""])("refuses %s", (value) => {
    expect(isDigitsOnly(value)).toBe(false);
  });
});

describe("matchesOptionFormat", () => {
  it("lets values without a format through", () => {
    expect(matchesOptionFormat(null, "anything")).toBe(true);
  });
});

describe("normalizeDigits", () => {
  it("keeps Latin digits only, and the + prefix", () => {
    expect(normalizeDigits(" +20 (101) 234-5678 ")).toBe("+201012345678");
    expect(normalizeDigits("۰۱۰۱۲۳۴۵۶۷۸")).toBe("01012345678");
  });
});

describe("toOptionsMap with formatted fields", () => {
  it("sends formatted values normalized and drops blank ones", () => {
    expect(
      toOptionsMap([followupPhone, merchantId], {
        followupPhone: "010 1234 5678",
        merchantId: " ١٢٣ ٤٥ ",
      }),
    ).toEqual({ followupPhone: "01012345678", merchantId: "12345" });
    expect(toOptionsMap([followupPhone], { followupPhone: "  " })).toEqual({});
  });

  it("only trims other text options", () => {
    expect(
      toOptionsMap([textField("reference")], { reference: "  A 1-2  " }),
    ).toEqual({ reference: "A 1-2" });
  });
});
