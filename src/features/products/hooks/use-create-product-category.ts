import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { createProductCategory } from "@/features/products/api/product-categories.api";
import { productCategoryKeys } from "@/features/products/hooks/use-product-categories";
import type { ProductCategoryPayload } from "@/features/products/types";
import { isApiError, parseApiError } from "@/shared/api/error-handler";

const DUPLICATE_NAME_MARKERS = [
  "already have a category with this name",
  "لديك بالفعل فئة بهذا الاسم",
] as const;

const CEILING_MARKERS = [
  "maximum number of categories",
  "الحد الأقصى لعدد الفئات",
] as const;

export function isDuplicateCategoryNameConflict(error: unknown): boolean {
  if (!isApiError(error, 409)) return false;
  const detail = parseApiError(error).detail;
  return DUPLICATE_NAME_MARKERS.some((marker) => detail.includes(marker));
}

export function isCategoryCeilingConflict(error: unknown): boolean {
  if (!isApiError(error, 409)) return false;
  const detail = parseApiError(error).detail;
  return CEILING_MARKERS.some((marker) => detail.includes(marker));
}

export function useCreateProductCategory() {
  const queryClient = useQueryClient();
  const { t } = useTranslation("products");
  const { t: tCommon } = useTranslation("common");

  return useMutation({
    mutationFn: (payload: ProductCategoryPayload) =>
      createProductCategory(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: productCategoryKeys.all,
      });
      toast.success(t("categories.toast.created"));
    },
    onError: (error) => {
      if (isApiError(error, 403)) {
        toast.error(tCommon("errors.forbidden"));
        return;
      }

      if (isDuplicateCategoryNameConflict(error) || isCategoryCeilingConflict(error)) {
        return;
      }

      toast.error(
        parseApiError(error).detail || t("categories.toast.saveFailed"),
      );
    },
  });
}
