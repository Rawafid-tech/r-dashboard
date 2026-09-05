import { useQuery } from "@tanstack/react-query";
import { getWallet } from "@/features/wallet/api/wallet.api";

import type { WalletTransactionsListParams } from "@/features/wallet/types";

export const walletKeys = {
  all: ["wallet"] as const,
  balance: () => [...walletKeys.all, "balance"] as const,
  transactions: () => [...walletKeys.all, "transactions"] as const,
  transactionsList: (params: WalletTransactionsListParams) =>
    [...walletKeys.transactions(), params] as const,
};

interface UseWalletOptions {
  enabled?: boolean;
}

export function useWallet(options: UseWalletOptions = {}) {
  return useQuery({
    queryKey: walletKeys.balance(),
    queryFn: getWallet,
    enabled: options.enabled ?? true,
  });
}
