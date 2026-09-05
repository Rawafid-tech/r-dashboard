import type {
  WalletTransactionSortField,
  WalletTransactionType,
} from "@/features/wallet/types";

export type WalletSortOption =
  | "CREATED_AT_DESC"
  | "CREATED_AT_ASC"
  | "AMOUNT_DESC"
  | "AMOUNT_ASC";

export const DEFAULT_WALLET_SORT: WalletSortOption = "CREATED_AT_DESC";

export const WALLET_TRANSACTION_TYPE_FILTERS: WalletTransactionType[] = [
  "ADMIN_CREDIT",
  "ADMIN_DEBIT",
  "SUBSCRIPTION_NEW",
  "SUBSCRIPTION_RENEWAL",
];

export function parseWalletSortOption(option: WalletSortOption): {
  sort: WalletTransactionSortField;
  direction: "ASC" | "DESC";
} {
  const direction = option.endsWith("_ASC") ? "ASC" : "DESC";
  const sort = option.replace(/_(ASC|DESC)$/, "") as WalletTransactionSortField;
  return { sort, direction };
}

export function readWalletSortOption(value: string | null): WalletSortOption {
  const allowed: WalletSortOption[] = [
    "CREATED_AT_DESC",
    "CREATED_AT_ASC",
    "AMOUNT_DESC",
    "AMOUNT_ASC",
  ];

  if (value && allowed.includes(value as WalletSortOption)) {
    return value as WalletSortOption;
  }

  return DEFAULT_WALLET_SORT;
}

export function readWalletTypeFilter(
  value: string | null,
): WalletTransactionType | undefined {
  if (
    value &&
    WALLET_TRANSACTION_TYPE_FILTERS.includes(value as WalletTransactionType)
  ) {
    return value as WalletTransactionType;
  }

  return undefined;
}
