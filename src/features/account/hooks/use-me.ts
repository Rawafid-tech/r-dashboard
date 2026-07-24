import { useQuery } from "@tanstack/react-query";
import { getMe } from "@/features/account/api/account.api";

export const accountQueryKeys = {
  all: ["account"] as const,
  me: () => [...accountQueryKeys.all, "me"] as const,
};

export function useMe() {
  return useQuery({
    queryKey: accountQueryKeys.me(),
    queryFn: getMe,
  });
}
