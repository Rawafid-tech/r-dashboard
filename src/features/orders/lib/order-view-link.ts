import type { Order, OrderListRow } from "@/features/orders/types";

export function orderViewPath(orderId: string): string {
  const params = new URLSearchParams({ viewOrder: orderId });
  return `/orders?${params.toString()}`;
}

export function orderToListRow(order: Order): OrderListRow {
  const receiverName = [order.receiver.firstName, order.receiver.lastName]
    .filter(Boolean)
    .join(" ");

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    orderDate: order.orderDate,
    senderLocation: order.senderLocation,
    receiverName,
    receiverPhone: order.receiver.phone,
    governorate: order.address.governorate,
    area: order.address.area,
    paymentMethod: order.payment.method,
    currency: order.payment.currency,
    orderValue: order.payment.orderValue,
    codAmount: order.payment.codAmount,
    totalWeightKg: order.totalWeightKg,
    createdAt: order.createdAt,
  };
}
