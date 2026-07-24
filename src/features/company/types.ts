import type { CompanySize, MonthlyShipmentVolume } from "@/shared/types/enums";

export interface Company {
  id: string;
  identifier: number;
  name: string;
  logoUrl: string | null;
  size: CompanySize | null;
  industry: string | null;
  website: string | null;
  shipFromCountry: string;
  monthlyShipmentVolume: MonthlyShipmentVolume;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateCompanyRequest {
  name: string;
  size?: CompanySize | null;
  industry?: string | null;
  website?: string | null;
  shipFromCountry: string;
  monthlyShipmentVolume: MonthlyShipmentVolume;
}
