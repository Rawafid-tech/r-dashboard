import { useId, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import {
  Button,
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
  Input,
  Separator,
} from "@/shared/components/ui";
import { useAppForm } from "@/shared/hooks/use-app-form";
import { getFieldErrors } from "@/shared/api/error-handler";
import { createLoginSchema } from "@/features/auth/login/schema";
import { applyLoginFieldErrors, useLogin } from "@/features/auth/login/use-login";

export function LoginForm() {
  const { t, i18n } = useTranslation("auth");
  const formId = useId();
  const [showPassword, setShowPassword] = useState(false);
  const loginMutation = useLogin();

  const schema = useMemo(
    () => createLoginSchema(t),
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
      email: "",
      password: "",
    },
    mode: "onBlur",
  });

  const busy = isSubmitting || loginMutation.isPending;

  const onSubmit = handleSubmit(async (values) => {
    try {
      await loginMutation.mutateAsync(values);
    } catch (error) {
      applyLoginFieldErrors(error, setError);

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
          {t("login.title")}
        </h1>
        <p className="text-sm text-muted-foreground">{t("login.subtitle")}</p>
      </header>

      <FieldGroup className="gap-4">
        <FieldSet className="gap-4">
          <Field data-invalid={!!errors.email || undefined}>
            <FieldLabel htmlFor={`${formId}-email`}>
              {t("login.fields.email")}
            </FieldLabel>
            <Input
              id={`${formId}-email`}
              type="email"
              autoComplete="email"
              inputMode="email"
              autoFocus
              placeholder={t("login.fields.emailPlaceholder")}
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

          <Field data-invalid={!!errors.password || undefined}>
            <FieldLabel htmlFor={`${formId}-password`}>
              {t("login.fields.password")}
            </FieldLabel>
            <div className="relative">
              <Input
                id={`${formId}-password`}
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                className="pe-10"
                placeholder={t("login.fields.passwordPlaceholder")}
                aria-invalid={!!errors.password}
                aria-describedby={
                  errors.password ? `${formId}-password-error` : undefined
                }
                disabled={busy}
                {...register("password")}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                className="absolute end-1 top-1/2 -translate-y-1/2"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={
                  showPassword
                    ? t("login.hidePassword")
                    : t("login.showPassword")
                }
                tabIndex={-1}
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </Button>
            </div>
            <FieldError id={`${formId}-password-error`}>
              {errors.password?.message}
            </FieldError>
          </Field>
        </FieldSet>
      </FieldGroup>

      <div className="flex flex-col gap-4">
        <Button type="submit" size="lg" fullWidth disabled={busy}>
          {busy ? (
            <>
              <Loader2 className="animate-spin" />
              {t("login.submitting")}
            </>
          ) : (
            t("login.submit")
          )}
        </Button>

        <Separator />

        <p className="text-center text-sm text-muted-foreground">
          {t("login.noAccount")}{" "}
          <Link
            to="/register"
            className="font-medium text-primary underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          >
            {t("login.registerLink")}
          </Link>
        </p>
      </div>
    </form>
  );
}
