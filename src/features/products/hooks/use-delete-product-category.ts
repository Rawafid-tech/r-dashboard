import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { deleteProductCategory } from "@/features/products/api/product-categories.api";
import { productCategoryKeys } from "@/features/products/hooks/use-product-categories";
import type { ProductCategoryPayload } from "@/features/products/types";
import { isApiError, parseApiError } from "@/shared/api/error-handler";

const HAS_CHILDREN_MARKERS = [
  "Delete or move the sub-categories first",
  "احذف الفئات الفرعية أو انقلها",
] as const;

export function isCategoryHasChildrenConflict(error: unknown): boolean {
  if (!isApiError(error, 409)) return false;
  const detail = parseApiError(error).detail;
  return HAS_CHILDREN_MARKERS.some((marker) => detail.includes(marker));
}

export function useDeleteProductCategory() {
  const queryClient = useQueryClient();
  const { t } = useTranslation("products");
  const { t: tCommon } = useTranslation("common");

  return useMutation({
    mutationFn: (id: string) => deleteProductCategory(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: productCategoryKeys.all,
      });
      void queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success(t("categories.toast.deleted"));
    },
    onError: (error) => {
      if (isApiError(error, 403)) {
        toast.error(tCommon("errors.forbidden"));
        return;
      }

      if (isCategoryHasChildrenConflict(error)) {
        toast.error(parseApiError(error).detail);
        return;
      }

      if (isApiError(error, 404)) {
        toast.error(t("categories.toast.notFound"));
        return;
      }

      toast.error(
        parseApiError(error).detail || t("categories.toast.deleteFailed"),
      );
    },
  });
}

// Keep payload helper colocated for category forms
export function toCategoryPayload(values: {
  name: string;
  parentId?: string;
}): ProductCategoryPayload {
  const payload: ProductCategoryPayload = {
    name: values.name.trim(),
  };

  if (values.parentId?.trim()) {
    payload.parentId = values.parentId.trim();
  } else {
    payload.parentId = null;
  }

  return payload;
}
