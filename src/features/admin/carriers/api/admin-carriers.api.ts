import type { AdminCarrier } from "@/features/admin/carriers/types";
import { apiClient } from "@/shared/api/client";

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
