import type {
  ProductHandling,
  ProductsSortField,
  ProductsTab,
} from "@/features/products/types";
import { isProductHandling } from "@/features/products/schema";

export type ProductsSortOption =
  | "CREATED_AT_DESC"
  | "CREATED_AT_ASC"
  | "NAME_ASC"
  | "NAME_DESC"
  | "SKU_ASC"
  | "SKU_DESC"
  | "PRICE_ASC"
  | "PRICE_DESC"
  | "WEIGHT_KG_ASC"
  | "WEIGHT_KG_DESC";

export const DEFAULT_PRODUCTS_SORT: ProductsSortOption = "CREATED_AT_DESC";

const ALLOWED_SORT_OPTIONS: ProductsSortOption[] = [
  "CREATED_AT_DESC",
  "CREATED_AT_ASC",
  "NAME_ASC",
  "NAME_DESC",
  "SKU_ASC",
  "SKU_DESC",
  "PRICE_ASC",
  "PRICE_DESC",
  "WEIGHT_KG_ASC",
  "WEIGHT_KG_DESC",
];

export function parseProductsSortOption(
  option: ProductsSortOption,
): { sort: ProductsSortField; direction: "ASC" | "DESC" } {
  const direction = option.endsWith("_ASC") ? "ASC" : "DESC";
  const sort = option.replace(/_(ASC|DESC)$/, "") as ProductsSortField;
  return { sort, direction };
}

export function readProductsSortOption(
  value: string | null,
): ProductsSortOption {
  if (value && ALLOWED_SORT_OPTIONS.includes(value as ProductsSortOption)) {
    return value as ProductsSortOption;
  }

  return DEFAULT_PRODUCTS_SORT;
}

export function readHandlingFilter(
  value: string | null,
): ProductHandling | undefined {
  if (value && isProductHandling(value)) {
    return value;
  }

  return undefined;
}

export function readProductsTab(value: string | null): ProductsTab {
  if (value === "categories" || value === "import") {
    return value;
  }

  return "products";
}
