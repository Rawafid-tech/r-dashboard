import type { CarrierConnectionsSortField } from "@/features/shipping-partners/types";

export type ConnectionsSortOption =
  | "CREATED_AT_DESC"
  | "CREATED_AT_ASC"
  | "NAME_ASC"
  | "NAME_DESC";

export const DEFAULT_CONNECTIONS_SORT: ConnectionsSortOption = "CREATED_AT_DESC";

const ALLOWED_SORT_OPTIONS: ConnectionsSortOption[] = [
  "CREATED_AT_DESC",
  "CREATED_AT_ASC",
  "NAME_ASC",
  "NAME_DESC",
];

export type ShippingPartnersTab = "available" | "connected";

export function readShippingPartnersTab(
  value: string | null,
): ShippingPartnersTab {
  return value === "connected" ? "connected" : "available";
}

export function parseConnectionsSortOption(option: ConnectionsSortOption): {
  sort: CarrierConnectionsSortField;
  direction: "ASC" | "DESC";
} {
  const direction = option.endsWith("_ASC") ? "ASC" : "DESC";
  const sort = option.replace(/_(ASC|DESC)$/, "") as CarrierConnectionsSortField;
  return { sort, direction };
}

export function readConnectionsSortOption(
  value: string | null,
): ConnectionsSortOption {
  if (value && ALLOWED_SORT_OPTIONS.includes(value as ConnectionsSortOption)) {
    return value as ConnectionsSortOption;
  }

  return DEFAULT_CONNECTIONS_SORT;
}

export function readActiveOnlyFilter(value: string | null): boolean {
  return value === "true";
}
