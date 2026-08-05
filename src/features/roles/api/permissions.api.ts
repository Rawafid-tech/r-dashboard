import { apiClient } from "@/shared/api/client";
import type { PermissionNode } from "@/features/roles/types";

export async function getPermissionsCatalog(): Promise<PermissionNode[]> {
  const { data } = await apiClient.get<PermissionNode[]>("/api/permissions");
  return data;
}
