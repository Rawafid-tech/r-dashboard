import { useQuery } from "@tanstack/react-query";
import { getAdminCarriers } from "@/features/admin/carriers/api/admin-carriers.api";

export const adminCarrierKeys = {
  all: ["admin-carriers"] as const,
  list: () => [...adminCarrierKeys.all, "list"] as const,
};

export function useAdminCarriers() {
  return useQuery({
    queryKey: adminCarrierKeys.list(),
    queryFn: getAdminCarriers,
  });
}
