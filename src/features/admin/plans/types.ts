import type { PlanStatus, PlanFeatureType } from "@/shared/types/enums";

export interface LocaleMap {
  en: string | null;
  ar: string | null;
}

export interface AdminPlanTier {
  id?: string;
  shipmentsPerMonth: number;
  monthlyPrice: number;
  yearlyPrice: number;
  sortOrder: number;
}

export interface AdminPlanFeature {
  label: LocaleMap;
  type: PlanFeatureType;
  number?: number | null;
  enabled?: boolean | null;
  text?: string | null;
}

export interface AdminPlan {
  id: string;
  code: string;
  name: LocaleMap | null;
  description: LocaleMap | null;
  highlighted: boolean;
  customPricing: boolean;
  sortOrder: number;
  status: PlanStatus;
  isDefault: boolean;
  tiers: AdminPlanTier[];
  features: AdminPlanFeature[];
  createdAt: string;
  updatedAt: string;
}

export interface CreatePlanRequest {
  code: string;
  name: LocaleMap;
  description: LocaleMap;
  highlighted: boolean;
  customPricing: boolean;
  sortOrder: number;
  tiers: Omit<AdminPlanTier, "id">[];
  features: AdminPlanFeature[];
}

export type UpdatePlanRequest = Omit<CreatePlanRequest, "code">;
