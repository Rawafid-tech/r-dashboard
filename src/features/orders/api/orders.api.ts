import type {
  Order,
  OrderCounts,
  OrderListRow,
  OrderPayload,
  OrdersListParams,
} from "@/features/orders/types";
import { apiClient } from "@/shared/api/client";
import type { PaginatedResponse } from "@/shared/types/api";

export async function getOrders(
  params: OrdersListParams = {},
): Promise<PaginatedResponse<OrderListRow>> {
  const { data } = await apiClient.get<PaginatedResponse<OrderListRow>>(
    "/api/orders",
    { params },
  );
  return data;
}

export async function getOrderCounts(): Promise<OrderCounts> {
  const { data } = await apiClient.get<OrderCounts>("/api/orders/counts");
  return data;
}

export async function getOrder(id: string): Promise<Order> {
  const { data } = await apiClient.get<Order>(`/api/orders/${id}`);
  return data;
}

export async function createOrder(payload: OrderPayload): Promise<Order> {
  const { data } = await apiClient.post<Order>("/api/orders", payload);
  return data;
}

export async function updateOrder(
  id: string,
  payload: OrderPayload,
): Promise<Order> {
  const { data } = await apiClient.put<Order>(`/api/orders/${id}`, payload);
  return data;
}

export async function cancelOrder(id: string): Promise<Order> {
  const { data } = await apiClient.post<Order>(`/api/orders/${id}/cancel`);
  return data;
}
