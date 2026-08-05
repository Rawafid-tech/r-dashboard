import type { RolesSortField } from "@/features/roles/types";

export type RolesSortOption =
  | "CREATED_AT_DESC"
  | "CREATED_AT_ASC"
  | "NAME_ASC"
  | "NAME_DESC";

export const DEFAULT_ROLES_SORT: RolesSortOption = "CREATED_AT_DESC";

export function parseRolesSortOption(
  option: RolesSortOption,
): { sort: RolesSortField; direction: "ASC" | "DESC" } {
  const direction = option.endsWith("_ASC") ? "ASC" : "DESC";
  const sort = option.replace(/_(ASC|DESC)$/, "") as RolesSortField;
  return { sort, direction };
}

export function readRolesSortOption(value: string | null): RolesSortOption {
  const allowed: RolesSortOption[] = [
    "CREATED_AT_DESC",
    "CREATED_AT_ASC",
    "NAME_ASC",
    "NAME_DESC",
  ];

  if (value && allowed.includes(value as RolesSortOption)) {
    return value as RolesSortOption;
  }

  return DEFAULT_ROLES_SORT;
}
