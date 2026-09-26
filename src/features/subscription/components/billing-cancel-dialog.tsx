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
import { formatDate } from "@/shared/lib/formatters";
import { usePatchAutoRenew } from "@/features/subscription/hooks/use-patch-auto-renew";
import type { Subscription } from "@/features/subscription/types";
import type { DateFormat } from "@/shared/types/enums";

interface BillingCancelDialogProps {
  subscription: Subscription | null;
  dateFormat?: DateFormat;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BillingCancelDialog({
  subscription,
  dateFormat = "DD_MM_YYYY",
  open,
  onOpenChange,
}: BillingCancelDialogProps) {
  const { t } = useTranslation("billing");
  const patchMutation = usePatchAutoRenew();

  const busy = patchMutation.isPending;
  const endsAtLabel = subscription?.endsAt
    ? formatDate(subscription.endsAt, dateFormat)
    : "—";

  const handleConfirm = async () => {
    try {
      await patchMutation.mutateAsync({ autoRenew: false });
      onOpenChange(false);
    } catch {
      // Toast handled in mutation hook.
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="w4">
        <DialogHeader>
          <DialogTitle>{t("cancel.title")}</DialogTitle>
          <DialogDescription>
            {t("cancel.description", { date: endsAtLabel })}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={busy}
          >
            {t("cancel.keep")}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => void handleConfirm()}
            disabled={busy}
            aria-busy={busy}
          >
            {busy ? (
              <>
                <Loader2 className="animate-spin" aria-hidden="true" />
                {t("checkout.processing")}
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
