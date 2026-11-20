import { describe, expect, it } from "vitest";
import { getShipmentDistrictLabel } from "@/features/shipments/lib/district-label";

const maadi = {
  nameEn: "Maadi",
  nameAr: "المعادي",
  zoneNameEn: "South Cairo",
  zoneNameAr: "جنوب القاهرة",
};

// QP Express files each governorate as its own zone and district.
const qpCairo = {
  nameEn: "Cairo",
  nameAr: "قاهره",
  zoneNameEn: "Cairo",
  zoneNameAr: "قاهره",
};

describe("getShipmentDistrictLabel", () => {
  it("shows district and zone", () => {
    expect(getShipmentDistrictLabel(maadi, "en")).toBe("Maadi — South Cairo");
    expect(getShipmentDistrictLabel(maadi, "ar")).toBe("المعادي — جنوب القاهرة");
  });

  it("shows a governorate-wide entry once", () => {
    expect(getShipmentDistrictLabel(qpCairo, "ar")).toBe("قاهره");
    expect(getShipmentDistrictLabel(qpCairo, "en")).toBe("Cairo");
  });

  it("drops an empty zone name", () => {
    expect(
      getShipmentDistrictLabel({ ...maadi, zoneNameEn: "" }, "en"),
    ).toBe("Maadi");
  });
});
