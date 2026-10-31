import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { logoutUser } from "@/features/account/api/account.api";
import { getRefreshToken } from "@/shared/lib/auth-tokens";
import { useAuthStore } from "@/stores/auth.store";

export function useLogout() {
  const navigate = useNavigate();
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
      navigate("/login", { replace: true });
    },
    onError: () => {
      toast.error(t("errors.networkError"));
    },
  });
}
