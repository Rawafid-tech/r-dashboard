import { useMe } from "@/features/account/hooks/use-me";
import { useCompany } from "@/features/company/hooks/use-company";
import { useSubscription } from "@/features/subscription/hooks/use-subscription";

export function useDashboardData() {
  const meQuery = useMe();
  const companyQuery = useCompany();
  const subscriptionQuery = useSubscription();

  const isLoading =
    meQuery.isLoading || companyQuery.isLoading || subscriptionQuery.isLoading;

  const isError =
    meQuery.isError || companyQuery.isError || subscriptionQuery.isError;

  const refetchAll = () =>
    Promise.all([
      meQuery.refetch(),
      companyQuery.refetch(),
      subscriptionQuery.refetch(),
    ]);

  return {
    user: meQuery.data,
    company: companyQuery.data,
    subscription: subscriptionQuery.data,
    isLoading,
    isError,
    refetchAll,
  };
}
