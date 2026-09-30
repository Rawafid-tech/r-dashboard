import type { CarrierConnectionsListParams } from "@/features/shipping-partners/types";

export const carrierKeys = {
  all: ["carriers"] as const,
  list: () => [...carrierKeys.all, "list"] as const,
};

export const carrierConnectionKeys = {
  all: ["carrier-connections"] as const,
  lists: () => [...carrierConnectionKeys.all, "list"] as const,
  list: (params: CarrierConnectionsListParams) =>
    [...carrierConnectionKeys.lists(), params] as const,
  details: () => [...carrierConnectionKeys.all, "detail"] as const,
  detail: (id: string) => [...carrierConnectionKeys.details(), id] as const,
};
