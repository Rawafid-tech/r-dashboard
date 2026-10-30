import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
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
