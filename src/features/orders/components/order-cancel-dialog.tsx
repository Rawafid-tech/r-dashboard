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
import { useCancelOrder } from "@/features/orders/hooks/use-cancel-order";
import type { OrderListRow } from "@/features/orders/types";

interface OrderCancelDialogProps {
  order: OrderListRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrderCancelDialog({
  order,
  open,
  onOpenChange,
}: OrderCancelDialogProps) {
  const { t } = useTranslation("orders");
  const { t: tCommon } = useTranslation("common");
  const cancelMutation = useCancelOrder();

  const handleConfirm = async () => {
    if (!order) return;

    try {
      await cancelMutation.mutateAsync(order.id);
      onOpenChange(false);
    } catch {
      // Toast handled in mutation hook.
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (cancelMutation.isPending) return;
        onOpenChange(next);
      }}
    >
      <DialogContent
        size="w1"
        className="gap-0 overflow-hidden"
        showCloseButton={!cancelMutation.isPending}
        closeLabel={tCommon("common.close")}
      >
        <DialogHeader className="border-b border-border/60 pe-10">
          <DialogTitle>{t("cancel.title")}</DialogTitle>
          <DialogDescription>
            {order
              ? t("cancel.description", { number: order.orderNumber })
              : t("cancel.description", { number: "" })}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={cancelMutation.isPending}
            onClick={() => onOpenChange(false)}
          >
            {t("cancel.dismiss")}
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={!order || cancelMutation.isPending}
            onClick={() => void handleConfirm()}
          >
            {cancelMutation.isPending ? (
              <>
                <Loader2 className="animate-spin" aria-hidden="true" />
                {t("cancel.confirming")}
              </>
            ) : (
              t("cancel.confirm")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
