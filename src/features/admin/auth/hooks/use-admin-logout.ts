import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { logoutAdmin } from "@/features/admin/auth/api/admin-auth.api";
import { adminAuthQueryKeys } from "@/features/admin/auth/hooks/use-admin-me";
import { getRefreshToken } from "@/shared/lib/auth-tokens";
import { useAdminAuthStore } from "@/stores/admin-auth.store";

export function useAdminLogout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const clearTokens = useAdminAuthStore((state) => state.clearTokens);
  const { t } = useTranslation("common");

  return useMutation({
    mutationFn: async () => {
      const refreshToken = getRefreshToken("admin");
      if (refreshToken) {
        await logoutAdmin(refreshToken);
      }
    },
    onSettled: () => {
      clearTokens();
      queryClient.removeQueries({ queryKey: adminAuthQueryKeys.all });
      navigate("/admin/login", { replace: true });
    },
    onError: () => {
      toast.error(t("errors.networkError"));
    },
  });
}
