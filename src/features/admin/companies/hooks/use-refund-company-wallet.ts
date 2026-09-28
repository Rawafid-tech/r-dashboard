import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { refundAdminCompanyWallet } from "@/features/admin/companies/api/admin-companies.api";
import { adminCompaniesQueryKeys } from "@/features/admin/companies/hooks/use-admin-companies";
import type { WalletRefundFormValues } from "@/features/admin/companies/lib/wallet-refund-schema";
import type { WalletRefundRequest } from "@/features/wallet/types";
import {
  getFieldErrors,
  isApiError,
  parseApiError,
} from "@/shared/api/error-handler";
import type { UseFormSetError } from "react-hook-form";

export function useRefundCompanyWallet(companyId: string) {
  const queryClient = useQueryClient();
  const { t } = useTranslation("admin");
  const { t: tCommon } = useTranslation("common");

  return useMutation({
    mutationFn: ({
      transactionId,
      body,
    }: {
      transactionId: string;
      body: WalletRefundRequest;
    }) => refundAdminCompanyWallet(companyId, transactionId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: adminCompaniesQueryKeys.wallet(companyId),
      });
      void queryClient.invalidateQueries({
        queryKey: adminCompaniesQueryKeys.lists(),
      });
      toast.success(t("companies.toast.walletRefunded"));
    },
    onError: (error) => {
      const fieldErrors = getFieldErrors(error);
      const hasFormField =
        fieldErrors !== null &&
        Object.keys(fieldErrors).some(
          (name) => name === "amount" || name === "note",
        );
      if (hasFormField) return;

      if (isApiError(error, 403)) {
        toast.error(tCommon("errors.forbidden"));
        return;
      }

      const apiError = parseApiError(error);
      toast.error(apiError.detail || t("companies.toast.walletRefundFailed"));
    },
  });
}

export function applyWalletRefundFieldErrors(
  error: unknown,
  setError: UseFormSetError<WalletRefundFormValues>,
): boolean {
  const fieldErrors = getFieldErrors(error);
  if (!fieldErrors) return false;

  let applied = false;
  Object.entries(fieldErrors).forEach(([name, reason]) => {
    if (name === "amount" || name === "note") {
      setError(name, { message: reason });
      applied = true;
    }
  });

  return applied;
}
