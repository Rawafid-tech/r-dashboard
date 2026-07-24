import { apiClient } from "@/shared/api/client";
import type { Company, UpdateCompanyRequest } from "@/features/company/types";

export async function getCompany(): Promise<Company> {
  const { data } = await apiClient.get<Company>("/api/company");
  return data;
}

export async function updateCompany(
  payload: UpdateCompanyRequest,
): Promise<Company> {
  const { data } = await apiClient.put<Company>("/api/company", payload);
  return data;
}
