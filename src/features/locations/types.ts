import type { SenderLocationStatus } from "@/shared/types/enums";

export type LocationsSortField = "CREATED_AT" | "NAME";

export interface LocationsListParams {
  page?: number;
  size?: number;
  sort?: LocationsSortField;
  direction?: "ASC" | "DESC";
  search?: string;
  governorateId?: string;
  status?: SenderLocationStatus;
}

export interface Country {
  id: string;
  code: string;
  nameEn: string;
  nameAr: string;
}

export interface Governorate {
  id: string;
  code: string;
  countryCode: string;
  nameEn: string;
  nameAr: string;
}

export interface GeoArea {
  id: string;
  nameAr: string;
  nameEn: string | null;
}

export interface SenderLocation {
  id: string;
  name: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  countryCode: string;
  governorateId: string;
  governorateNameEn: string | null;
  governorateNameAr: string | null;
  area: string;
  addressLine: string;
  street: string | null;
  buildingNumber: string | null;
  postalCode: string | null;
  latitude: number | null;
  longitude: number | null;
  isDefault: boolean;
  status: SenderLocationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface SenderLocationPayload {
  name: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  countryCode: string;
  governorateId: string;
  area: string;
  addressLine: string;
  street?: string;
  buildingNumber?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
}
