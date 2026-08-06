import { useEffect, useId, useState } from "react";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui";
import { RoleSelectField } from "@/features/users/components/role-select-field";
import { useUpdateCompanyUserRole } from "@/features/users/hooks/use-update-company-user-role";
import type { CompanyUser } from "@/features/users/types";

interface UserRoleDialogProps {
  user: CompanyUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserRoleDialog({
  user,
  open,
  onOpenChange,
}: UserRoleDialogProps) {
  const { t } = useTranslation("users");
  const { t: tCommon } = useTranslation("common");
  const formId = useId();
  const [roleId, setRoleId] = useState("");

  const updateMutation = useUpdateCompanyUserRole(user?.id ?? "");

  useEffect(() => {
    if (!open || !user) return;
    setRoleId(user.roleId ?? "");
  }, [open, user]);

  const busy = updateMutation.isPending;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) return;

    try {
      await updateMutation.mutateAsync({
        roleId: roleId.trim().length > 0 ? roleId : null,
      });
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
        size="w15"
        className="gap-0 overflow-hidden"
        showCloseButton={!busy}
        closeLabel={tCommon("common.close")}
      >
        <DialogHeader className="border-b border-border/60 pe-10">
          <DialogTitle>{t("role.title")}</DialogTitle>
          <DialogDescription>{t("role.description")}</DialogDescription>
        </DialogHeader>

        <form id={formId} onSubmit={(e) => void handleSubmit(e)} noValidate>
          <DialogBody>
            <RoleSelectField
              id={`${formId}-role`}
              label={t("role.role")}
              placeholder={t("role.rolePlaceholder")}
              value={roleId}
              onChange={setRoleId}
              disabled={busy}
              enabled={open}
            />
          </DialogBody>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={() => onOpenChange(false)}
            >
              {t("role.cancel")}
            </Button>
            <Button type="submit" disabled={busy || !user}>
              {busy ? (
                <>
                  <Loader2 className="animate-spin" aria-hidden="true" />
                  {t("role.submitting")}
                </>
              ) : (
                t("role.submit")
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
