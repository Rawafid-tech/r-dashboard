import { useId, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Eye, EyeOff, Loader2, Package, RefreshCcw, Wallet } from "lucide-react";
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
import { getFieldErrors } from "@/shared/api/error-handler";
import { createLoginSchema } from "@/features/auth/login/schema";
import { applyLoginFieldErrors, useLogin } from "@/features/auth/login/use-login";

const HIGHLIGHTS = [
  { key: "shipments", icon: Package },
  { key: "returns", icon: RefreshCcw },
  { key: "wallet", icon: Wallet },
] as const;

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
      className="flex flex-col gap-3.5"
      aria-labelledby={`${formId}-title`}
    >
      <header className="space-y-1">
        <p className="text-xs font-medium text-primary">{t("login.eyebrow")}</p>
        <h1
          id={`${formId}-title`}
          className="text-xl font-bold tracking-tight text-foreground"
        >
          {t("login.title")}
        </h1>
        <p className="text-xs leading-snug text-muted-foreground">
          {t("login.subtitle")}
        </p>
      </header>

      <ul
        className="flex flex-wrap gap-2"
        aria-label={t("login.highlightsLabel")}
      >
        {HIGHLIGHTS.map(({ key, icon: Icon }) => (
          <li
            key={key}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary/8 px-2.5 py-1 text-[11px] font-medium text-primary ring-1 ring-primary/12"
          >
            <Icon className="size-3" aria-hidden="true" />
            {t(`login.highlights.${key}`)}
          </li>
        ))}
      </ul>

      <FieldGroup className="gap-3.5">
        <FieldSet className="gap-2.5">
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

      <div className="flex flex-col gap-2">
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

        <p className="text-center text-xs text-muted-foreground">
          {t("login.noAccount")}{" "}
          <Link
            to="/register"
            className="font-medium text-primary underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {t("login.registerLink")}
          </Link>
        </p>
      </div>
    </form>
  );
}
