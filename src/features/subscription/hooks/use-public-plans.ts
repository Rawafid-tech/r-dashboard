import { useQuery } from "@tanstack/react-query";
import { getPublicPlans } from "@/features/subscription/api/subscription.api";
import { subscriptionQueryKeys } from "@/features/subscription/hooks/use-subscription";

export function usePublicPlans() {
  return useQuery({
    queryKey: subscriptionQueryKeys.plans(),
    queryFn: getPublicPlans,
  });
}
