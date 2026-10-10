export const SHIPMENT_STATUS_VALUES = [
  "BOOKING",
  "BOOKED",
  "FAILED",
  "CANCELLED",
] as const;

export type ShipmentStatus = (typeof SHIPMENT_STATUS_VALUES)[number];

export type ShipmentsSortField = "CREATED_AT" | "BOOKED_AT";

export type ShipmentsListTab = ShipmentStatus;

export type ShipmentAddressMethod =
  | "DISTRICT"
  | "ZONE"
  | "HEAD"
  | "NONE"
  | "CHOSEN";

export interface ShipmentConnectionRef {
  id: string;
  name: string;
  carrierCode: string;
  carrierNameEn: string;
  carrierNameAr: string;
  active: boolean;
}

export interface ShipmentDistrict {
  id: string;
  externalId: string;
  nameEn: string;
  nameAr: string;
  zoneNameEn: string;
  zoneNameAr: string;
  cityNameEn: string;
  cityNameAr: string;
  method?: ShipmentAddressMethod;
}

export interface ShipmentOrderRef {
  id: string;
  orderNumber: string;
}

export interface ShipmentCarrierState {
  code: string;
  label: string;
}

export interface ShipmentFailure {
  code: string;
  message: string;
}

export interface Shipment {
  id: string;
  status: ShipmentStatus;
  order: ShipmentOrderRef;
  receiverName: string;
  receiverPhone: string;
  connection: ShipmentConnectionRef;
  trackingNumber: string | null;
  carrierState: ShipmentCarrierState | null;
  district: ShipmentDistrict | null;
  codAmount: number;
  failure: ShipmentFailure | null;
  bookedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ShipmentCounts = Record<ShipmentStatus, number>;

export interface ShipmentsListParams {
  page?: number;
  size?: number;
  sort?: ShipmentsSortField;
  direction?: "ASC" | "DESC";
  status?: ShipmentStatus;
  connectionId?: string;
  orderId?: string;
  from?: string;
  to?: string;
  search?: string;
}

export interface ShipmentPreviewOrder {
  id: string;
  orderNumber: string;
  receiverName: string;
  receiverPhone: string;
  area: string;
  codAmount: number;
}

export interface ShipmentProblem {
  code: string;
  message: string;
}

export interface ShipmentQuota {
  planCode: string;
  limit: number;
  used: number;
  remaining: number;
}

export interface ShipmentPreviewAddress {
  method: ShipmentAddressMethod;
  district: ShipmentDistrict | null;
  suggestions: ShipmentDistrict[];
}

export interface ShipmentPreview {
  order: ShipmentPreviewOrder;
  connection: ShipmentConnectionRef;
  address: ShipmentPreviewAddress;
  problems: ShipmentProblem[];
  quota: ShipmentQuota | null;
  bookable: boolean;
}

export interface ShipmentPreviewParams {
  orderId: string;
  connectionId: string;
  districtId?: string;
}

export interface ShipmentDistrictsParams {
  connectionId: string;
  governorateId: string;
  search?: string;
}

export interface BookShipmentPayload {
  orderId: string;
  connectionId: string;
  districtId?: string | null;
}

export interface BatchLabelsPayload {
  shipmentIds: string[];
}
