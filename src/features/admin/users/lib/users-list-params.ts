import type { AdminUserSort } from "@/features/admin/users/types";

export type UsersSortOption =
  | "CREATED_AT_DESC"
  | "CREATED_AT_ASC"
  | "NAME_ASC"
  | "NAME_DESC"
  | "EMAIL_ASC"
  | "EMAIL_DESC";

export const DEFAULT_USERS_SORT: UsersSortOption = "CREATED_AT_DESC";

export function parseUsersSortOption(
  option: UsersSortOption,
): { sort: AdminUserSort; direction: "ASC" | "DESC" } {
  const direction = option.endsWith("_ASC") ? "ASC" : "DESC";
  const sort = option.replace(/_(ASC|DESC)$/, "") as AdminUserSort;
  return { sort, direction };
}

export function readUsersSortOption(value: string | null): UsersSortOption {
  const allowed: UsersSortOption[] = [
    "CREATED_AT_DESC",
    "CREATED_AT_ASC",
    "NAME_ASC",
    "NAME_DESC",
    "EMAIL_ASC",
    "EMAIL_DESC",
  ];

  if (value && allowed.includes(value as UsersSortOption)) {
    return value as UsersSortOption;
  }

  return DEFAULT_USERS_SORT;
}
