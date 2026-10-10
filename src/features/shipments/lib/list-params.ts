import type {
  ShipmentStatus,
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

export const DEFAULT_SHIPMENTS_TAB: ShipmentsListTab = "BOOKED";

const ALLOWED_SORT_OPTIONS: ShipmentsSortOption[] = [
  "CREATED_AT_DESC",
  "CREATED_AT_ASC",
  "BOOKED_AT_DESC",
  "BOOKED_AT_ASC",
];

const ALLOWED_TABS: ShipmentStatus[] = [
  "BOOKED",
  "CANCELLED",
  "FAILED",
  "BOOKING",
];

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
  if (value && ALLOWED_TABS.includes(value as ShipmentStatus)) {
    return value as ShipmentsListTab;
  }
  return DEFAULT_SHIPMENTS_TAB;
}

export {
  localDateToInstantEndExclusive,
  localDateToInstantStart,
} from "@/features/orders/lib/orders-list-params";

export { parseISODate, toISODate };
