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
  useActivateCompanyUser,
  useDeactivateCompanyUser,
} from "@/features/users/hooks/use-user-activation";
import { UserStatus } from "@/shared/types/enums";
import type { CompanyUser } from "@/features/users/types";

export type StatusConfirmMode = "activate" | "deactivate";

interface UserStatusConfirmDialogProps {
  user: CompanyUser | null;
  mode: StatusConfirmMode | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserStatusConfirmDialog({
  user,
  mode,
  open,
  onOpenChange,
}: UserStatusConfirmDialogProps) {
  const { t } = useTranslation("users");
  const { t: tCommon } = useTranslation("common");
  const activateMutation = useActivateCompanyUser();
  const deactivateMutation = useDeactivateCompanyUser();

  const busy = activateMutation.isPending || deactivateMutation.isPending;
  const isActivate = mode === "activate";

  const handleConfirm = async () => {
    if (!user) return;

    try {
      if (isActivate) {
        await activateMutation.mutateAsync(user.id);
      } else {
        await deactivateMutation.mutateAsync(user.id);
      }
      onOpenChange(false);
    } catch {
      // Toast in hooks.
    }
  };

  const title = isActivate
    ? t("statusConfirm.activateTitle")
    : t("statusConfirm.deactivateTitle");
  const description = user
    ? isActivate
      ? t("statusConfirm.activateDescription", { name: user.fullName })
      : t("statusConfirm.deactivateDescription", { name: user.fullName })
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
            disabled={!user || busy}
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

export function nextStatusAction(
  status: CompanyUser["status"],
): StatusConfirmMode | null {
  if (status === UserStatus.SUSPENDED) return "activate";
  if (status === UserStatus.ACTIVE) return "deactivate";
  return null;
}
