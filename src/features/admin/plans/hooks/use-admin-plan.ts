import { useQuery } from "@tanstack/react-query";
import { getAdminPlan } from "@/features/admin/plans/api/admin-plans.api";
import { adminPlansQueryKeys } from "@/features/admin/plans/hooks/use-admin-plans";

export function useAdminPlan(planId: string | undefined) {
  return useQuery({
    queryKey: adminPlansQueryKeys.detail(planId ?? ""),
    queryFn: () => getAdminPlan(planId!),
    enabled: Boolean(planId),
  });
}
