import { useQuery } from "@tanstack/react-query";
import { getAdminPlans } from "@/features/admin/plans/api/admin-plans.api";

export const adminPlansQueryKeys = {
  all: ["admin-plans"] as const,
  lists: () => [...adminPlansQueryKeys.all, "list"] as const,
  list: () => [...adminPlansQueryKeys.lists()] as const,
  details: () => [...adminPlansQueryKeys.all, "detail"] as const,
  detail: (planId: string) => [...adminPlansQueryKeys.details(), planId] as const,
};

export function useAdminPlans() {
  return useQuery({
    queryKey: adminPlansQueryKeys.list(),
    queryFn: getAdminPlans,
  });
}
