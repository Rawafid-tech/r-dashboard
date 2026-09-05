import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { createProduct } from "@/features/products/api/products.api";
import { productKeys } from "@/features/products/hooks/use-products";
import { isDuplicateSkuConflict, isVariantsFieldError } from "@/features/products/lib/product-form-errors";
import type { CreateProductPayload } from "@/features/products/types";
import { isApiError, parseApiError } from "@/shared/api/error-handler";

export function useCreateProduct() {
  const queryClient = useQueryClient();
  const { t } = useTranslation("products");
  const { t: tCommon } = useTranslation("common");

  return useMutation({
    mutationFn: (payload: CreateProductPayload) => createProduct(payload),
    onSuccess: (product) => {
      void queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.setQueryData(productKeys.detail(product.id), product);
      toast.success(t("toast.created"));
    },
    onError: (error) => {
      if (isApiError(error, 403)) {
        toast.error(tCommon("errors.forbidden"));
        return;
      }

      if (isDuplicateSkuConflict(error) || isVariantsFieldError(error)) {
        return;
      }

      toast.error(parseApiError(error).detail || t("toast.saveFailed"));
    },
  });
}
