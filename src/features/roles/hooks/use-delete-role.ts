import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { deleteRole } from "@/features/roles/api/roles.api";
import { rolesQueryKeys } from "@/features/roles/hooks/use-roles";
import { isRoleApiErrorCode } from "@/features/roles/lib/role-form-errors";
import { isApiError, parseApiError } from "@/shared/api/error-handler";

export function useDeleteRole() {
  const queryClient = useQueryClient();
  const { t } = useTranslation("roles");
  const { t: tCommon } = useTranslation("common");

  return useMutation({
    mutationFn: (roleId: string) => deleteRole(roleId),
    onSuccess: (_data, roleId) => {
      void queryClient.invalidateQueries({ queryKey: rolesQueryKeys.lists() });
      queryClient.removeQueries({ queryKey: rolesQueryKeys.detail(roleId) });
      toast.success(t("toast.deleted"));
    },
    onError: (error) => {
      if (isApiError(error, 403)) {
        toast.error(tCommon("errors.forbidden"));
        return;
      }

      if (isRoleApiErrorCode(error, "auth.roleInUse")) {
        toast.error(parseApiError(error).detail || t("toast.inUse"));
        return;
      }

      if (
        isRoleApiErrorCode(error, "auth.roleNotFound") ||
        isApiError(error, 404)
      ) {
        void queryClient.invalidateQueries({ queryKey: rolesQueryKeys.all });
        toast.error(parseApiError(error).detail || t("toast.notFound"));
        return;
      }

      if (isApiError(error, 429)) {
        toast.error(tCommon("errors.rateLimited"));
        return;
      }

      const apiError = parseApiError(error);
      toast.error(apiError.detail || t("toast.deleteFailed"));
    },
  });
}
