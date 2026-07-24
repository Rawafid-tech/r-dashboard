import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { logoutUser } from "@/features/account/api/account.api";
import { accountQueryKeys } from "@/features/account/hooks/use-me";
import { companyQueryKeys } from "@/features/company/hooks/use-company";
import { subscriptionQueryKeys } from "@/features/subscription/hooks/use-subscription";
import { getRefreshToken } from "@/shared/lib/auth-tokens";
import { useAuthStore } from "@/stores/auth.store";

export function useLogout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const clearTokens = useAuthStore((state) => state.clearTokens);
  const { t } = useTranslation("common");

  return useMutation({
    mutationFn: async () => {
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        await logoutUser(refreshToken);
      }
    },
    onSettled: () => {
      clearTokens();
      queryClient.removeQueries({ queryKey: accountQueryKeys.all });
      queryClient.removeQueries({ queryKey: companyQueryKeys.all });
      queryClient.removeQueries({ queryKey: subscriptionQueryKeys.all });
      navigate("/login", { replace: true });
    },
    onError: () => {
      toast.error(t("errors.networkError"));
    },
  });
}
