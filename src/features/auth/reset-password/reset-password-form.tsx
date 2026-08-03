import { useId, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";
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
import { getFieldErrors } from "@/shared/api/error-handler";
import { createResetPasswordSchema } from "@/features/auth/reset-password/schema";
import {
  applyResetPasswordFieldErrors,
  useResetPassword,
} from "@/features/auth/reset-password/use-reset-password";

export function ResetPasswordForm() {
  const { t, i18n } = useTranslation("auth");
  const formId = useId();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const resetMutation = useResetPassword();

  /** Email forwarded from the forgot-password step via router state. */
  const prefillEmail =
    (location.state as { email?: string } | null)?.email ?? "";

  const schema = useMemo(
    () => createResetPasswordSchema(t),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, i18n.language],
  );

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useAppForm({
    schema,
    defaultValues: {
      email: prefillEmail,
      code: "",
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onBlur",
  });

  const busy = isSubmitting || resetMutation.isPending;

  const onSubmit = handleSubmit(async (values) => {
    try {
      await resetMutation.mutateAsync(values);
    } catch (error) {
      applyResetPasswordFieldErrors(error, setError);

      /**
       * If no field errors came back the mutation's onError already
       * showed a toast — nothing more to do here.
       */
      if (getFieldErrors(error)) return;
    }
  });

  return (
    <form
      id={formId}
      onSubmit={onSubmit}
      noValidate
      className="flex flex-col gap-6"
      aria-labelledby={`${formId}-title`}
    >
      <header className="space-y-1.5">
        <h1
          id={`${formId}-title`}
          className="text-2xl font-semibold tracking-tight text-foreground"
        >
          {t("resetPassword.title")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("resetPassword.subtitle")}
        </p>
      </header>

      <FieldGroup className="gap-4">
        <FieldSet className="gap-4">
          {/* Email — pre-filled from router state, still editable in case the
              user lands here directly or navigated back and changed address. */}
          <Field data-invalid={!!errors.email || undefined}>
            <FieldLabel htmlFor={`${formId}-email`}>
              {t("resetPassword.fields.email")}
            </FieldLabel>
            <Input
              id={`${formId}-email`}
              type="email"
              autoComplete="email"
              inputMode="email"
              placeholder={t("resetPassword.fields.emailPlaceholder")}
              aria-invalid={!!errors.email}
              aria-describedby={
                errors.email ? `${formId}-email-error` : undefined
              }
              disabled={busy}
              {...register("email")}
            />
            <FieldError id={`${formId}-email-error`}>
              {errors.email?.message}
            </FieldError>
          </Field>

          {/* 6-digit OTP code */}
          <Field data-invalid={!!errors.code || undefined}>
            <FieldLabel htmlFor={`${formId}-code`}>
              {t("resetPassword.fields.code")}
            </FieldLabel>
            <Input
              id={`${formId}-code`}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              autoFocus
              maxLength={7} /* 6 digits + possible space from autofill paste */
              placeholder={t("resetPassword.fields.codePlaceholder")}
              aria-invalid={!!errors.code}
              aria-describedby={[
                `${formId}-code-hint`,
                errors.code ? `${formId}-code-error` : "",
              ]
                .filter(Boolean)
                .join(" ")}
              disabled={busy}
              {...register("code")}
            />
            <FieldDescription id={`${formId}-code-hint`}>
              {t("resetPassword.fields.codeHint")}
            </FieldDescription>
            <FieldError id={`${formId}-code-error`}>
              {errors.code?.message}
            </FieldError>
          </Field>

          {/* New password */}
          <Field data-invalid={!!errors.newPassword || undefined}>
            <FieldLabel htmlFor={`${formId}-newPassword`}>
              {t("resetPassword.fields.newPassword")}
            </FieldLabel>
            <div className="relative">
              <Input
                id={`${formId}-newPassword`}
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                className="pe-10"
                placeholder={t("resetPassword.fields.newPasswordPlaceholder")}
                aria-invalid={!!errors.newPassword}
                aria-describedby={[
                  `${formId}-password-hint`,
                  errors.newPassword ? `${formId}-newPassword-error` : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                disabled={busy}
                {...register("newPassword")}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                className="absolute end-1 top-1/2 -translate-y-1/2"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={
                  showPassword
                    ? t("resetPassword.hidePassword")
                    : t("resetPassword.showPassword")
                }
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff aria-hidden="true" />
                ) : (
                  <Eye aria-hidden="true" />
                )}
              </Button>
            </div>
            <FieldDescription id={`${formId}-password-hint`}>
              {t("resetPassword.fields.newPasswordHint")}
            </FieldDescription>
            <FieldError id={`${formId}-newPassword-error`}>
              {errors.newPassword?.message}
            </FieldError>
          </Field>

          {/* Confirm password */}
          <Field data-invalid={!!errors.confirmPassword || undefined}>
            <FieldLabel htmlFor={`${formId}-confirmPassword`}>
              {t("resetPassword.fields.confirmPassword")}
            </FieldLabel>
            <div className="relative">
              <Input
                id={`${formId}-confirmPassword`}
                type={showConfirm ? "text" : "password"}
                autoComplete="new-password"
                className="pe-10"
                placeholder={t(
                  "resetPassword.fields.confirmPasswordPlaceholder",
                )}
                aria-invalid={!!errors.confirmPassword}
                aria-describedby={
                  errors.confirmPassword
                    ? `${formId}-confirmPassword-error`
                    : undefined
                }
                disabled={busy}
                {...register("confirmPassword")}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                className="absolute end-1 top-1/2 -translate-y-1/2"
                onClick={() => setShowConfirm((v) => !v)}
                aria-label={
                  showConfirm
                    ? t("resetPassword.hidePassword")
                    : t("resetPassword.showPassword")
                }
                tabIndex={-1}
              >
                {showConfirm ? (
                  <EyeOff aria-hidden="true" />
                ) : (
                  <Eye aria-hidden="true" />
                )}
              </Button>
            </div>
            <FieldError id={`${formId}-confirmPassword-error`}>
              {errors.confirmPassword?.message}
            </FieldError>
          </Field>
        </FieldSet>
      </FieldGroup>

      <div className="flex flex-col gap-4">
        <Button type="submit" size="lg" fullWidth disabled={busy}>
          {busy ? (
            <>
              <Loader2 className="animate-spin" aria-hidden="true" />
              {t("resetPassword.submitting")}
            </>
          ) : (
            t("resetPassword.submit")
          )}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 font-medium text-primary underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          >
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            {t("resetPassword.backToLogin")}
          </Link>
        </p>
      </div>
    </form>
  );
}
