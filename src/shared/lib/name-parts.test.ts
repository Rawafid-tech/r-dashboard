import { describe, expect, it } from "vitest";
import { joinDistinctNames } from "@/shared/lib/name-parts";

describe("joinDistinctNames", () => {
  it("joins distinct names in order", () => {
    expect(joinDistinctNames(["القاهرة", "المعادي", "دجلة"], " · ")).toBe(
      "القاهرة · المعادي · دجلة",
    );
  });

  it("shows a repeated name once", () => {
    expect(joinDistinctNames(["قاهره", "قاهره", "قاهره"], " · ")).toBe("قاهره");
    expect(joinDistinctNames(["Cairo", " Cairo "], " — ")).toBe("Cairo");
  });

  it("skips blank and missing names", () => {
    expect(joinDistinctNames(["Giza", "", null, undefined, "  "], " — ")).toBe(
      "Giza",
    );
    expect(joinDistinctNames([], " — ")).toBe("");
  });

  it("keeps different spellings apart", () => {
    expect(joinDistinctNames(["القاهرة", "قاهره"], " — ")).toBe("القاهرة — قاهره");
  });
});
