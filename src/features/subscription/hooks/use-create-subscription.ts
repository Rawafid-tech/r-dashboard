import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { createSubscription } from "@/features/subscription/api/subscription.api";
import type { CreateSubscriptionRequest } from "@/features/subscription/types";
import { subscriptionQueryKeys } from "@/features/subscription/hooks/use-subscription";
import { getSubscriptionErrorKey } from "@/features/subscription/lib/subscription-errors";
import { walletKeys } from "@/features/wallet/hooks/use-wallet";
import { isApiError } from "@/shared/api/error-handler";

export function useCreateSubscription() {
  const queryClient = useQueryClient();
  const { t } = useTranslation("billing");
  const { t: tCommon } = useTranslation("common");

  return useMutation({
    mutationFn: (payload: CreateSubscriptionRequest) =>
      createSubscription(payload),
    onSuccess: (subscription) => {
      queryClient.setQueryData(
        subscriptionQueryKeys.current(),
        subscription,
      );
      void queryClient.invalidateQueries({ queryKey: walletKeys.all });
      toast.success(t("checkout.success"));
    },
    onError: (error) => {
      if (isApiError(error, 429)) {
        toast.error(tCommon("errors.rateLimited"));
        return;
      }

      const errorKey = getSubscriptionErrorKey(error);
      toast.error(t(`checkout.errors.${errorKey}`));
    },
  });
}
