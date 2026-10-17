import { useQuery } from "@tanstack/react-query";
import { getReturnPreview } from "@/features/returns/api/returns.api";
import { returnKeys } from "@/features/returns/hooks/query-keys";
import type { ReturnPreviewParams } from "@/features/returns/types";

interface UseReturnPreviewOptions {
  enabled?: boolean;
  staleTime?: number;
}

export function useReturnPreview(
  params: ReturnPreviewParams | null,
  options: UseReturnPreviewOptions = {},
) {
  const enabled = Boolean(params?.orderId) && (options.enabled ?? true);

  return useQuery({
    queryKey: returnKeys.preview(params ?? { orderId: "" }),
    queryFn: ({ signal }) => getReturnPreview(params!, signal),
    enabled,
    staleTime: options.staleTime ?? 0,
    retry: false,
  });
}
