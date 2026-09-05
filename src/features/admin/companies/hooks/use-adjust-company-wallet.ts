import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { adjustAdminCompanyWallet } from "@/features/admin/companies/api/admin-companies.api";
import { adminCompaniesQueryKeys } from "@/features/admin/companies/hooks/use-admin-companies";
import type { WalletAdjustmentRequest } from "@/features/wallet/types";
import {
  getFieldErrors,
  isApiError,
  parseApiError,
} from "@/shared/api/error-handler";
import type { UseFormSetError } from "react-hook-form";
import type { WalletAdjustFormValues } from "@/features/admin/companies/lib/wallet-adjust-schema";

export function useAdjustCompanyWallet(companyId: string) {
  const queryClient = useQueryClient();
  const { t } = useTranslation("admin");
  const { t: tCommon } = useTranslation("common");

  return useMutation({
    mutationFn: (body: WalletAdjustmentRequest) =>
      adjustAdminCompanyWallet(companyId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: adminCompaniesQueryKeys.wallet(companyId),
      });
      void queryClient.invalidateQueries({
        queryKey: adminCompaniesQueryKeys.lists(),
      });
      toast.success(t("companies.toast.walletAdjusted"));
    },
    onError: (error) => {
      if (isApiError(error, 403)) {
        toast.error(tCommon("errors.forbidden"));
        return;
      }

      if (isApiError(error, 404)) {
        toast.error(t("companies.toast.companyNotFound"));
        return;
      }

      if (isApiError(error, 409)) {
        const apiError = parseApiError(error);
        toast.error(apiError.detail || t("companies.toast.walletAdjustFailed"));
        return;
      }

      const apiError = parseApiError(error);
      toast.error(apiError.detail || t("companies.toast.walletAdjustFailed"));
    },
  });
}

export function applyWalletAdjustFieldErrors(
  error: unknown,
  setError: UseFormSetError<WalletAdjustFormValues>,
): boolean {
  const fieldErrors = getFieldErrors(error);
  if (!fieldErrors) return false;

  Object.entries(fieldErrors).forEach(([name, reason]) => {
    if (name === "direction" || name === "amount" || name === "note") {
      setError(name, { message: reason });
    }
  });

  return true;
}
