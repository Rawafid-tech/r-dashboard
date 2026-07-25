import { apiClient } from "@/shared/api/client";
import type {
  AdminPlan,
  CreatePlanRequest,
  UpdatePlanRequest,
} from "@/features/admin/plans/types";

export async function getAdminPlans(): Promise<AdminPlan[]> {
  const { data } = await apiClient.get<AdminPlan[]>("/api/admin/plans");
  return data;
}

export async function getAdminPlan(planId: string): Promise<AdminPlan> {
  const { data } = await apiClient.get<AdminPlan>(
    `/api/admin/plans/${planId}`,
  );
  return data;
}

export async function createAdminPlan(
  payload: CreatePlanRequest,
): Promise<AdminPlan> {
  const { data } = await apiClient.post<AdminPlan>("/api/admin/plans", payload);
  return data;
}

export async function updateAdminPlan(
  planId: string,
  payload: UpdatePlanRequest,
): Promise<AdminPlan> {
  const { data } = await apiClient.put<AdminPlan>(
    `/api/admin/plans/${planId}`,
    payload,
  );
  return data;
}

export async function archiveAdminPlan(planId: string): Promise<void> {
  await apiClient.delete(`/api/admin/plans/${planId}`);
}

export async function activateAdminPlan(planId: string): Promise<AdminPlan> {
  const { data } = await apiClient.post<AdminPlan>(
    `/api/admin/plans/${planId}/activate`,
  );
  return data;
}
