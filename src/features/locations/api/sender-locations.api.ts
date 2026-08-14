import { apiClient } from "@/shared/api/client";
import type { PaginatedResponse } from "@/shared/types/api";
import type {
  LocationsListParams,
  SenderLocation,
  SenderLocationPayload,
} from "@/features/locations/types";

export async function getSenderLocations(
  params: LocationsListParams = {},
): Promise<PaginatedResponse<SenderLocation>> {
  const { data } = await apiClient.get<PaginatedResponse<SenderLocation>>(
    "/api/sender-locations",
    { params },
  );
  return data;
}

export async function getSenderLocation(id: string): Promise<SenderLocation> {
  const { data } = await apiClient.get<SenderLocation>(
    `/api/sender-locations/${id}`,
  );
  return data;
}

export async function createSenderLocation(
  payload: SenderLocationPayload,
): Promise<SenderLocation> {
  const { data } = await apiClient.post<SenderLocation>(
    "/api/sender-locations",
    payload,
  );
  return data;
}

export async function updateSenderLocation(
  id: string,
  payload: SenderLocationPayload,
): Promise<SenderLocation> {
  const { data } = await apiClient.put<SenderLocation>(
    `/api/sender-locations/${id}`,
    payload,
  );
  return data;
}

export async function activateSenderLocation(
  id: string,
): Promise<SenderLocation> {
  const { data } = await apiClient.post<SenderLocation>(
    `/api/sender-locations/${id}/activate`,
  );
  return data;
}

export async function deactivateSenderLocation(
  id: string,
): Promise<SenderLocation> {
  const { data } = await apiClient.post<SenderLocation>(
    `/api/sender-locations/${id}/deactivate`,
  );
  return data;
}

export async function setDefaultSenderLocation(
  id: string,
): Promise<SenderLocation> {
  const { data } = await apiClient.post<SenderLocation>(
    `/api/sender-locations/${id}/default`,
  );
  return data;
}
