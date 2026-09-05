import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getWalletTransactions } from "@/features/wallet/api/wallet.api";
import { walletKeys } from "@/features/wallet/hooks/use-wallet";
import type { WalletTransactionsListParams } from "@/features/wallet/types";

interface UseWalletTransactionsOptions {
  enabled?: boolean;
}

export function useWalletTransactions(
  params: WalletTransactionsListParams,
  options: UseWalletTransactionsOptions = {},
) {
  return useQuery({
    queryKey: walletKeys.transactionsList(params),
    queryFn: () => getWalletTransactions(params),
    placeholderData: keepPreviousData,
    enabled: options.enabled ?? true,
  });
}
