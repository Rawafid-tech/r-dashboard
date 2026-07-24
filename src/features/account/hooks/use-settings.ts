import { useQuery } from "@tanstack/react-query";
import { getSettings } from "@/features/account/api/account.api";

export const settingsQueryKeys = {
  all: ["settings"] as const,
  detail: () => [...settingsQueryKeys.all, "detail"] as const,
};

export function useSettings() {
  return useQuery({
    queryKey: settingsQueryKeys.detail(),
    queryFn: getSettings,
  });
}
