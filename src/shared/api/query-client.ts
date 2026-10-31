import { QueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";

/** Client errors (4xx) won't succeed on retry; network and 5xx errors might. */
function shouldRetry(failureCount: number, error: unknown) {
  const status = error instanceof AxiosError ? error.response?.status : undefined;
  if (status !== undefined && status >= 400 && status < 500) return false;
  return failureCount < 1;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Orders, shipments and wallet change often; reference data (geo,
      // carriers, permission catalog) sets its own longer staleTime.
      staleTime: 60 * 1000,
      retry: shouldRetry,
      refetchOnWindowFocus: true,
    },
  },
});

/**
 * Drops every cached query. Call whenever the signed-in identity changes
 * (login, logout, password change) so one tenant's data is never served
 * to the next session in the same tab.
 */
export function resetServerState() {
  queryClient.removeQueries();
}
