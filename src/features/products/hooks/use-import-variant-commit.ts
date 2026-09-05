import { commitImportVariants } from "@/features/products/lib/import-variant-commit";
import { productKeys } from "@/features/products/hooks/use-products";
import type {
  ImportVariantCommitResult,
  ImportVariantRow,
} from "@/features/products/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

export function useImportVariantCommit() {
  const queryClient = useQueryClient();
  const { t } = useTranslation("products");

  return useMutation({
    mutationFn: (rows: ImportVariantRow[]) => commitImportVariants(rows, t),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: productKeys.details() });
    },
  });
}

export type { ImportVariantCommitResult };
