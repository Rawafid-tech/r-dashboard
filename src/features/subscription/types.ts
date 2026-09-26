import type {
  BillingPeriod,
  SubscriptionStatus,
  PlanFeatureType,
} from "@/shared/types/enums";

export interface PlanTier {
  shipmentsPerMonth: number;
  monthlyPrice: number;
  yearlyPrice: number;
}

export interface PlanFeature {
  label: string;
  type: PlanFeatureType;
  number: number | null;
  enabled: boolean | null;
  text: string | null;
}

export interface PublicPlan {
  code: string;
  name: string;
  description: string | null;
  highlighted: boolean;
  customPricing: boolean;
  tiers: PlanTier[];
  features: PlanFeature[];
}

export interface Subscription {
  id: string;
  planId: string;
  planCode: string;
  planName: string;
  shipmentsPerMonth: number;
  price: number;
  billingPeriod: BillingPeriod | null;
  startsAt: string;
  endsAt: string | null;
  status: SubscriptionStatus;
  autoRenew: boolean;
  graceUntil: string | null;
}

export interface CreateSubscriptionRequest {
  planCode: string;
  shipmentsPerMonth: number;
  billingPeriod: BillingPeriod;
}

export interface PatchAutoRenewRequest {
  autoRenew: boolean;
}

export interface CheckoutSelection {
  planCode: string;
  planName: string;
  shipmentsPerMonth: number;
  billingPeriod: BillingPeriod;
  price: number;
}
