import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { updateProduct } from "@/features/products/api/products.api";
import { productKeys } from "@/features/products/hooks/use-products";
import { isDuplicateSkuConflict } from "@/features/products/lib/product-form-errors";
import type { ProductPayload } from "@/features/products/types";
import { isApiError, parseApiError } from "@/shared/api/error-handler";

export function useUpdateProduct(id: string) {
  const queryClient = useQueryClient();
  const { t } = useTranslation("products");
  const { t: tCommon } = useTranslation("common");

  return useMutation({
    mutationFn: (payload: ProductPayload) => updateProduct(id, payload),
    onSuccess: (product) => {
      void queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.setQueryData(productKeys.detail(product.id), product);
      toast.success(t("toast.updated"));
    },
    onError: (error) => {
      if (isApiError(error, 403)) {
        toast.error(tCommon("errors.forbidden"));
        return;
      }

      if (isDuplicateSkuConflict(error)) {
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
