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
import {
  useActivateSenderLocation,
  useDeactivateSenderLocation,
} from "@/features/locations/hooks/use-sender-location-status";
import type { SenderLocation } from "@/features/locations/types";

export type LocationStatusConfirmMode = "activate" | "deactivate";

interface LocationStatusConfirmDialogProps {
  location: SenderLocation | null;
  mode: LocationStatusConfirmMode | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LocationStatusConfirmDialog({
  location,
  mode,
  open,
  onOpenChange,
}: LocationStatusConfirmDialogProps) {
  const { t } = useTranslation("locations");
  const { t: tCommon } = useTranslation("common");
  const activateMutation = useActivateSenderLocation();
  const deactivateMutation = useDeactivateSenderLocation();

  const busy = activateMutation.isPending || deactivateMutation.isPending;
  const isActivate = mode === "activate";

  const handleConfirm = async () => {
    if (!location) return;

    try {
      if (isActivate) {
        await activateMutation.mutateAsync(location.id);
      } else {
        await deactivateMutation.mutateAsync(location.id);
      }
      onOpenChange(false);
    } catch {
      // Toast handled in hooks.
    }
  };

  const title = isActivate
    ? t("statusConfirm.activateTitle")
    : t("statusConfirm.deactivateTitle");
  const description = location
    ? isActivate
      ? t("statusConfirm.activateDescription", { name: location.name })
      : t("statusConfirm.deactivateDescription", { name: location.name })
    : "";

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
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={busy}
            onClick={() => onOpenChange(false)}
          >
            {t("statusConfirm.cancel")}
          </Button>
          <Button
            type="button"
            variant={isActivate ? "default" : "destructive"}
            disabled={!location || busy}
            onClick={() => void handleConfirm()}
          >
            {busy ? (
              <>
                <Loader2 className="animate-spin" aria-hidden="true" />
                {t("statusConfirm.working")}
              </>
            ) : isActivate ? (
              t("statusConfirm.activate")
            ) : (
              t("statusConfirm.deactivate")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
