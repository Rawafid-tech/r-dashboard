import { apiClient } from "@/shared/api/client";
import type { Company } from "@/features/company/types";

export async function getCompany(): Promise<Company> {
  const { data } = await apiClient.get<Company>("/api/company");
  return data;
}
