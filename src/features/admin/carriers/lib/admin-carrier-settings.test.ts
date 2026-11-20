import { describe, expect, it } from "vitest";
import {
  ADVANCED_SETTING_KEYS,
  defaultSettingValue,
} from "@/features/admin/carriers/lib/admin-carrier-settings";
import type { CarrierPlatformField } from "@/features/admin/carriers/types";

describe("reusesNumbers carrier field", () => {
  const field = {
    key: "reusesNumbers",
    kind: "BOOLEAN",
    required: false,
    defaultValue: false,
  } as CarrierPlatformField;

  it("sits under the Advanced fold", () => {
    expect(ADVANCED_SETTING_KEYS.has("reusesNumbers")).toBe(true);
  });

  it("defaults to off", () => {
    expect(defaultSettingValue(field)).toBe("false");
  });
});
