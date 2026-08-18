import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { updateProductCategory } from "@/features/products/api/product-categories.api";
import { productCategoryKeys } from "@/features/products/hooks/use-product-categories";
import {
  isDuplicateCategoryNameConflict,
} from "@/features/products/hooks/use-create-product-category";
import type { ProductCategoryPayload } from "@/features/products/types";
import { isApiError, parseApiError } from "@/shared/api/error-handler";

export function useUpdateProductCategory(id: string) {
  const queryClient = useQueryClient();
  const { t } = useTranslation("products");
  const { t: tCommon } = useTranslation("common");

  return useMutation({
    mutationFn: (payload: ProductCategoryPayload) =>
      updateProductCategory(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: productCategoryKeys.all,
      });
      void queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success(t("categories.toast.updated"));
    },
    onError: (error) => {
      if (isApiError(error, 403)) {
        toast.error(tCommon("errors.forbidden"));
        return;
      }

      if (isDuplicateCategoryNameConflict(error)) {
        return;
      }

      if (isApiError(error, 404)) {
        toast.error(t("categories.toast.notFound"));
        return;
      }

      toast.error(
        parseApiError(error).detail || t("categories.toast.saveFailed"),
      );
    },
  });
}
