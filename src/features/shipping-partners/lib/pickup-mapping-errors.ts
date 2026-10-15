import { AxiosError } from "axios";
import { parseApiError } from "@/shared/api/error-handler";

export interface PickupMappingRowErrors {
  bySenderLocationId: Record<string, string>;
  byPickupLocationId: Record<string, string>;
  global: string | null;
}

const EMPTY_ROW_ERRORS: PickupMappingRowErrors = {
  bySenderLocationId: {},
  byPickupLocationId: {},
  global: null,
};

function readErrorBody(error: unknown): Record<string, unknown> | null {
  if (!(error instanceof AxiosError)) return null;
  const data = error.response?.data;
  if (!data || typeof data !== "object") return null;
  return data as Record<string, unknown>;
}

export function parsePickupMappingSaveError(
  error: unknown,
): PickupMappingRowErrors {
  const parsed = parseApiError(error);
  const body = readErrorBody(error);
  const senderLocationId =
    typeof body?.senderLocationId === "string"
      ? body.senderLocationId
      : undefined;
  const pickupLocationId =
    typeof body?.pickupLocationId === "string"
      ? body.pickupLocationId
      : undefined;

  if (senderLocationId) {
    return {
      ...EMPTY_ROW_ERRORS,
      bySenderLocationId: { [senderLocationId]: parsed.detail },
    };
  }

  if (pickupLocationId) {
    return {
      ...EMPTY_ROW_ERRORS,
      byPickupLocationId: { [pickupLocationId]: parsed.detail },
    };
  }

  return {
    ...EMPTY_ROW_ERRORS,
    global: parsed.detail,
  };
}

const KEY_ACCOUNT_PICKUP_MARKERS = [
  "without a pickup location your sender locations are mapped to",
  "لا يحتوي على موقع استلام مرتبط",
] as const;

export function isKeyMissingMappedPickupError(error: unknown): boolean {
  if (!(error instanceof AxiosError) || error.response?.status !== 422) {
    return false;
  }
  const detail = parseApiError(error).detail;
  return KEY_ACCOUNT_PICKUP_MARKERS.some((marker) => detail.includes(marker));
}
