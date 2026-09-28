import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getPayment, getPayments } from "@/features/wallet/api/payments.api";
import type { PaymentsListParams } from "@/features/wallet/types";

export const paymentsKeys = {
  all: ["payments"] as const,
  lists: () => [...paymentsKeys.all, "list"] as const,
  list: (params: PaymentsListParams) =>
    [...paymentsKeys.lists(), params] as const,
  details: () => [...paymentsKeys.all, "detail"] as const,
  detail: (id: string) => [...paymentsKeys.details(), id] as const,
};

interface UsePaymentsOptions {
  enabled?: boolean;
}

export function usePayments(
  params: PaymentsListParams = {},
  options: UsePaymentsOptions = {},
) {
  return useQuery({
    queryKey: paymentsKeys.list(params),
    queryFn: () => getPayments(params),
    placeholderData: keepPreviousData,
    enabled: options.enabled ?? true,
  });
}

interface UsePaymentOptions {
  enabled?: boolean;
}

export function usePayment(id: string, options: UsePaymentOptions = {}) {
  return useQuery({
    queryKey: paymentsKeys.detail(id),
    queryFn: () => getPayment(id),
    enabled: (options.enabled ?? true) && Boolean(id),
  });
}
