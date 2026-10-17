import type {
  BookReturnPayload,
  BookReturnResult,
  ReturnPreview,
  ReturnPreviewParams,
} from "@/features/returns/types";
import type { Shipment } from "@/features/shipments/types";
import { apiClient } from "@/shared/api/client";

export async function getReturnPreview(
  params: ReturnPreviewParams,
  signal?: AbortSignal,
): Promise<ReturnPreview> {
  const { data } = await apiClient.get<ReturnPreview>(
    "/api/shipments/return-preview",
    { params, signal },
  );
  return data;
}

export async function bookReturn(
  payload: BookReturnPayload,
): Promise<BookReturnResult> {
  const response = await apiClient.post<Shipment>(
    "/api/shipments/returns",
    payload,
  );
  return {
    status: response.status,
    shipment: response.data,
  };
}
