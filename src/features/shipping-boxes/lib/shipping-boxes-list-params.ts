import type { ShippingBoxesSortField } from "@/features/shipping-boxes/types";

export type ShippingBoxesSortOption =
  | "CREATED_AT_DESC"
  | "CREATED_AT_ASC"
  | "NAME_ASC"
  | "NAME_DESC"
  | "LENGTH_CM_ASC"
  | "LENGTH_CM_DESC"
  | "WIDTH_CM_ASC"
  | "WIDTH_CM_DESC"
  | "HEIGHT_CM_ASC"
  | "HEIGHT_CM_DESC";

export const DEFAULT_SHIPPING_BOXES_SORT: ShippingBoxesSortOption =
  "CREATED_AT_DESC";

const ALLOWED_SORT_OPTIONS: ShippingBoxesSortOption[] = [
  "CREATED_AT_DESC",
  "CREATED_AT_ASC",
  "NAME_ASC",
  "NAME_DESC",
  "LENGTH_CM_ASC",
  "LENGTH_CM_DESC",
  "WIDTH_CM_ASC",
  "WIDTH_CM_DESC",
  "HEIGHT_CM_ASC",
  "HEIGHT_CM_DESC",
];

export function parseShippingBoxesSortOption(
  option: ShippingBoxesSortOption,
): { sort: ShippingBoxesSortField; direction: "ASC" | "DESC" } {
  const direction = option.endsWith("_ASC") ? "ASC" : "DESC";
  const sort = option.replace(/_(ASC|DESC)$/, "") as ShippingBoxesSortField;
  return { sort, direction };
}

export function readShippingBoxesSortOption(
  value: string | null,
): ShippingBoxesSortOption {
  if (value && ALLOWED_SORT_OPTIONS.includes(value as ShippingBoxesSortOption)) {
    return value as ShippingBoxesSortOption;
  }

  return DEFAULT_SHIPPING_BOXES_SORT;
}

export function readDefaultFilter(
  value: string | null,
): boolean | undefined {
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
}
