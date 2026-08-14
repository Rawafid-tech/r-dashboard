import { apiClient } from "@/shared/api/client";
import type { Country, GeoArea, Governorate } from "@/features/locations/types";

export async function getCountries(): Promise<Country[]> {
  const { data } = await apiClient.get<Country[]>("/api/public/geo/countries");
  return data;
}

export async function getGovernorates(
  countryCode = "EG",
): Promise<Governorate[]> {
  const { data } = await apiClient.get<Governorate[]>(
    "/api/public/geo/governorates",
    { params: { countryCode } },
  );
  return data;
}

export async function getGovernorateAreas(
  governorateId: string,
  search?: string,
): Promise<GeoArea[]> {
  const { data } = await apiClient.get<GeoArea[]>(
    `/api/public/geo/governorates/${governorateId}/areas`,
    { params: search ? { search } : undefined },
  );
  return data;
}
