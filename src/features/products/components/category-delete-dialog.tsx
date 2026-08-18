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
import { useDeleteProductCategory } from "@/features/products/hooks/use-delete-product-category";
import { categoryHasChildren } from "@/features/products/lib/category-tree-utils";
import type { ProductCategory } from "@/features/products/types";

interface CategoryDeleteDialogProps {
  category: ProductCategory | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CategoryDeleteDialog({
  category,
  open,
  onOpenChange,
}: CategoryDeleteDialogProps) {
  const { t } = useTranslation("products");
  const { t: tCommon } = useTranslation("common");
  const deleteMutation = useDeleteProductCategory();

  const hasChildren = category ? categoryHasChildren(category) : false;
  const productCount = category?.productCount ?? 0;

  const handleConfirm = async () => {
    if (!category || hasChildren) return;

    try {
      await deleteMutation.mutateAsync(category.id);
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
          <DialogTitle>{t("categories.delete.title")}</DialogTitle>
          <DialogDescription>
            {category
              ? t("categories.delete.description", { name: category.name })
              : t("categories.delete.description", { name: "" })}
          </DialogDescription>
          {hasChildren ? (
            <p className="pt-2 text-sm text-warning" role="note">
              {t("categories.delete.hasChildrenWarning")}
            </p>
          ) : productCount > 0 ? (
            <p className="pt-2 text-sm text-muted-foreground" role="note">
              {t("categories.delete.uncategorizedWarning", {
                count: productCount,
              })}
            </p>
          ) : null}
        </DialogHeader>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={deleteMutation.isPending}
            onClick={() => onOpenChange(false)}
          >
            {t("categories.delete.cancel")}
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={!category || deleteMutation.isPending || hasChildren}
            onClick={() => void handleConfirm()}
          >
            {deleteMutation.isPending ? (
              <>
                <Loader2 className="animate-spin" aria-hidden="true" />
                {t("categories.delete.deleting")}
              </>
            ) : (
              t("categories.delete.confirm")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
