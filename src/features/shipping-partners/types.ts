export type CarrierFieldKind =
  | "SECRET"
  | "SELECT"
  | "BOOLEAN"
  | "TEXT"
  | "PICKUP_LOCATION";

export interface CarrierFieldOption {
  value: string;
  label: string;
}

export interface CarrierField {
  key: string;
  kind: CarrierFieldKind;
  required: boolean;
  label: string;
  defaultValue: string | boolean | null;
  options: CarrierFieldOption[];
}

export interface Carrier {
  code: string;
  nameEn: string;
  nameAr: string;
  fields: CarrierField[];
}

export interface CarrierSummary {
  code: string;
  nameEn: string;
  nameAr: string;
}

export interface PickupLocation {
  id: string;
  name: string;
  address: string;
  isDefault: boolean;
}

export interface TestConnectionResult {
  pickupLocations: PickupLocation[];
}

export type ConnectionOptionValue = string | boolean | null;

export interface CarrierConnection {
  id: string;
  carrier: CarrierSummary;
  name: string;
  active: boolean;
  credentialHint: string | null;
  options: Record<string, ConnectionOptionValue>;
  verifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type CarrierConnectionsSortField = "CREATED_AT" | "NAME";

export interface CarrierConnectionsListParams {
  page?: number;
  size?: number;
  sort?: CarrierConnectionsSortField;
  direction?: "ASC" | "DESC";
  search?: string;
  active?: boolean;
}

export interface CreateCarrierConnectionPayload {
  carrierCode: string;
  name: string;
  credentials: Record<string, string>;
  options: Record<string, string | boolean>;
}

export interface UpdateCarrierConnectionPayload {
  name: string;
  credentials?: Record<string, string>;
  options: Record<string, string | boolean>;
}

export interface ConnectionFormValues {
  name: string;
  active: boolean;
  credentials: Record<string, string>;
  options: Record<string, string | boolean>;
}
