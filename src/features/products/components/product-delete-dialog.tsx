import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui";
import { useDeleteProduct } from "@/features/products/hooks/use-delete-product";
import type { Product } from "@/features/products/types";

interface ProductDeleteDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductDeleteDialog({
  product,
  open,
  onOpenChange,
}: ProductDeleteDialogProps) {
  const { t } = useTranslation("products");
  const { t: tCommon } = useTranslation("common");
  const deleteMutation = useDeleteProduct();

  const handleConfirm = async () => {
    if (!product) return;

    try {
      await deleteMutation.mutateAsync(product.id);
      onOpenChange(false);
    } catch {
      // Toast handled in mutation hook.
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (deleteMutation.isPending) return;
        onOpenChange(next);
      }}
    >
      <DialogContent
        size="w1"
        className="gap-0 overflow-hidden"
        showCloseButton={!deleteMutation.isPending}
        closeLabel={tCommon("common.close")}
      >
        <DialogHeader className="border-b border-border/60 pe-10">
          <DialogTitle>{t("delete.title")}</DialogTitle>
          <DialogDescription>
            {product
              ? t("delete.description", { name: product.name })
              : t("delete.description", { name: "" })}
          </DialogDescription>
          <p className="pt-2 text-sm text-muted-foreground" role="note">
            {t("delete.hint")}
          </p>
        </DialogHeader>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={deleteMutation.isPending}
            onClick={() => onOpenChange(false)}
          >
            {t("delete.cancel")}
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={!product || deleteMutation.isPending}
            onClick={() => void handleConfirm()}
          >
            {deleteMutation.isPending ? (
              <>
                <Loader2 className="animate-spin" aria-hidden="true" />
                {t("delete.deleting")}
              </>
            ) : (
              t("delete.confirm")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
