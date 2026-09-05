import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { importProducts } from "@/features/products/api/product-import.api";
import type { ImportRequest } from "@/features/products/types";
import { isApiError, parseApiError } from "@/shared/api/error-handler";

export function useImportPreview() {
  const { t } = useTranslation("products");
  const { t: tCommon } = useTranslation("common");

  return useMutation({
    mutationFn: (payload: ImportRequest) => importProducts(payload),
    onError: (error) => {
      if (isApiError(error, 403)) {
        toast.error(tCommon("errors.forbidden"));
        return;
      }

      toast.error(parseApiError(error).detail || t("import.toast.previewFailed"));
    },
  });
}
