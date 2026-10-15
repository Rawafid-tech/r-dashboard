import type { SenderLocation } from "@/features/locations/types";
import type {
  ConnectionPickupLocationsResponse,
  UpdatePickupMappingsPayload,
} from "@/features/shipping-partners/types";

/** Select value when the connection default pickup location applies. */
export const PICKUP_MAPPING_DEFAULT = "__default__";

export type PickupMappingDraftValue = typeof PICKUP_MAPPING_DEFAULT | string;

export interface PickupMappingRowDraft {
  senderLocationId: string;
  pickupLocationId: PickupMappingDraftValue;
}

export function buildPickupMappingDrafts(
  senderLocations: SenderLocation[],
  data: ConnectionPickupLocationsResponse,
): PickupMappingRowDraft[] {
  const mappingBySender = new Map(
    data.mappings.map((item) => [item.senderLocationId, item]),
  );

  return senderLocations.map((location) => {
    const mapping = mappingBySender.get(location.id);
    return {
      senderLocationId: location.id,
      pickupLocationId: mapping?.pickupLocationId ?? PICKUP_MAPPING_DEFAULT,
    };
  });
}

export function draftsToPickupMappingsPayload(
  drafts: PickupMappingRowDraft[],
): UpdatePickupMappingsPayload {
  return {
    mappings: drafts
      .filter((row) => row.pickupLocationId !== PICKUP_MAPPING_DEFAULT)
      .map((row) => ({
        senderLocationId: row.senderLocationId,
        pickupLocationId: row.pickupLocationId,
      })),
  };
}

export function mappingOffAccount(
  senderLocationId: string,
  data: ConnectionPickupLocationsResponse | undefined,
): boolean {
  const mapping = data?.mappings.find(
    (item) => item.senderLocationId === senderLocationId,
  );
  return mapping != null && !mapping.onAccount;
}
