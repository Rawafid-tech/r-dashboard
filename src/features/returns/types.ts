import type {
  ShipmentConnectionRef,
  ShipmentPreviewAddress,
  ShipmentPreviewPickup,
  ShipmentProblem,
  ShipmentQuota,
  ShipmentStatus,
} from "@/features/shipments/types";
import type { Shipment } from "@/features/shipments/types";

export interface ReturnPreviewOrderItem {
  id: string;
  name: string;
  sku: string | null;
  unitPrice: number;
  quantity: number;
  returnable: number;
}

export interface ReturnPreviewOrder {
  id: string;
  orderNumber: string;
  receiverName: string;
  receiverPhone: string;
  area: string;
  addressLine: string;
  orderValue: number;
  refundable: number;
  items: ReturnPreviewOrderItem[];
}

export interface ExistingReturnRef {
  shipmentId: string;
  status: ShipmentStatus;
  kind: "RETURN_PICKUP";
}

export interface ReturnPreview {
  order: ReturnPreviewOrder;
  connections: ShipmentConnectionRef[];
  connection: ShipmentConnectionRef | null;
  pickup: ShipmentPreviewPickup | null;
  address: ShipmentPreviewAddress;
  problems: ShipmentProblem[];
  quota: ShipmentQuota | null;
  existingReturn: ExistingReturnRef | null;
  bookable: boolean;
}

export interface ReturnPreviewParams {
  orderId: string;
  connectionId?: string;
  districtId?: string;
}

export interface ReturnPickupAddressPayload {
  addressLine?: string;
  buildingNumber?: string | null;
  floor?: string | null;
  apartment?: string | null;
  phone?: string;
}

export interface BookReturnItemPayload {
  orderItemId: string;
  quantity: number;
}

export interface BookReturnPayload {
  orderId: string;
  connectionId?: string | null;
  districtId?: string | null;
  items: BookReturnItemPayload[];
  reason?: string;
  refundAmount?: number;
  pickupAddress?: ReturnPickupAddressPayload;
  notes?: string;
}

export interface BookReturnResult {
  status: number;
  shipment: Shipment;
}
