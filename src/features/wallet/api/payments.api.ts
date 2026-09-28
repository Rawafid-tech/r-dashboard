import { apiClient } from "@/shared/api/client";
import type { PaginatedResponse } from "@/shared/types/api";
import type {
  Payment,
  PaymentsListParams,
  TopUpRequest,
  TopUpResponse,
} from "@/features/wallet/types";

/**
 * POST /api/payments/topup
 *
 * Returns a single-use checkout URL to redirect the customer to.
 * Never cache or reuse `checkoutUrl` — call this again for a fresh one.
 *
 * Possible errors:
 *  - 400 with `minimum` field → below minimum top-up amount
 *  - 400 with `errors[]`     → structural validation (≤ 0, > 1 000 000, etc.)
 *  - 502                     → payment gateway unavailable, safe to retry
 */
export async function createTopUp(body: TopUpRequest): Promise<TopUpResponse> {
  const { data } = await apiClient.post<TopUpResponse>(
    "/api/payments/topup",
    body,
  );
  return data;
}

/**
 * GET /api/payments
 *
 * Requires wallet:read permission.
 * Returns the company's payment history, newest first by default.
 */
export async function getPayments(
  params: PaymentsListParams = {},
): Promise<PaginatedResponse<Payment>> {
  const { data } = await apiClient.get<PaginatedResponse<Payment>>(
    "/api/payments",
    { params },
  );
  return data;
}

/**
 * GET /api/payments/{id}
 *
 * Returns 404 for both "not found" and "belongs to another company".
 * Do not distinguish between the two in copy.
 */
export async function getPayment(id: string): Promise<Payment> {
  const { data } = await apiClient.get<Payment>(`/api/payments/${id}`);
  return data;
}
