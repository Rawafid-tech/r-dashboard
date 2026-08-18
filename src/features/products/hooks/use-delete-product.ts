import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { deleteProduct } from "@/features/products/api/products.api";
import { productKeys } from "@/features/products/hooks/use-products";
import { isApiError, parseApiError } from "@/shared/api/error-handler";

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  const { t } = useTranslation("products");
  const { t: tCommon } = useTranslation("common");

  return useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: (_data, id) => {
      void queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.removeQueries({ queryKey: productKeys.detail(id) });
      toast.success(t("toast.deleted"));
    },
    onError: (error) => {
      if (isApiError(error, 403)) {
        toast.error(tCommon("errors.forbidden"));
        return;
      }

      if (isApiError(error, 404)) {
        toast.error(t("toast.notFound"));
        return;
      }

      toast.error(parseApiError(error).detail || t("toast.deleteFailed"));
    },
  });
}
