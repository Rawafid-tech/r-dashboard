import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useCancelShipment } from "@/features/shipments/hooks/use-cancel-shipment";
import type { Shipment } from "@/features/shipments/types";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui";

interface ShipmentCancelDialogProps {
  shipment: Shipment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShipmentCancelDialog({
  shipment,
  open,
  onOpenChange,
}: ShipmentCancelDialogProps) {
  const { t } = useTranslation("shipments");
  const { t: tCommon } = useTranslation("common");
  const cancelMutation = useCancelShipment();

  const handleConfirm = async () => {
    if (!shipment) return;

    try {
      await cancelMutation.mutateAsync(shipment.id);
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
            {shipment
              ? t("cancel.description", {
                  number: shipment.order.orderNumber,
                })
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
            disabled={!shipment || cancelMutation.isPending}
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
