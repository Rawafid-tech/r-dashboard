import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { importProducts } from "@/features/products/api/product-import.api";
import { productCategoryKeys } from "@/features/products/hooks/use-product-categories";
import { productKeys } from "@/features/products/hooks/use-products";
import type { ImportRequest } from "@/features/products/types";
import { isApiError, parseApiError } from "@/shared/api/error-handler";

export function useImportCommit() {
  const queryClient = useQueryClient();
  const { t } = useTranslation("products");
  const { t: tCommon } = useTranslation("common");

  return useMutation({
    mutationFn: (payload: ImportRequest) => importProducts(payload),
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      void queryClient.invalidateQueries({
        queryKey: productCategoryKeys.tree(),
      });

      const updatedCount = result.updatedSkus?.length ?? 0;
      if (updatedCount > 0 && result.created > 0) {
        toast.success(
          t("import.toast.committedMixed", {
            created: result.created,
            updated: updatedCount,
          }),
        );
      } else if (updatedCount > 0) {
        toast.success(
          t("import.toast.updated", { count: updatedCount }),
        );
      } else {
        toast.success(t("import.toast.committed", { count: result.created }));
      }
    },
    onError: (error) => {
      if (isApiError(error, 422)) {
        toast.error(
          parseApiError(error).detail || t("import.toast.nothingWritten"),
        );
        return;
      }

      if (isApiError(error, 403)) {
        toast.error(tCommon("errors.forbidden"));
        return;
      }

      toast.error(parseApiError(error).detail || t("import.toast.commitFailed"));
    },
  });
}
