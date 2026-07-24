import type { CompanySize, MonthlyShipmentVolume, BillingPeriod } from "@/shared/types/enums";

export interface AdminCompany {
  id: string;
  identifier: number;
  name: string;
  logoUrl: string | null;
  size: CompanySize | null;
  industry: string | null;
  website: string | null;
  shipFromCountry: string;
  monthlyShipmentVolume: MonthlyShipmentVolume;
  planCode: string;
  createdAt: string;
  updatedAt: string;
}

export interface AssignSubscriptionRequest {
  planId: string;
  shipmentsPerMonth: number;
  billingPeriod: BillingPeriod;
}
