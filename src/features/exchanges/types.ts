import type {
  ShipmentConnectionRef,
  ShipmentPreviewAddress,
  ShipmentPreviewPickup,
  ShipmentProblem,
  ShipmentQuota,
} from "@/features/shipments/types";
import type { Shipment } from "@/features/shipments/types";
import type { ExistingReturnRef } from "@/features/returns/types";

export interface ExchangePreviewOrderItem {
  id: string;
  name: string;
  sku: string | null;
  unitPrice: number;
  quantity: number;
  returnable: number;
}

export interface ExchangePreviewOrder {
  id: string;
  orderNumber: string;
  receiverName: string;
  receiverPhone: string;
  area: string;
  addressLine: string;
  orderValue: number;
  refundable: number;
  items: ExchangePreviewOrderItem[];
}

export interface ExchangePreview {
  order: ExchangePreviewOrder;
  connections: ShipmentConnectionRef[];
  connection: ShipmentConnectionRef | null;
  pickup: ShipmentPreviewPickup | null;
  address: ShipmentPreviewAddress;
  problems: ShipmentProblem[];
  quota: ShipmentQuota | null;
  existingReturn: ExistingReturnRef | null;
  bookable: boolean;
}

export interface ExchangePreviewParams {
  orderId: string;
  connectionId?: string;
  districtId?: string;
}

export interface ExchangeAddressPayload {
  addressLine?: string;
  buildingNumber?: string | null;
  floor?: string | null;
  apartment?: string | null;
  phone?: string;
}

export interface BookExchangeItemPayload {
  orderItemId: string;
  quantity: number;
}

export interface BookExchangePayload {
  orderId: string;
  connectionId?: string | null;
  districtId?: string | null;
  items: BookExchangeItemPayload[];
  reason?: string;
  collectAmount?: number;
  refundAmount?: number;
  address?: ExchangeAddressPayload;
  notes?: string;
}

export interface BookExchangeResult {
  status: number;
  shipment: Shipment;
}
