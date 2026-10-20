import type {
  AdminCarrier,
  CarrierPlatform,
  CarrierRegionsListParams,
  CarrierRegionsSyncResult,
  CarrierRegion,
  CarrierUnmappedCity,
  CreateAdminCarrierPayload,
  PatchAdminCarrierPayload,
  RegionResolveRequest,
  RegionResolveResult,
} from "@/features/admin/carriers/types";
import { apiClient } from "@/shared/api/client";
import type { PaginatedResponse } from "@/shared/types/api";

export async function getAdminCarriers(): Promise<AdminCarrier[]> {
  const { data } = await apiClient.get<AdminCarrier[]>("/api/admin/carriers");
  return data;
}

export async function updateAdminCarrier(
  code: string,
  enabled: boolean,
): Promise<AdminCarrier> {
  const { data } = await apiClient.put<AdminCarrier>(
    `/api/admin/carriers/${encodeURIComponent(code)}`,
    { enabled },
  );
  return data;
}

export async function getCarrierPlatforms(): Promise<CarrierPlatform[]> {
  const { data } = await apiClient.get<CarrierPlatform[]>(
    "/api/admin/carrier-platforms",
  );
  return data;
}

export async function createAdminCarrier(
  payload: CreateAdminCarrierPayload,
): Promise<AdminCarrier> {
  const { data } = await apiClient.post<AdminCarrier>(
    "/api/admin/carriers",
    payload,
  );
  return data;
}

export async function patchAdminCarrier(
  code: string,
  payload: PatchAdminCarrierPayload,
): Promise<AdminCarrier> {
  const { data } = await apiClient.patch<AdminCarrier>(
    `/api/admin/carriers/${encodeURIComponent(code)}`,
    payload,
  );
  return data;
}

export async function deleteAdminCarrier(code: string): Promise<void> {
  await apiClient.delete(`/api/admin/carriers/${encodeURIComponent(code)}`);
}

export async function uploadAdminCarrierLogo(
  code: string,
  file: File,
): Promise<AdminCarrier> {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await apiClient.put<AdminCarrier>(
    carrierPath(code, "/logo"),
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );
  return data;
}

export async function deleteAdminCarrierLogo(code: string): Promise<AdminCarrier> {
  const { data } = await apiClient.delete<AdminCarrier>(
    carrierPath(code, "/logo"),
  );
  return data;
}

function carrierPath(code: string, suffix: string): string {
  return `/api/admin/carriers/${encodeURIComponent(code)}${suffix}`;
}

export async function getCarrierRegions(
  code: string,
  params: CarrierRegionsListParams,
): Promise<PaginatedResponse<CarrierRegion>> {
  const { data } = await apiClient.get<PaginatedResponse<CarrierRegion>>(
    carrierPath(code, "/regions"),
    { params },
  );
  return data;
}

export async function syncCarrierRegions(
  code: string,
): Promise<CarrierRegionsSyncResult> {
  const { data } = await apiClient.post<CarrierRegionsSyncResult>(
    carrierPath(code, "/regions/sync"),
  );

  return {
    added: data.added ?? 0,
    updated: data.updated ?? 0,
    retired: data.retired ?? 0,
    total: data.total ?? 0,
    unmappedCities: Array.isArray(data.unmappedCities)
      ? data.unmappedCities.filter(isUnmappedCity)
      : [],
  };
}

function isUnmappedCity(value: unknown): value is CarrierUnmappedCity {
  if (typeof value === "string") return value.trim().length > 0;
  if (!value || typeof value !== "object") return false;
  return true;
}

export async function resolveCarrierRegion(
  code: string,
  params: RegionResolveRequest,
): Promise<RegionResolveResult> {
  const { data } = await apiClient.get<RegionResolveResult>(
    carrierPath(code, "/regions/resolve"),
    { params },
  );
  return data;
}
