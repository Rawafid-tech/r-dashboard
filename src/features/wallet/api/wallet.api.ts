import { apiClient } from "@/shared/api/client";
import type { PaginatedResponse } from "@/shared/types/api";
import type {
  Wallet,
  WalletTransaction,
  WalletTransactionsListParams,
} from "@/features/wallet/types";

export async function getWallet(): Promise<Wallet> {
  const { data } = await apiClient.get<Wallet>("/api/wallet");
  return data;
}

export async function getWalletTransactions(
  params: WalletTransactionsListParams = {},
): Promise<PaginatedResponse<WalletTransaction>> {
  const { data } = await apiClient.get<PaginatedResponse<WalletTransaction>>(
    "/api/wallet/transactions",
    { params },
  );
  return data;
}
