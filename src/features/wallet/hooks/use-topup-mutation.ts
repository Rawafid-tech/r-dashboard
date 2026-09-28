import { AxiosError } from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTopUp } from "@/features/wallet/api/payments.api";
import { paymentsKeys } from "@/features/wallet/hooks/use-payments";
import { walletKeys } from "@/features/wallet/hooks/use-wallet";
import type { TopUpMinimumError, TopUpRequest } from "@/features/wallet/types";

/**
 * Detects the "below minimum" 400 error shape.
 * The `minimum` field sits at the top level of the problem detail —
 * NOT nested under `errors[]` like structural validation errors.
 */
export function parseTopUpMinimumError(
  error: unknown,
): TopUpMinimumError | null {
  if (!(error instanceof AxiosError)) return null;
  if (error.response?.status !== 400) return null;

  const data = error.response.data as Record<string, unknown>;
  if (typeof data.minimum === "number" && typeof data.currency === "string") {
    return data as unknown as TopUpMinimumError;
  }

  return null;
}

/**
 * Mutation for POST /api/payments/topup.
 *
 * On success → redirects the browser to the single-use hosted checkout URL.
 * The URL is opaque. Do not parse it or embed it; 3-D Secure needs a full page.
 * A failed checkout cannot be reused — call this again for a new URL.
 * Caller is responsible for showing field-level errors (minimum / structural).
 *
 * The mutation does NOT invalidate caches on success because the redirect
 * takes the user away immediately. Cache invalidation happens when the user
 * returns to /wallet and the home component re-fetches.
 */
export function useTopUpMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: TopUpRequest) => createTopUp(body),
    onSuccess: (data) => {
      // Optimistically invalidate so the returned data is fresh
      // when the user comes back from checkout.
      void queryClient.invalidateQueries({ queryKey: walletKeys.all });
      void queryClient.invalidateQueries({ queryKey: paymentsKeys.all });

      // Full-page redirect — do NOT use an iframe (breaks 3DS OTP).
      window.location.href = data.checkoutUrl;
    },
  });
}
