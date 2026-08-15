import type {
  ShippingBox,
  ShippingBoxPayload,
  ShippingBoxesListParams,
} from "@/features/shipping-boxes/types";
import { apiClient } from "@/shared/api/client";
import type { PaginatedResponse } from "@/shared/types/api";

export async function getShippingBoxes(
  params: ShippingBoxesListParams = {},
): Promise<PaginatedResponse<ShippingBox>> {
  const { data } = await apiClient.get<PaginatedResponse<ShippingBox>>(
    "/api/shipping-boxes",
    { params },
  );
  return data;
}

export async function getShippingBox(id: string): Promise<ShippingBox> {
  const { data } = await apiClient.get<ShippingBox>(
    `/api/shipping-boxes/${id}`,
  );
  return data;
}

export async function createShippingBox(
  payload: ShippingBoxPayload,
): Promise<ShippingBox> {
  const { data } = await apiClient.post<ShippingBox>(
    "/api/shipping-boxes",
    payload,
  );
  return data;
}

export async function updateShippingBox(
  id: string,
  payload: ShippingBoxPayload,
): Promise<ShippingBox> {
  const { data } = await apiClient.put<ShippingBox>(
    `/api/shipping-boxes/${id}`,
    payload,
  );
  return data;
}

export async function deleteShippingBox(id: string): Promise<void> {
  await apiClient.delete(`/api/shipping-boxes/${id}`);
}
