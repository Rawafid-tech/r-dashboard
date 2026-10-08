import { useMutation } from "@tanstack/react-query";
import { resolveCarrierRegion } from "@/features/admin/carriers/api/admin-carriers.api";
import type { RegionResolveRequest } from "@/features/admin/carriers/types";

export function useResolveCarrierRegion(code: string) {
  return useMutation({
    mutationFn: (input: RegionResolveRequest) =>
      resolveCarrierRegion(code, input),
  });
}
