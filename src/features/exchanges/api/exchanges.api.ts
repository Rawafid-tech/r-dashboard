import type {
  BookExchangePayload,
  BookExchangeResult,
  ExchangePreview,
  ExchangePreviewParams,
} from "@/features/exchanges/types";
import type { Shipment } from "@/features/shipments/types";
import { apiClient } from "@/shared/api/client";

export async function getExchangePreview(
  params: ExchangePreviewParams,
  signal?: AbortSignal,
): Promise<ExchangePreview> {
  const { data } = await apiClient.get<ExchangePreview>(
    "/api/shipments/exchange-preview",
    { params, signal },
  );
  return data;
}

export async function bookExchange(
  payload: BookExchangePayload,
): Promise<BookExchangeResult> {
  const response = await apiClient.post<Shipment>(
    "/api/shipments/exchanges",
    payload,
  );
  return {
    status: response.status,
    shipment: response.data,
  };
}
