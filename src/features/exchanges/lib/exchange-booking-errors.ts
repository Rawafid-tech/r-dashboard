import { AxiosError } from "axios";
import {
  hasBookingProblem,
  parseShipmentBookingError,
} from "@/features/shipments/lib/shipment-booking-errors";
import { parseApiError } from "@/shared/api/error-handler";

export type ExchangeErrorAction =
  | "billing"
  | "shippingPartners"
  | "editOrder"
  | "retry"
  | "retryWithoutRefund"
  | "none";

export interface ExchangeErrorPresentation {
  detail: string;
  action: ExchangeErrorAction;
  shipmentId?: string;
  orderItemId?: string;
  returnable?: number;
  refundable?: number;
}

function readProblemBody(error: unknown): Record<string, unknown> | null {
  if (!(error instanceof AxiosError) || !error.response?.data) return null;
  const data = error.response.data;
  if (typeof data === "object" && data !== null) {
    return data as Record<string, unknown>;
  }
  return null;
}

export function parseExchangeBookingError(
  error: unknown,
): ExchangeErrorPresentation {
  const base = parseShipmentBookingError(error);
  const body = readProblemBody(error);
  const apiError = parseApiError(error);

  const orderItemId =
    typeof body?.orderItemId === "string" ? body.orderItemId : undefined;
  const returnable =
    typeof body?.returnable === "number" ? body.returnable : undefined;
  const refundable =
    typeof body?.refundable === "number" ? body.refundable : undefined;
  const reason =
    typeof body?.reason === "string" ? body.reason : undefined;

  // Refused before anything was saved: the partner gives no refunds.
  if (
    apiError.status === 422 &&
    hasBookingProblem(error, "REFUND_NOT_ALLOWED")
  ) {
    return { detail: apiError.detail, action: "retryWithoutRefund" };
  }

  if (apiError.status === 422 && reason === "REJECTED") {
    return {
      detail: apiError.detail,
      action: "retryWithoutRefund",
      shipmentId: base.shipmentId,
    };
  }

  if (apiError.status === 409) {
    const detail = apiError.detail.toLowerCase();
    if (
      detail.includes("already has a return") ||
      detail.includes("return or an exchange")
    ) {
      return { detail: apiError.detail, action: "none" };
    }
    if (
      detail.includes("delivered order can be returned") ||
      detail.includes("returned or exchanged")
    ) {
      return { detail: apiError.detail, action: "none" };
    }
  }

  const actionMap: Record<
    ReturnType<typeof parseShipmentBookingError>["action"],
    ExchangeErrorAction
  > = {
    billing: "billing",
    shippingPartners: "shippingPartners",
    editOrder: "editOrder",
    retry: "retry",
    none: "none",
  };

  return {
    detail: base.detail,
    action: actionMap[base.action],
    shipmentId: base.shipmentId,
    orderItemId,
    returnable,
    refundable,
  };
}
