import { useEffect, useId, useMemo } from "react";
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
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  Input,
} from "@/shared/components/ui";
import { RoleSelectField } from "@/features/users/components/role-select-field";
import { useInviteCompanyUser } from "@/features/users/hooks/use-invite-company-user";
import {
  applyUserFieldErrors,
  isUserApiErrorCode,
  toInviteUserPayload,
} from "@/features/users/lib/user-form-errors";
import {
  createInviteUserSchema,
  EMPTY_INVITE_USER_VALUES,
  type InviteUserFormValues,
} from "@/features/users/schema";
import { useAppForm } from "@/shared/hooks/use-app-form";
import { parseApiError } from "@/shared/api/error-handler";

interface UserInviteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserInviteDialog({ open, onOpenChange }: UserInviteDialogProps) {
  const { t, i18n } = useTranslation("users");
  const { t: tCommon } = useTranslation("common");
  const formId = useId();
  const inviteMutation = useInviteCompanyUser();

  const schema = useMemo(
    () => createInviteUserSchema(t),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, i18n.language],
  );

  const {
    register,
    handleSubmit,
    reset,
    setError,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useAppForm({
    schema,
    defaultValues: EMPTY_INVITE_USER_VALUES,
    mode: "onBlur",
  });

  const roleId = watch("roleId");

  useEffect(() => {
    if (!open) {
      reset(EMPTY_INVITE_USER_VALUES);
    }
  }, [open, reset]);

  const busy = isSubmitting || inviteMutation.isPending;

  const onSubmit = handleSubmit(async (values: InviteUserFormValues) => {
    try {
      await inviteMutation.mutateAsync(toInviteUserPayload(values));
      onOpenChange(false);
    } catch (error) {
      if (isUserApiErrorCode(error, "auth.emailAlreadyUsed")) {
        setError("email", {
          type: "server",
          message: parseApiError(error).detail || t("toast.inviteFailed"),
        });
        return;
      }

      applyUserFieldErrors(error, setError);
    }
  });

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
          <DialogTitle>{t("invite.title")}</DialogTitle>
          <DialogDescription>{t("invite.description")}</DialogDescription>
        </DialogHeader>

        <form id={formId} onSubmit={onSubmit} noValidate>
          <DialogBody className="space-y-3.5">
            <FieldGroup className="gap-3.5">
              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                <Field data-invalid={Boolean(errors.firstName) || undefined}>
                  <FieldLabel htmlFor={`${formId}-firstName`}>
                    {t("invite.firstName")}
                  </FieldLabel>
                  <Input
                    id={`${formId}-firstName`}
                    autoComplete="given-name"
                    disabled={busy}
                    {...register("firstName")}
                  />
                  {errors.firstName?.message ? (
                    <FieldError>{errors.firstName.message}</FieldError>
                  ) : null}
                </Field>

                <Field data-invalid={Boolean(errors.lastName) || undefined}>
                  <FieldLabel htmlFor={`${formId}-lastName`}>
                    {t("invite.lastName")}
                  </FieldLabel>
                  <Input
                    id={`${formId}-lastName`}
                    autoComplete="family-name"
                    disabled={busy}
                    {...register("lastName")}
                  />
                  {errors.lastName?.message ? (
                    <FieldError>{errors.lastName.message}</FieldError>
                  ) : null}
                </Field>
              </div>

              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                <Field data-invalid={Boolean(errors.email) || undefined}>
                  <FieldLabel htmlFor={`${formId}-email`}>
                    {t("invite.email")}
                  </FieldLabel>
                  <Input
                    id={`${formId}-email`}
                    type="email"
                    autoComplete="email"
                    dir="ltr"
                    disabled={busy}
                    {...register("email")}
                  />
                  {errors.email?.message ? (
                    <FieldError>{errors.email.message}</FieldError>
                  ) : null}
                </Field>

                <Field data-invalid={Boolean(errors.phone) || undefined}>
                  <FieldLabel htmlFor={`${formId}-phone`}>
                    {t("invite.phone")}
                  </FieldLabel>
                  <Input
                    id={`${formId}-phone`}
                    type="tel"
                    autoComplete="tel"
                    dir="ltr"
                    disabled={busy}
                    {...register("phone")}
                  />
                  {errors.phone?.message ? (
                    <FieldError>{errors.phone.message}</FieldError>
                  ) : null}
                </Field>
              </div>

              <RoleSelectField
                id={`${formId}-role`}
                label={t("invite.role")}
                placeholder={t("invite.rolePlaceholder")}
                hint={t("invite.roleHint")}
                value={roleId ?? ""}
                onChange={(next) =>
                  setValue("roleId", next, { shouldDirty: true })
                }
                disabled={busy}
                enabled={open}
              />
            </FieldGroup>
          </DialogBody>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={() => onOpenChange(false)}
            >
              {t("invite.cancel")}
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? (
                <>
                  <Loader2 className="animate-spin" aria-hidden="true" />
                  {t("invite.submitting")}
                </>
              ) : (
                t("invite.submit")
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
