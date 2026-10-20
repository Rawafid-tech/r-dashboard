export type AdminCarrierPlatform = "ACCURATE" | "BOSTA" | (string & {});

export interface AdminCarrierSettings {
  baseUrl?: string;
  clientId?: string;
  returns?: string;
  [key: string]: string | undefined;
}

export interface AdminCarrier {
  id?: string;
  code: string;
  platform?: AdminCarrierPlatform;
  nameEn?: string;
  nameAr?: string;
  logoUrl?: string | null;
  enabled: boolean;
  running: boolean;
  sortOrder?: number;
  settings?: AdminCarrierSettings;
}

export type CarrierPlatformFieldKind = "TEXT" | "BOOLEAN";

export interface CarrierPlatformField {
  key: string;
  required: boolean;
  label?: string;
  kind?: CarrierPlatformFieldKind;
  defaultValue?: string | boolean | null;
}

export interface CarrierPlatform {
  platform: AdminCarrierPlatform;
  carrierFields: CarrierPlatformField[];
}

export interface CreateAdminCarrierPayload {
  code: string;
  platform: AdminCarrierPlatform;
  nameEn: string;
  nameAr: string;
  settings: Record<string, string>;
  sortOrder?: number;
  enabled?: boolean;
}

export interface PatchAdminCarrierPayload {
  nameEn?: string;
  nameAr?: string;
  settings?: Record<string, string>;
  sortOrder?: number;
}

export interface CarrierPlaceName {
  id?: string;
  nameEn?: string | null;
  nameAr?: string | null;
  primary?: boolean;
}

export interface CarrierRegion {
  id: string;
  governorateId?: string | null;
  city: CarrierPlaceName;
  zone: CarrierPlaceName;
  districtId: string;
  districtNameEn?: string | null;
  districtNameAr?: string | null;
  pickupAvailable: boolean;
  dropOffAvailable: boolean;
  active: boolean;
  changedAt?: string | null;
}

export interface CarrierRegionsListParams {
  governorateId?: string;
  unmapped?: boolean;
  active?: boolean;
  search?: string;
  page?: number;
  size?: number;
}

export interface CarrierUnmappedCityObject {
  id?: string;
  nameEn?: string | null;
  nameAr?: string | null;
  name?: string | null;
}

export type CarrierUnmappedCity = string | CarrierUnmappedCityObject;

export interface CarrierRegionsSyncResult {
  added: number;
  updated: number;
  retired: number;
  total: number;
  unmappedCities: CarrierUnmappedCity[];
}

export type RegionResolveMethod = "DISTRICT" | "ZONE" | "HEAD" | "NONE";

export interface RegionResolveDistrict {
  districtId?: string;
  districtNameEn?: string | null;
  districtNameAr?: string | null;
  zone?: CarrierPlaceName | null;
  city?: CarrierPlaceName | null;
  pickupAvailable?: boolean;
  dropOffAvailable?: boolean;
  active?: boolean;
}

export interface RegionResolveResult {
  method: RegionResolveMethod;
  text: string;
  district: RegionResolveDistrict | null;
  fallbackCity: CarrierPlaceName | null;
}

export interface RegionResolveRequest {
  governorateId: string;
  district: string;
}
