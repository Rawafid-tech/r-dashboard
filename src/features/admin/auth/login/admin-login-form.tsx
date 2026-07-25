import { useId, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Building2,
  CreditCard,
  Eye,
  EyeOff,
  Loader2,
  Shield,
  Users,
} from "lucide-react";
import {
  Badge,
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
import { createAdminLoginSchema } from "@/features/admin/auth/login/schema";
import {
  applyAdminLoginFieldErrors,
  useAdminLogin,
} from "@/features/admin/auth/login/use-admin-login";

const HIGHLIGHTS = [
  { key: "plans", icon: CreditCard },
  { key: "companies", icon: Building2 },
  { key: "users", icon: Users },
] as const;

export function AdminLoginForm() {
  const { t, i18n } = useTranslation("admin");
  const formId = useId();
  const [showPassword, setShowPassword] = useState(false);
  const loginMutation = useAdminLogin();

  const schema = useMemo(
    () => createAdminLoginSchema(t),
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
      applyAdminLoginFieldErrors(error, setError);

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
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs font-medium text-primary">{t("login.eyebrow")}</p>
          <Badge variant="secondary" className="gap-1 text-[10px] uppercase">
            <Shield className="size-3" aria-hidden="true" />
            {t("login.staffOnly")}
          </Badge>
        </div>
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
            className="inline-flex items-center gap-1.5 rounded-full bg-violet-500/8 px-2.5 py-1 text-[11px] font-medium text-violet-700 ring-1 ring-violet-500/12 dark:text-violet-200"
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
              autoComplete="username"
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

        <p className="text-center text-[11px] leading-snug text-muted-foreground">
          {t("login.securityNotice")}
        </p>

        <p className="text-center text-xs text-muted-foreground">
          <Link
            to="/login"
            className="font-medium text-primary underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {t("login.merchantLink")}
          </Link>
        </p>
      </div>
    </form>
  );
}
