import type { LocationsSortField } from "@/features/locations/types";
import { SenderLocationStatus } from "@/shared/types/enums";
import type { SenderLocationStatus as SenderLocationStatusType } from "@/shared/types/enums";

export type LocationsSortOption =
  | "CREATED_AT_DESC"
  | "CREATED_AT_ASC"
  | "NAME_ASC"
  | "NAME_DESC";

export const DEFAULT_LOCATIONS_SORT: LocationsSortOption = "CREATED_AT_DESC";

export function parseLocationsSortOption(
  option: LocationsSortOption,
): { sort: LocationsSortField; direction: "ASC" | "DESC" } {
  const direction = option.endsWith("_ASC") ? "ASC" : "DESC";
  const sort = option.replace(/_(ASC|DESC)$/, "") as LocationsSortField;
  return { sort, direction };
}

export function readLocationsSortOption(
  value: string | null,
): LocationsSortOption {
  const allowed: LocationsSortOption[] = [
    "CREATED_AT_DESC",
    "CREATED_AT_ASC",
    "NAME_ASC",
    "NAME_DESC",
  ];

  if (value && allowed.includes(value as LocationsSortOption)) {
    return value as LocationsSortOption;
  }

  return DEFAULT_LOCATIONS_SORT;
}

export function readLocationStatusFilter(
  value: string | null,
): SenderLocationStatusType | undefined {
  if (
    value === SenderLocationStatus.ACTIVE ||
    value === SenderLocationStatus.INACTIVE
  ) {
    return value;
  }

  return undefined;
}
