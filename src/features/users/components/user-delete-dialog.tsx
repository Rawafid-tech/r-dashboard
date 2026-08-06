import { useEffect, useId, useState } from "react";
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
  Field,
  FieldError,
  FieldLabel,
  Input,
} from "@/shared/components/ui";
import { useDeleteCompanyUser } from "@/features/users/hooks/use-delete-company-user";
import type { CompanyUser } from "@/features/users/types";

interface UserDeleteDialogProps {
  user: CompanyUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserDeleteDialog({
  user,
  open,
  onOpenChange,
}: UserDeleteDialogProps) {
  const { t } = useTranslation("users");
  const { t: tCommon } = useTranslation("common");
  const formId = useId();
  const [confirmText, setConfirmText] = useState("");
  const deleteMutation = useDeleteCompanyUser();

  const token = user?.email ?? "";

  useEffect(() => {
    if (!open) setConfirmText("");
  }, [open]);

  const busy = deleteMutation.isPending;
  const matches = confirmText.trim() === token;

  const handleConfirm = async () => {
    if (!user || !matches) return;

    try {
      await deleteMutation.mutateAsync(user.id);
      onOpenChange(false);
    } catch {
      // Toast in hook.
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
          <DialogTitle>{t("delete.title")}</DialogTitle>
          <DialogDescription>
            {user ? t("delete.description", { name: user.fullName }) : null}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 px-4 py-5 sm:px-5">
          <Field data-invalid={confirmText.length > 0 && !matches || undefined}>
            <FieldLabel htmlFor={`${formId}-confirm`}>
              {t("delete.confirmLabel", { token })}
            </FieldLabel>
            <Input
              id={`${formId}-confirm`}
              value={confirmText}
              onChange={(event) => setConfirmText(event.target.value)}
              autoComplete="off"
              dir="ltr"
              disabled={busy}
              aria-describedby={`${formId}-confirm-hint`}
            />
            <p
              id={`${formId}-confirm-hint`}
              className="sr-only"
            >
              {t("delete.confirmPlaceholder", { token })}
            </p>
            {confirmText.length > 0 && !matches ? (
              <FieldError>{t("delete.confirmPlaceholder", { token })}</FieldError>
            ) : null}
          </Field>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={busy}
            onClick={() => onOpenChange(false)}
          >
            {t("delete.cancel")}
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={!user || !matches || busy}
            onClick={() => void handleConfirm()}
          >
            {busy ? (
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
