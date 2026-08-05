import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { updateRole } from "@/features/roles/api/roles.api";
import { permissionsQueryKeys } from "@/features/roles/hooks/use-permissions-catalog";
import { rolesQueryKeys } from "@/features/roles/hooks/use-roles";
import { isRoleApiErrorCode } from "@/features/roles/lib/role-form-errors";
import type { RoleUpsertPayload } from "@/features/roles/types";
import { isApiError, parseApiError } from "@/shared/api/error-handler";

export function useUpdateRole(roleId: string) {
  const queryClient = useQueryClient();
  const { t } = useTranslation("roles");
  const { t: tCommon } = useTranslation("common");

  return useMutation({
    mutationFn: (payload: RoleUpsertPayload) => updateRole(roleId, payload),
    onSuccess: (role) => {
      void queryClient.invalidateQueries({ queryKey: rolesQueryKeys.lists() });
      queryClient.setQueryData(rolesQueryKeys.detail(role.id), role);
      toast.success(t("toast.updated"));
    },
    onError: (error) => {
      if (isApiError(error, 403)) {
        toast.error(tCommon("errors.forbidden"));
        return;
      }

      if (isRoleApiErrorCode(error, "auth.roleNotFound")) {
        void queryClient.invalidateQueries({ queryKey: rolesQueryKeys.all });
        toast.error(parseApiError(error).detail || t("toast.notFound"));
        return;
      }

      if (isRoleApiErrorCode(error, "auth.roleNameTaken")) {
        return;
      }

      if (isRoleApiErrorCode(error, "auth.unknownPermission")) {
        void queryClient.invalidateQueries({
          queryKey: permissionsQueryKeys.all,
        });
        toast.error(parseApiError(error).detail || t("toast.unknownPermission"));
        return;
      }

      if (isApiError(error, 429)) {
        toast.error(tCommon("errors.rateLimited"));
        return;
      }

      const apiError = parseApiError(error);
      toast.error(apiError.detail || t("toast.saveFailed"));
    },
  });
}
