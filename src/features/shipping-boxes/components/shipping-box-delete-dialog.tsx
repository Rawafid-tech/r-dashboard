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
import { useDeleteShippingBox } from "@/features/shipping-boxes/hooks/use-delete-shipping-box";
import type { ShippingBox } from "@/features/shipping-boxes/types";

interface ShippingBoxDeleteDialogProps {
  box: ShippingBox | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShippingBoxDeleteDialog({
  box,
  open,
  onOpenChange,
}: ShippingBoxDeleteDialogProps) {
  const { t } = useTranslation("shippingBoxes");
  const { t: tCommon } = useTranslation("common");
  const deleteMutation = useDeleteShippingBox();

  const handleConfirm = async () => {
    if (!box) return;

    try {
      await deleteMutation.mutateAsync(box.id);
      onOpenChange(false);
    } catch {
      // Toast handled in the mutation hook.
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
            {box
              ? t("delete.description", { name: box.name })
              : t("delete.description", { name: "" })}
          </DialogDescription>
          {box?.isDefault ? (
            <p className="pt-2 text-sm text-warning" role="note">
              {t("delete.defaultWarning")}
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
            {t("delete.cancel")}
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={!box || deleteMutation.isPending}
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
