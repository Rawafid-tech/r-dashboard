import type {
  Carrier,
  CarrierConnection,
  CarrierConnectionsListParams,
  CreateCarrierConnectionPayload,
  TestConnectionResult,
  UpdateCarrierConnectionPayload,
} from "@/features/shipping-partners/types";
import { apiClient } from "@/shared/api/client";
import type { PaginatedResponse } from "@/shared/types/api";

export async function getCarriers(): Promise<Carrier[]> {
  const { data } = await apiClient.get<Carrier[]>("/api/carriers");
  return data;
}

export async function testCarrierConnection(
  code: string,
  credentials: Record<string, string>,
  signal?: AbortSignal,
): Promise<TestConnectionResult> {
  const { data } = await apiClient.post<TestConnectionResult>(
    `/api/carriers/${encodeURIComponent(code)}/test`,
    { credentials },
    { signal },
  );
  return data;
}

export async function getCarrierConnections(
  params: CarrierConnectionsListParams = {},
): Promise<PaginatedResponse<CarrierConnection>> {
  const { data } = await apiClient.get<PaginatedResponse<CarrierConnection>>(
    "/api/carrier-connections",
    { params },
  );
  return data;
}

export async function getCarrierConnection(
  id: string,
): Promise<CarrierConnection> {
  const { data } = await apiClient.get<CarrierConnection>(
    `/api/carrier-connections/${encodeURIComponent(id)}`,
  );
  return data;
}

export async function createCarrierConnection(
  payload: CreateCarrierConnectionPayload,
): Promise<CarrierConnection> {
  const { data } = await apiClient.post<CarrierConnection>(
    "/api/carrier-connections",
    payload,
  );
  return data;
}

export async function updateCarrierConnection(
  id: string,
  payload: UpdateCarrierConnectionPayload,
): Promise<CarrierConnection> {
  const { data } = await apiClient.put<CarrierConnection>(
    `/api/carrier-connections/${encodeURIComponent(id)}`,
    payload,
  );
  return data;
}

export async function activateCarrierConnection(
  id: string,
): Promise<CarrierConnection> {
  const { data } = await apiClient.post<CarrierConnection>(
    `/api/carrier-connections/${encodeURIComponent(id)}/activate`,
  );
  return data;
}

export async function deactivateCarrierConnection(
  id: string,
): Promise<CarrierConnection> {
  const { data } = await apiClient.post<CarrierConnection>(
    `/api/carrier-connections/${encodeURIComponent(id)}/deactivate`,
  );
  return data;
}

export async function deleteCarrierConnection(id: string): Promise<void> {
  await apiClient.delete(
    `/api/carrier-connections/${encodeURIComponent(id)}`,
  );
}
