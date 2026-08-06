import { useEffect, useId, useMemo, useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
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
import { useSetCompanyUserPassword } from "@/features/users/hooks/use-set-company-user-password";
import { applyUserFieldErrors } from "@/features/users/lib/user-form-errors";
import {
  createSetUserPasswordSchema,
  type SetUserPasswordFormValues,
} from "@/features/users/schema";
import type { CompanyUser } from "@/features/users/types";
import { useAppForm } from "@/shared/hooks/use-app-form";

interface UserSetPasswordDialogProps {
  user: CompanyUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserSetPasswordDialog({
  user,
  open,
  onOpenChange,
}: UserSetPasswordDialogProps) {
  const { t, i18n } = useTranslation("users");
  const { t: tCommon } = useTranslation("common");
  const { t: tAuth } = useTranslation("auth");
  const formId = useId();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const setPasswordMutation = useSetCompanyUserPassword(user?.id ?? "");

  const schema = useMemo(
    () => createSetUserPasswordSchema(t),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, i18n.language],
  );

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useAppForm({
    schema,
    defaultValues: { newPassword: "", confirmPassword: "" },
    mode: "onBlur",
  });

  useEffect(() => {
    if (!open) {
      reset({ newPassword: "", confirmPassword: "" });
      setShowPassword(false);
      setShowConfirm(false);
    }
  }, [open, reset]);

  const busy = isSubmitting || setPasswordMutation.isPending;

  const onSubmit = handleSubmit(async (values: SetUserPasswordFormValues) => {
    if (!user) return;

    try {
      await setPasswordMutation.mutateAsync({
        newPassword: values.newPassword,
      });
      onOpenChange(false);
    } catch (error) {
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
        className="gap-0 overflow-hidden text-sm"
        showCloseButton={!busy}
        closeLabel={tCommon("common.close")}
      >
        <DialogHeader className="border-b border-border/60 pe-10">
          <DialogTitle className="text-sm">{t("setPassword.title")}</DialogTitle>
          <DialogDescription className="text-[11px] leading-snug">
            {t("setPassword.description")}
          </DialogDescription>
        </DialogHeader>

        <form id={formId} onSubmit={onSubmit} noValidate>
          <DialogBody className="space-y-3">
            <FieldGroup className="gap-3">
              <Field data-invalid={Boolean(errors.newPassword) || undefined}>
                <FieldLabel
                  htmlFor={`${formId}-password`}
                  className="text-xs font-medium"
                >
                  {t("setPassword.newPassword")}
                </FieldLabel>
                <div className="relative">
                  <Input
                    id={`${formId}-password`}
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    disabled={busy}
                    className="pe-10"
                    {...register("newPassword")}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="absolute end-1 top-1/2 -translate-y-1/2"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={
                      showPassword ? tAuth("login.hidePassword") : tAuth("login.showPassword")
                    }
                  >
                    {showPassword ? (
                      <EyeOff aria-hidden="true" />
                    ) : (
                      <Eye aria-hidden="true" />
                    )}
                  </Button>
                </div>
                {errors.newPassword?.message ? (
                  <FieldError>{errors.newPassword.message}</FieldError>
                ) : null}
              </Field>

              <Field data-invalid={Boolean(errors.confirmPassword) || undefined}>
                <FieldLabel
                  htmlFor={`${formId}-confirm`}
                  className="text-xs font-medium"
                >
                  {t("setPassword.confirmPassword")}
                </FieldLabel>
                <div className="relative">
                  <Input
                    id={`${formId}-confirm`}
                    type={showConfirm ? "text" : "password"}
                    autoComplete="new-password"
                    disabled={busy}
                    className="pe-10"
                    {...register("confirmPassword")}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="absolute end-1 top-1/2 -translate-y-1/2"
                    onClick={() => setShowConfirm((value) => !value)}
                    aria-label={
                      showConfirm ? tAuth("login.hidePassword") : tAuth("login.showPassword")
                    }
                  >
                    {showConfirm ? (
                      <EyeOff aria-hidden="true" />
                    ) : (
                      <Eye aria-hidden="true" />
                    )}
                  </Button>
                </div>
                {errors.confirmPassword?.message ? (
                  <FieldError>{errors.confirmPassword.message}</FieldError>
                ) : null}
              </Field>
            </FieldGroup>
          </DialogBody>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={() => onOpenChange(false)}
            >
              {t("setPassword.cancel")}
            </Button>
            <Button type="submit" disabled={busy || !user}>
              {busy ? (
                <>
                  <Loader2 className="animate-spin" aria-hidden="true" />
                  {t("setPassword.submitting")}
                </>
              ) : (
                t("setPassword.submit")
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
