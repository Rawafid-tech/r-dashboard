import type { OrderListRow, OrderStatus } from "@/features/orders/types";

const BOOKABLE_STATUSES: OrderStatus[] = ["PENDING", "RETURNED"];

export function isOrderSelectableForBooking(order: OrderListRow): boolean {
  return BOOKABLE_STATUSES.includes(order.status);
}
