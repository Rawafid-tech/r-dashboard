import type { OrderPaymentMethod, OrdersListTab, OrdersSortField } from "@/features/orders/types";
import { parseISODate, toISODate } from "@/shared/components/ui/date-picker";

export type OrdersSortOption =
  | "ORDER_DATE_DESC"
  | "ORDER_DATE_ASC"
  | "CREATED_AT_DESC"
  | "CREATED_AT_ASC"
  | "ORDER_VALUE_DESC"
  | "ORDER_VALUE_ASC";

export const DEFAULT_ORDERS_SORT: OrdersSortOption = "ORDER_DATE_DESC";

const ALLOWED_SORT_OPTIONS: OrdersSortOption[] = [
  "ORDER_DATE_DESC",
  "ORDER_DATE_ASC",
  "CREATED_AT_DESC",
  "CREATED_AT_ASC",
  "ORDER_VALUE_DESC",
  "ORDER_VALUE_ASC",
];

export function parseOrdersSortOption(option: OrdersSortOption): {
  sort: OrdersSortField;
  direction: "ASC" | "DESC";
} {
  const direction = option.endsWith("_ASC") ? "ASC" : "DESC";
  const sort = option.replace(/_(ASC|DESC)$/, "") as OrdersSortField;
  return { sort, direction };
}

export function readOrdersSortOption(value: string | null): OrdersSortOption {
  if (value && ALLOWED_SORT_OPTIONS.includes(value as OrdersSortOption)) {
    return value as OrdersSortOption;
  }
  return DEFAULT_ORDERS_SORT;
}

export function readOrdersTab(value: string | null): OrdersListTab {
  if (value === "PENDING" || value === "CANCELLED") return value;
  return "all";
}

export function readPaymentMethodFilter(
  value: string | null,
): OrderPaymentMethod | undefined {
  if (value === "COD" || value === "PREPAID") return value;
  return undefined;
}

export function readOptionalNumber(value: string | null): number | undefined {
  if (!value?.trim()) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

/** Local calendar day → ISO instant (inclusive start of day in local TZ). */
export function localDateToInstantStart(isoDate: string): string {
  const date = parseISODate(isoDate);
  if (!date) return "";
  return date.toISOString();
}

/** Local calendar day → ISO instant at start of the next day (exclusive end). */
export function localDateToInstantEndExclusive(isoDate: string): string {
  const date = parseISODate(isoDate);
  if (!date) return "";
  date.setDate(date.getDate() + 1);
  return date.toISOString();
}

export function formatInstantToDateParam(instant: string | undefined): string {
  if (!instant) return "";
  const date = new Date(instant);
  if (Number.isNaN(date.getTime())) return "";
  return toISODate(date);
}
