import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useDeleteAdminCarrier } from "@/features/admin/carriers/hooks/use-delete-admin-carrier";
import type { AdminCarrier } from "@/features/admin/carriers/types";
import { carrierDisplayName } from "@/features/shipping-partners/lib/carrier-label";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui";

interface CarrierDeleteDialogProps {
  carrier: AdminCarrier | null;
  locale: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CarrierDeleteDialog({
  carrier,
  locale,
  open,
  onOpenChange,
}: CarrierDeleteDialogProps) {
  const { t } = useTranslation("admin");
  const { t: tCommon } = useTranslation("common");
  const deleteMutation = useDeleteAdminCarrier();

  const name = carrier
    ? carrierDisplayName(
        {
          code: carrier.code,
          nameEn: carrier.nameEn ?? "",
          nameAr: carrier.nameAr ?? "",
        },
        locale,
      )
    : "";

  const handleConfirm = async () => {
    if (!carrier) return;
    try {
      await deleteMutation.mutateAsync(carrier.code);
      onOpenChange(false);
    } catch {
      // Toast from mutation hook.
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
          <DialogTitle>{t("carriers.form.delete.title")}</DialogTitle>
          <DialogDescription>
            {t("carriers.form.delete.description", { name })}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 border-t border-border/60 px-4 py-4">
          <Button
            type="button"
            variant="outline"
            disabled={deleteMutation.isPending}
            onClick={() => onOpenChange(false)}
          >
            {tCommon("common.cancel")}
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={!carrier || deleteMutation.isPending}
            onClick={() => void handleConfirm()}
          >
            {deleteMutation.isPending ? (
              <>
                <Loader2 className="animate-spin" aria-hidden="true" />
                {t("carriers.form.delete.confirming")}
              </>
            ) : (
              t("carriers.form.delete.confirm")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
