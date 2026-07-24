import { apiClient } from "@/shared/api/client";
import type { Subscription } from "@/features/subscription/types";

export async function getSubscription(): Promise<Subscription> {
  const { data } = await apiClient.get<Subscription>("/api/subscription");
  return data;
}
