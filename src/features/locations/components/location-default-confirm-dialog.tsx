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
import { useSetDefaultSenderLocation } from "@/features/locations/hooks/use-set-default-sender-location";
import type { SenderLocation } from "@/features/locations/types";

interface LocationDefaultConfirmDialogProps {
  location: SenderLocation | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LocationDefaultConfirmDialog({
  location,
  open,
  onOpenChange,
}: LocationDefaultConfirmDialogProps) {
  const { t } = useTranslation("locations");
  const { t: tCommon } = useTranslation("common");
  const setDefaultMutation = useSetDefaultSenderLocation();

  const busy = setDefaultMutation.isPending;

  const handleConfirm = async () => {
    if (!location) return;

    try {
      await setDefaultMutation.mutateAsync(location.id);
      onOpenChange(false);
    } catch {
      // Toast handled in hook.
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (busy) return;
        onOpenChange(next);
      }}
    >
      <DialogContent
        size="w1"
        className="gap-0 overflow-hidden"
        showCloseButton={!busy}
        closeLabel={tCommon("common.close")}
      >
        <DialogHeader className="border-b border-border/60 pe-10">
          <DialogTitle>{t("defaultConfirm.title")}</DialogTitle>
          <DialogDescription>
            {location
              ? t("defaultConfirm.description", { name: location.name })
              : ""}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={busy}
            onClick={() => onOpenChange(false)}
          >
            {t("defaultConfirm.cancel")}
          </Button>
          <Button
            type="button"
            disabled={!location || busy}
            onClick={() => void handleConfirm()}
          >
            {busy ? (
              <>
                <Loader2 className="animate-spin" aria-hidden="true" />
                {t("defaultConfirm.working")}
              </>
            ) : (
              t("defaultConfirm.confirm")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
