import type { AdminCompanySort } from "@/features/admin/companies/types";

export type CompaniesSortOption =
  | "CREATED_AT_DESC"
  | "CREATED_AT_ASC"
  | "NAME_ASC"
  | "NAME_DESC"
  | "IDENTIFIER_ASC"
  | "IDENTIFIER_DESC";

export const DEFAULT_COMPANIES_SORT: CompaniesSortOption = "CREATED_AT_DESC";

export function parseSortOption(
  option: CompaniesSortOption,
): { sort: AdminCompanySort; direction: "ASC" | "DESC" } {
  const direction = option.endsWith("_ASC") ? "ASC" : "DESC";
  const sort = option.replace(/_(ASC|DESC)$/, "") as AdminCompanySort;
  return { sort, direction };
}

export function readSortOption(value: string | null): CompaniesSortOption {
  const allowed: CompaniesSortOption[] = [
    "CREATED_AT_DESC",
    "CREATED_AT_ASC",
    "NAME_ASC",
    "NAME_DESC",
    "IDENTIFIER_ASC",
    "IDENTIFIER_DESC",
  ];

  if (value && allowed.includes(value as CompaniesSortOption)) {
    return value as CompaniesSortOption;
  }

  return DEFAULT_COMPANIES_SORT;
}
