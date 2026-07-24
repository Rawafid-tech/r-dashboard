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
  description: string;
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
}
