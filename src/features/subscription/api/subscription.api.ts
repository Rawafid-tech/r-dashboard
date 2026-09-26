import { apiClient } from "@/shared/api/client";
import type {
  CreateSubscriptionRequest,
  PatchAutoRenewRequest,
  PublicPlan,
  Subscription,
} from "@/features/subscription/types";

export async function getSubscription(): Promise<Subscription> {
  const { data } = await apiClient.get<Subscription>("/api/subscription");
  return data;
}

export async function getPublicPlans(): Promise<PublicPlan[]> {
  const { data } = await apiClient.get<PublicPlan[]>("/api/public/plans");
  return data;
}

export async function createSubscription(
  body: CreateSubscriptionRequest,
): Promise<Subscription> {
  const { data } = await apiClient.post<Subscription>(
    "/api/subscription",
    body,
  );
  return data;
}

export async function patchAutoRenew(
  body: PatchAutoRenewRequest,
): Promise<Subscription> {
  const { data } = await apiClient.patch<Subscription>(
    "/api/subscription/auto-renew",
    body,
  );
  return data;
}
