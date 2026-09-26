import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { patchAutoRenew } from "@/features/subscription/api/subscription.api";
import type { PatchAutoRenewRequest } from "@/features/subscription/types";
import { subscriptionQueryKeys } from "@/features/subscription/hooks/use-subscription";
import { getSubscriptionErrorKey } from "@/features/subscription/lib/subscription-errors";
import { isApiError } from "@/shared/api/error-handler";

export function usePatchAutoRenew() {
  const queryClient = useQueryClient();
  const { t } = useTranslation("billing");
  const { t: tCommon } = useTranslation("common");

  return useMutation({
    mutationFn: (payload: PatchAutoRenewRequest) => patchAutoRenew(payload),
    onSuccess: (subscription) => {
      queryClient.setQueryData(
        subscriptionQueryKeys.current(),
        subscription,
      );
      toast.success(
        subscription.autoRenew
          ? t("autoRenew.enabledSuccess")
          : t("autoRenew.disabledSuccess"),
      );
    },
    onError: (error) => {
      if (isApiError(error, 429)) {
        toast.error(tCommon("errors.rateLimited"));
        return;
      }

      const errorKey = getSubscriptionErrorKey(error);
      toast.error(t(`autoRenew.errors.${errorKey}`));
    },
  });
}
