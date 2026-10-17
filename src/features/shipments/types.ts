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

export type ShipmentKind = "DELIVERY" | "RETURN_PICKUP" | "EXCHANGE";

export type ShipmentsListTab =
  | "AWAITING_PICKUP"
  | "CURRENTLY_SHIPPING"
  | "DELIVERED"
  | "RETURNED"
  | "BOOKING"
  | "FAILED"
  | "CANCELLED";

export type ShipmentsSortField = "CREATED_AT" | "BOOKED_AT";

import type { CarrierCapabilities } from "@/shared/types/carrier-capabilities";

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
  capabilities?: CarrierCapabilities;
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
  "SWAPPED",
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

export interface ReturnPickupItem {
  orderItemId: string;
  name: string;
  sku: string | null;
  quantity: number;
}

export interface ReturnPickupAddress {
  addressLine: string | null;
  buildingNumber: string | null;
  floor: string | null;
  apartment: string | null;
  phone: string | null;
}

export interface ReturnPickup {
  reason: string | null;
  refundAmount: number | null;
  items: ReturnPickupItem[];
  pickupAddress: ReturnPickupAddress | null;
}

export interface ExchangeItem {
  orderItemId: string;
  name: string;
  sku: string | null;
  quantity: number;
}

export interface ExchangeAddress {
  addressLine: string | null;
  buildingNumber: string | null;
  floor: string | null;
  apartment: string | null;
  phone: string | null;
}

export interface Exchange {
  reason: string | null;
  collectAmount: number | null;
  refundAmount: number | null;
  items: ExchangeItem[];
  address: ExchangeAddress | null;
  swappedAt: string | null;
}

export interface Shipment {
  id: string;
  status: ShipmentStatus;
  kind?: ShipmentKind;
  returnPickup?: ReturnPickup | null;
  exchange?: Exchange | null;
  order: ShipmentOrderRef;
  receiverName: string;
  receiverPhone: string;
  connection: ShipmentConnectionRef;
  pickup: ShipmentPickupRef | null;
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
  kind?: ShipmentKind;
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

export interface ShipmentPickupRef {
  locationId: string;
  name: string | null;
}

export type ShipmentPickupSource = "MAPPED" | "DEFAULT";

export interface ShipmentPreviewPickup extends ShipmentPickupRef {
  source: ShipmentPickupSource;
}

export interface ShipmentQuota {
  planCode: string;
  limit: number;
  used: number;
  remaining: number;
  needed?: number;
}

export interface ShipmentPreviewAddress {
  method: ShipmentAddressMethod;
  district: ShipmentDistrict | null;
  suggestions: ShipmentDistrict[];
}

export interface ShipmentPreview {
  order: ShipmentPreviewOrder;
  connection: ShipmentConnectionRef;
  pickup: ShipmentPreviewPickup | null;
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
  kind?: ShipmentKind;
}

export interface BookShipmentPayload {
  orderId: string;
  connectionId: string;
  districtId?: string | null;
}

export interface BatchLabelsPayload {
  shipmentIds: string[];
}

/** Request line for POST /api/shipments/preview (bulk). */
export interface BulkPreviewLineRequest {
  orderId: string;
  connectionId?: string;
  districtId?: string;
}

export interface BulkPreviewPayload {
  lines: BulkPreviewLineRequest[];
}

export interface BulkPreviewLocationRef {
  senderLocationId?: string;
  name?: string;
  governorate: {
    id: string;
    code: string;
    nameEn: string;
    nameAr: string;
  };
}

export interface BulkPreviewToRef {
  governorate: {
    id: string;
    code: string;
    nameEn: string;
    nameAr: string;
  };
  area: string;
}

export interface BulkPreviewLineError {
  code?: string;
  message: string;
  status?: number;
}

export interface BulkPreviewLine {
  orderId: string;
  order: ShipmentPreviewOrder | null;
  from: BulkPreviewLocationRef;
  to: BulkPreviewToRef;
  packagesCount: number;
  totalWeightKg: number;
  connection: ShipmentConnectionRef | null;
  pickup: ShipmentPreviewPickup | null;
  address: ShipmentPreviewAddress | null;
  problems: ShipmentProblem[];
  bookable: boolean;
  error: BulkPreviewLineError | null;
}

export interface BulkPreviewQuota extends ShipmentQuota {
  needed: number;
}

export interface BulkPreviewResponse {
  lines: BulkPreviewLine[];
  quota: BulkPreviewQuota | null;
}

/** Request line for POST /api/shipments/bulk. */
export interface BulkBookLineRequest {
  orderId: string;
  connectionId: string;
  districtId?: string | null;
}

export interface BulkBookPayload {
  lines: BulkBookLineRequest[];
}

export type BulkBookOutcome = "BOOKED" | "BOOKING" | "REJECTED";

export interface BulkBookRowError {
  code: string;
  message: string;
  status: number;
  details?: Record<string, unknown> & {
    suggestions?: ShipmentDistrict[];
    limit?: number;
    shipmentId?: string;
    reason?: string;
    problems?: ShipmentProblem[];
  };
}

export interface BulkBookResultRow {
  orderId: string;
  outcome: BulkBookOutcome;
  shipment: Shipment | null;
  error: BulkBookRowError | null;
}

export interface BulkBookResponse {
  results: BulkBookResultRow[];
  booked: number;
  rejected: number;
}

/** Client-side draft while editing the bulk booking modal. */
export interface BulkBookingLineDraft {
  orderId: string;
  connectionId?: string;
  districtId?: string;
  removed?: boolean;
  /** Set after bulk submit for rows still in the modal. */
  bulkError?: string | null;
  bulkOutcome?: BulkBookOutcome | null;
}
