import { useQuery } from "@tanstack/react-query";
import { getSubscription } from "@/features/subscription/api/subscription.api";

export const subscriptionQueryKeys = {
  all: ["subscription"] as const,
  current: () => [...subscriptionQueryKeys.all, "current"] as const,
  plans: () => [...subscriptionQueryKeys.all, "plans"] as const,
};

export function useSubscription() {
  return useQuery({
    queryKey: subscriptionQueryKeys.current(),
    queryFn: getSubscription,
  });
}
