import { describe, expect, it } from "vitest";
import {
  cartesianProduct,
  countAxisCombinations,
  flattenAxisValues,
  generateVariantRowsFromAxes,
  type VariantAxis,
} from "@/features/products/lib/product-variants";

function axis(name: string, values: string[]): VariantAxis {
  return {
    id: name,
    name,
    values: values.map((value, index) => ({ id: `${name}-${index}`, value })),
  };
}

describe("cartesianProduct", () => {
  it("returns every combination in order", () => {
    expect(cartesianProduct([["S", "M"], ["Red", "Blue"]])).toEqual([
      ["S", "Red"],
      ["S", "Blue"],
      ["M", "Red"],
      ["M", "Blue"],
    ]);
  });

  it("returns nothing for no input arrays", () => {
    expect(cartesianProduct([])).toEqual([]);
  });
});

describe("flattenAxisValues", () => {
  it("trims values and drops blanks", () => {
    expect(flattenAxisValues([" S ", "", "Red"])).toBe("S / Red");
  });
});

describe("countAxisCombinations", () => {
  it("multiplies non-empty value counts and ignores empty axes", () => {
    const axes = [
      axis("Size", ["S", "M", "L"]),
      axis("Color", ["Red", " "]),
      axis("Empty", []),
    ];
    expect(countAxisCombinations(axes)).toBe(3);
  });

  it("is zero when no axis has values", () => {
    expect(countAxisCombinations([axis("Size", [""])])).toBe(0);
  });
});

describe("generateVariantRowsFromAxes", () => {
  it("names rows by combination and keeps known prices", () => {
    const rows = generateVariantRowsFromAxes(
      [axis("Size", ["S", "M"]), axis("Color", ["Red"])],
      new Map([["M / Red", "120"]]),
    );

    expect(rows.map((row) => row.name)).toEqual(["S / Red", "M / Red"]);
    expect(rows.map((row) => row.price)).toEqual(["", "120"]);
    expect(new Set(rows.map((row) => row.id)).size).toBe(2);
  });
});
