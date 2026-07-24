import { useId, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import {
  Button,
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
  Input,
} from "@/shared/components/ui";
import { useAppForm } from "@/shared/hooks/use-app-form";
import {
  applyPasswordFieldErrors,
  useChangePassword,
} from "@/features/account/hooks/use-change-password";
import {
  createPasswordSchema,
  type PasswordFormValues,
} from "@/features/account/schema";

export function PasswordSettingsForm() {
  const { t, i18n } = useTranslation("settings");
  const formId = useId();
  const changeMutation = useChangePassword();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const schema = useMemo(
    () => createPasswordSchema(t),
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
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
    mode: "onBlur",
  });

  const busy = isSubmitting || changeMutation.isPending;

  const onSubmit = handleSubmit(async (values: PasswordFormValues) => {
    try {
      await changeMutation.mutateAsync({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      reset();
    } catch (error) {
      applyPasswordFieldErrors(error, setError);
    }
  });

  return (
    <form id={formId} onSubmit={onSubmit} noValidate className="space-y-5">
      <FieldGroup>
        <FieldSet className="gap-4">
          <Field data-invalid={!!errors.currentPassword || undefined}>
            <FieldLabel htmlFor={`${formId}-currentPassword`}>
              {t("fields.currentPassword")}
            </FieldLabel>
            <div className="relative">
              <Input
                id={`${formId}-currentPassword`}
                type={showCurrent ? "text" : "password"}
                autoComplete="current-password"
                className="pe-10"
                aria-invalid={!!errors.currentPassword}
                disabled={busy}
                {...register("currentPassword")}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                className="absolute end-1 top-1/2 -translate-y-1/2"
                onClick={() => setShowCurrent((value) => !value)}
                aria-label={
                  showCurrent ? t("hidePassword") : t("showPassword")
                }
                tabIndex={-1}
              >
                {showCurrent ? <EyeOff /> : <Eye />}
              </Button>
            </div>
            <FieldError>{errors.currentPassword?.message}</FieldError>
          </Field>

          <Field data-invalid={!!errors.newPassword || undefined}>
            <FieldLabel htmlFor={`${formId}-newPassword`}>
              {t("fields.newPassword")}
            </FieldLabel>
            <div className="relative">
              <Input
                id={`${formId}-newPassword`}
                type={showNew ? "text" : "password"}
                autoComplete="new-password"
                className="pe-10"
                aria-invalid={!!errors.newPassword}
                disabled={busy}
                {...register("newPassword")}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                className="absolute end-1 top-1/2 -translate-y-1/2"
                onClick={() => setShowNew((value) => !value)}
                aria-label={showNew ? t("hidePassword") : t("showPassword")}
                tabIndex={-1}
              >
                {showNew ? <EyeOff /> : <Eye />}
              </Button>
            </div>
            <FieldError>{errors.newPassword?.message}</FieldError>
          </Field>

          <Field data-invalid={!!errors.confirmNewPassword || undefined}>
            <FieldLabel htmlFor={`${formId}-confirmNewPassword`}>
              {t("fields.confirmNewPassword")}
            </FieldLabel>
            <div className="relative">
              <Input
                id={`${formId}-confirmNewPassword`}
                type={showConfirm ? "text" : "password"}
                autoComplete="new-password"
                className="pe-10"
                aria-invalid={!!errors.confirmNewPassword}
                disabled={busy}
                {...register("confirmNewPassword")}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                className="absolute end-1 top-1/2 -translate-y-1/2"
                onClick={() => setShowConfirm((value) => !value)}
                aria-label={
                  showConfirm ? t("hidePassword") : t("showPassword")
                }
                tabIndex={-1}
              >
                {showConfirm ? <EyeOff /> : <Eye />}
              </Button>
            </div>
            <FieldError>{errors.confirmNewPassword?.message}</FieldError>
          </Field>
        </FieldSet>
      </FieldGroup>

      <div className="flex flex-col gap-3 border-t border-border/60 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <FieldDescription className="max-w-xl">
          {t("sections.security.description")}
        </FieldDescription>
        <Button type="submit" disabled={busy}>
          {busy ? (
            <>
              <Loader2 className="animate-spin" />
              {t("actions.saving")}
            </>
          ) : (
            t("security.submit")
          )}
        </Button>
      </div>
    </form>
  );
}
