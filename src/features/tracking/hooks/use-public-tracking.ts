import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { getPublicTracking } from "@/features/tracking/api/tracking.api";

export const publicTrackingKeys = {
  all: ["publicTracking"] as const,
  detail: (code: string, locale: string) => [...publicTrackingKeys.all, code, locale] as const,
};

/** True when the code is unknown or mistyped (404). */
export function isTrackingNotFound(error: unknown): boolean {
  return isAxiosError(error) && error.response?.status === 404;
}

export function usePublicTracking(code: string, locale: string) {
  return useQuery({
    queryKey: publicTrackingKeys.detail(code, locale),
    queryFn: ({ signal }) => getPublicTracking(code, locale, signal),
    enabled: code.length > 0,
    // Rawafid caches the answer for 60 s: asking more often shows nothing new.
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => !isTrackingNotFound(error) && failureCount < 2,
  });
}
