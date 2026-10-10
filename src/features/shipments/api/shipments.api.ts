import type {
  BatchLabelsPayload,
  BookShipmentPayload,
  Shipment,
  ShipmentCounts,
  ShipmentDistrict,
  ShipmentPreview,
  ShipmentPreviewParams,
  ShipmentDistrictsParams,
  ShipmentsListParams,
} from "@/features/shipments/types";
import { apiClient } from "@/shared/api/client";
import type { PaginatedResponse } from "@/shared/types/api";

export async function getShipments(
  params: ShipmentsListParams = {},
): Promise<PaginatedResponse<Shipment>> {
  const { data } = await apiClient.get<PaginatedResponse<Shipment>>(
    "/api/shipments",
    { params },
  );
  return data;
}

export async function getShipmentCounts(): Promise<ShipmentCounts> {
  const { data } = await apiClient.get<ShipmentCounts>("/api/shipments/counts");
  return data;
}

export async function getShipment(
  id: string,
  signal?: AbortSignal,
): Promise<Shipment> {
  const { data } = await apiClient.get<Shipment>(
    `/api/shipments/${encodeURIComponent(id)}`,
    { signal },
  );
  return data;
}

export async function getShipmentPreview(
  params: ShipmentPreviewParams,
  signal?: AbortSignal,
): Promise<ShipmentPreview> {
  const { data } = await apiClient.get<ShipmentPreview>(
    "/api/shipments/preview",
    { params, signal },
  );
  return data;
}

export async function getShipmentDistricts(
  params: ShipmentDistrictsParams,
  signal?: AbortSignal,
): Promise<ShipmentDistrict[]> {
  const { data } = await apiClient.get<ShipmentDistrict[]>(
    "/api/shipments/districts",
    { params, signal },
  );
  return data;
}

export interface BookShipmentResult {
  status: number;
  shipment: Shipment;
}

export async function bookShipment(
  payload: BookShipmentPayload,
): Promise<BookShipmentResult> {
  const response = await apiClient.post<Shipment>("/api/shipments", payload);
  return {
    status: response.status,
    shipment: response.data,
  };
}

export async function cancelShipment(id: string): Promise<Shipment> {
  const { data } = await apiClient.post<Shipment>(
    `/api/shipments/${encodeURIComponent(id)}/cancel`,
  );
  return data;
}

export async function getShipmentLabel(
  id: string,
  signal?: AbortSignal,
): Promise<Blob> {
  const { data } = await apiClient.get<Blob>(
    `/api/shipments/${encodeURIComponent(id)}/label`,
    {
      responseType: "blob",
      signal,
    },
  );
  return data;
}

export async function getBatchShipmentLabels(
  payload: BatchLabelsPayload,
  signal?: AbortSignal,
): Promise<Blob> {
  const { data } = await apiClient.post<Blob>("/api/shipments/labels", payload, {
    responseType: "blob",
    signal,
  });
  return data;
}
