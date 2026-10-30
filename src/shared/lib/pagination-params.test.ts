import { describe, expect, it } from "vitest";
import {
  readPageIndex,
  shouldResetPageIndex,
  writePageIndex,
} from "@/shared/lib/pagination-params";

describe("readPageIndex", () => {
  it("maps the 1-based URL page to a 0-based index", () => {
    expect(readPageIndex("1")).toBe(0);
    expect(readPageIndex("3")).toBe(2);
  });

  it("defaults to the first page for missing or invalid values", () => {
    expect(readPageIndex(null)).toBe(0);
    expect(readPageIndex("0")).toBe(0);
    expect(readPageIndex("-2")).toBe(0);
    expect(readPageIndex("abc")).toBe(0);
  });

  it("floors fractional pages", () => {
    expect(readPageIndex("2.7")).toBe(1);
  });
});

describe("writePageIndex", () => {
  it("omits the first page from the URL", () => {
    expect(writePageIndex(0)).toBeNull();
    expect(writePageIndex(-1)).toBeNull();
  });

  it("round-trips with readPageIndex", () => {
    for (const index of [1, 2, 10]) {
      expect(readPageIndex(writePageIndex(index))).toBe(index);
    }
  });
});

describe("shouldResetPageIndex", () => {
  it("resets when the page is past the last page", () => {
    expect(shouldResetPageIndex(5, 3, 60, 0)).toBe(true);
  });

  it("resets when a later page comes back empty but results exist", () => {
    expect(shouldResetPageIndex(2, 5, 40, 0)).toBe(true);
  });

  it("does not reset on the first page or when there are no pages", () => {
    expect(shouldResetPageIndex(0, 3, 60, 0)).toBe(false);
    expect(shouldResetPageIndex(4, 0, 0, 0)).toBe(false);
    expect(shouldResetPageIndex(1, 3, 60, 20)).toBe(false);
  });
});
