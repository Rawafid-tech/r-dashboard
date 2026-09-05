import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { replaceProductVariants } from "@/features/products/api/products.api";
import { productKeys } from "@/features/products/hooks/use-products";
import {
  isDuplicateVariantNameConflict,
  isVariantsFieldError,
} from "@/features/products/lib/product-form-errors";
import type { ReplaceVariantsPayload } from "@/features/products/types";
import { isApiError, parseApiError } from "@/shared/api/error-handler";

export function useReplaceProductVariants(productId: string) {
  const queryClient = useQueryClient();
  const { t } = useTranslation("products");
  const { t: tCommon } = useTranslation("common");

  return useMutation({
    mutationFn: (payload: ReplaceVariantsPayload) =>
      replaceProductVariants(productId, payload),
    onSuccess: (variants) => {
      void queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.setQueryData(productKeys.detail(productId), (current) => {
        if (!current || typeof current !== "object") return current;
        return { ...current, variants };
      });
    },
    onError: (error) => {
      if (isApiError(error, 403)) {
        toast.error(tCommon("errors.forbidden"));
        return;
      }

      if (isDuplicateVariantNameConflict(error) || isVariantsFieldError(error)) {
        return;
      }

      if (isApiError(error, 404)) {
        toast.error(t("toast.notFound"));
        return;
      }

      toast.error(parseApiError(error).detail || t("toast.saveFailed"));
    },
  });
}
