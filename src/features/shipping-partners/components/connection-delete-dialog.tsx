import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useDeleteCarrierConnection } from "@/features/shipping-partners/hooks/use-delete-carrier-connection";
import type { CarrierConnection } from "@/features/shipping-partners/types";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui";

interface ConnectionDeleteDialogProps {
  connection: CarrierConnection | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ConnectionDeleteDialog({
  connection,
  open,
  onOpenChange,
}: ConnectionDeleteDialogProps) {
  const { t } = useTranslation("shippingPartners");
  const { t: tCommon } = useTranslation("common");
  const deleteMutation = useDeleteCarrierConnection();

  const handleConfirm = async () => {
    if (!connection) return;

    try {
      await deleteMutation.mutateAsync(connection.id);
      onOpenChange(false);
    } catch {
      // Toast is raised by the mutation hook.
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
            {t("delete.description", { name: connection?.name ?? "" })}
          </DialogDescription>
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
            disabled={!connection || deleteMutation.isPending}
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
