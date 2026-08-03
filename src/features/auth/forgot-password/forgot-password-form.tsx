import { useId, useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Loader2 } from "lucide-react";
import {
  Button,
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
  Input,
} from "@/shared/components/ui";
import { useAppForm } from "@/shared/hooks/use-app-form";
import { createForgotPasswordSchema } from "@/features/auth/forgot-password/schema";
import { useForgotPassword } from "@/features/auth/forgot-password/use-forgot-password";

export function ForgotPasswordForm() {
  const { t, i18n } = useTranslation("auth");
  const formId = useId();
  const forgotMutation = useForgotPassword();

  const schema = useMemo(
    () => createForgotPasswordSchema(t),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, i18n.language],
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useAppForm({
    schema,
    defaultValues: { email: "" },
    mode: "onBlur",
  });

  const busy = isSubmitting || forgotMutation.isPending;

  const onSubmit = handleSubmit(async (values) => {
    await forgotMutation.mutateAsync(values);
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
          {t("forgotPassword.title")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("forgotPassword.subtitle")}
        </p>
      </header>

      <FieldGroup className="gap-4">
        <FieldSet className="gap-4">
          <Field data-invalid={!!errors.email || undefined}>
            <FieldLabel htmlFor={`${formId}-email`}>
              {t("forgotPassword.fields.email")}
            </FieldLabel>
            <Input
              id={`${formId}-email`}
              type="email"
              autoComplete="email"
              inputMode="email"
              autoFocus
              placeholder={t("forgotPassword.fields.emailPlaceholder")}
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
        </FieldSet>
      </FieldGroup>

      {/* Informational hint — shown always, matches the "always 202" API behaviour */}
      <p className="text-sm text-muted-foreground" role="note">
        {t("forgotPassword.hint")}
      </p>

      <div className="flex flex-col gap-4">
        <Button type="submit" size="lg" fullWidth disabled={busy}>
          {busy ? (
            <>
              <Loader2 className="animate-spin" aria-hidden="true" />
              {t("forgotPassword.submitting")}
            </>
          ) : (
            t("forgotPassword.submit")
          )}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 font-medium text-primary underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          >
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            {t("forgotPassword.backToLogin")}
          </Link>
        </p>
      </div>
    </form>
  );
}
