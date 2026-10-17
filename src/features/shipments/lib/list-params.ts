import type {
  ShipmentKind,
  ShipmentsListTab,
  ShipmentsSortField,
} from "@/features/shipments/types";
import { parseISODate, toISODate } from "@/shared/components/ui/date-picker";

export type ShipmentsSortOption =
  | "CREATED_AT_DESC"
  | "CREATED_AT_ASC"
  | "BOOKED_AT_DESC"
  | "BOOKED_AT_ASC";

export const DEFAULT_SHIPMENTS_SORT: ShipmentsSortOption = "CREATED_AT_DESC";

export const DEFAULT_SHIPMENTS_TAB: ShipmentsListTab = "AWAITING_PICKUP";

export type ShipmentsKindFilter = "all" | ShipmentKind;

export const DEFAULT_SHIPMENTS_KIND: ShipmentsKindFilter = "all";

const ALLOWED_KIND_FILTERS: ShipmentsKindFilter[] = [
  "all",
  "DELIVERY",
  "RETURN_PICKUP",
];

export function readShipmentsKindFilter(
  value: string | null,
): ShipmentsKindFilter {
  if (value && ALLOWED_KIND_FILTERS.includes(value as ShipmentsKindFilter)) {
    return value as ShipmentsKindFilter;
  }
  return DEFAULT_SHIPMENTS_KIND;
}

const ALLOWED_SORT_OPTIONS: ShipmentsSortOption[] = [
  "CREATED_AT_DESC",
  "CREATED_AT_ASC",
  "BOOKED_AT_DESC",
  "BOOKED_AT_ASC",
];

const ALLOWED_TABS: ShipmentsListTab[] = [
  "AWAITING_PICKUP",
  "CURRENTLY_SHIPPING",
  "DELIVERED",
  "RETURNED",
  "BOOKING",
  "FAILED",
  "CANCELLED",
];

/** Legacy URL tab values from the booking-only release. */
const LEGACY_TAB_ALIASES: Record<string, ShipmentsListTab> = {
  BOOKED: "AWAITING_PICKUP",
};

export function parseShipmentsSortOption(option: ShipmentsSortOption): {
  sort: ShipmentsSortField;
  direction: "ASC" | "DESC";
} {
  const direction = option.endsWith("_ASC") ? "ASC" : "DESC";
  const sort = option.replace(/_(ASC|DESC)$/, "") as ShipmentsSortField;
  return { sort, direction };
}

export function readShipmentsSortOption(
  value: string | null,
): ShipmentsSortOption {
  if (value && ALLOWED_SORT_OPTIONS.includes(value as ShipmentsSortOption)) {
    return value as ShipmentsSortOption;
  }
  return DEFAULT_SHIPMENTS_SORT;
}

export function readShipmentsTab(value: string | null): ShipmentsListTab {
  if (value) {
    const legacy = LEGACY_TAB_ALIASES[value];
    if (legacy) return legacy;
    if (ALLOWED_TABS.includes(value as ShipmentsListTab)) {
      return value as ShipmentsListTab;
    }
  }
  return DEFAULT_SHIPMENTS_TAB;
}

export {
  localDateToInstantEndExclusive,
  localDateToInstantStart,
} from "@/features/orders/lib/orders-list-params";

export { parseISODate, toISODate };
