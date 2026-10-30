import { AxiosError } from "axios";
import type { ShipmentProblemCode } from "@/features/shipments/types";
import { parseApiError } from "@/shared/api/error-handler";

export type ShipmentErrorAction =
  | "billing"
  | "shippingPartners"
  | "editOrder"
  | "retry"
  | "none";

export interface ShipmentErrorPresentation {
  detail: string;
  action: ShipmentErrorAction;
  shipmentId?: string;
}

function readProblemBody(error: unknown): Record<string, unknown> | null {
  if (!(error instanceof AxiosError) || !error.response?.data) return null;
  const data = error.response.data;
  if (typeof data === "object" && data !== null) {
    return data as Record<string, unknown>;
  }
  return null;
}

/**
 * Whether a refused booking names this preview problem. The problem body may
 * carry it as `reason`, `code`, or inside `problems[]`.
 */
export function hasBookingProblem(
  error: unknown,
  code: ShipmentProblemCode,
): boolean {
  const body = readProblemBody(error);
  if (!body) return false;
  if (body.reason === code || body.code === code) return true;
  const problems = body.problems;
  return (
    Array.isArray(problems) &&
    problems.some(
      (problem: unknown) =>
        typeof problem === "object" &&
        problem !== null &&
        (problem as { code?: unknown }).code === code,
    )
  );
}

export function parseShipmentBookingError(
  error: unknown,
): ShipmentErrorPresentation {
  const apiError = parseApiError(error);
  const body = readProblemBody(error);
  const reason =
    typeof body?.reason === "string" ? body.reason : undefined;
  const shipmentId =
    typeof body?.shipmentId === "string" ? body.shipmentId : undefined;

  if (apiError.status === 409) {
    const detail = apiError.detail.toLowerCase();
    if (
      detail.includes("subscription") ||
      detail.includes("plan allows") ||
      detail.includes("upgrade")
    ) {
      return { detail: apiError.detail, action: "billing" };
    }
    if (reason === "NOT_ALLOWED") {
      return { detail: apiError.detail, action: "none" };
    }
    if (detail.includes("not confirmed")) {
      return { detail: apiError.detail, action: "retry" };
    }
  }

  if (apiError.status === 422) {
    if (reason === "CONNECTION_UNAVAILABLE" || reason === "CREDENTIALS") {
      return { detail: apiError.detail, action: "shippingPartners" };
    }
    if (reason === "REJECTED") {
      return {
        detail: apiError.detail,
        action: "none",
        shipmentId,
      };
    }
    return { detail: apiError.detail, action: "editOrder" };
  }

  return { detail: apiError.detail, action: "none", shipmentId };
}
