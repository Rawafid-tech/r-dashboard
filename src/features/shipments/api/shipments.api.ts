import type {
  BatchLabelsPayload,
  BookShipmentPayload,
  BulkBookPayload,
  BulkBookResponse,
  BulkPreviewPayload,
  BulkPreviewResponse,
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

function serializeShipmentsListParams(params: ShipmentsListParams): string {
  const search = new URLSearchParams();

  const append = (key: string, value: string | number | undefined) => {
    if (value === undefined || value === "") return;
    search.append(key, String(value));
  };

  append("page", params.page);
  append("size", params.size);
  append("sort", params.sort);
  append("direction", params.direction);
  append("kind", params.kind);
  append("connectionId", params.connectionId);
  append("orderId", params.orderId);
  append("from", params.from);
  append("to", params.to);
  append("search", params.search);

  if (params.status) {
    const statuses = Array.isArray(params.status)
      ? params.status
      : [params.status];
    statuses.forEach((status) => search.append("status", status));
  }

  return search.toString();
}

export async function getShipments(
  params: ShipmentsListParams = {},
): Promise<PaginatedResponse<Shipment>> {
  const { data } = await apiClient.get<PaginatedResponse<Shipment>>(
    "/api/shipments",
    {
      params,
      paramsSerializer: () => serializeShipmentsListParams(params),
    },
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

export async function postShipmentPreview(
  payload: BulkPreviewPayload,
  signal?: AbortSignal,
): Promise<BulkPreviewResponse> {
  const { data } = await apiClient.post<BulkPreviewResponse>(
    "/api/shipments/preview",
    payload,
    { signal },
  );
  return data;
}

const BULK_BOOK_TIMEOUT_MS = 90_000;

export async function postBulkShipments(
  payload: BulkBookPayload,
  signal?: AbortSignal,
): Promise<BulkBookResponse> {
  const { data } = await apiClient.post<BulkBookResponse>(
    "/api/shipments/bulk",
    payload,
    { signal, timeout: BULK_BOOK_TIMEOUT_MS },
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
