export const SHIPMENT_STATUS_VALUES = [
  "BOOKING",
  "BOOKED",
  "IN_TRANSIT",
  "RETURNING",
  "DELIVERED",
  "RETURNED",
  "LOST",
  "FAILED",
  "CANCELLED",
] as const;

export type ShipmentStatus = (typeof SHIPMENT_STATUS_VALUES)[number];

export type ShipmentsListTab =
  | "AWAITING_PICKUP"
  | "CURRENTLY_SHIPPING"
  | "DELIVERED"
  | "RETURNED"
  | "BOOKING"
  | "FAILED"
  | "CANCELLED";

export type ShipmentsSortField = "CREATED_AT" | "BOOKED_AT";

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

export interface ShipmentIssue {
  code: string;
  reason: string;
}

export const SHIPMENT_TIMELINE_STATE_VALUES = [
  "AWAITING_PICKUP",
  "IN_TRANSIT",
  "RETURNING",
  "EXCEPTION",
  "DELIVERED",
  "RETURNED",
  "LOST",
  "CANCELLED",
  "IGNORED",
] as const;

export type ShipmentTimelineState =
  (typeof SHIPMENT_TIMELINE_STATE_VALUES)[number];

export type ShipmentTimelineSource = "WEBHOOK" | "POLL";

export interface ShipmentTimelineEntry {
  state: ShipmentTimelineState;
  carrierState: ShipmentCarrierState | null;
  issue: ShipmentIssue | null;
  occurredAt: string;
  source: ShipmentTimelineSource;
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
  issue: ShipmentIssue | null;
  attempts: number | null;
  bookedAt: string | null;
  pickedUpAt: string | null;
  deliveredAt: string | null;
  returnedAt: string | null;
  cancelledAt: string | null;
  lastUpdateAt: string | null;
  timeline: ShipmentTimelineEntry[] | null;
  createdAt: string;
  updatedAt: string;
}

export type ShipmentCounts = Record<ShipmentStatus, number>;

export interface ShipmentsListParams {
  page?: number;
  size?: number;
  sort?: ShipmentsSortField;
  direction?: "ASC" | "DESC";
  status?: ShipmentStatus | ShipmentStatus[];
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
