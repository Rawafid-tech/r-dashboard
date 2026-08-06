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
} from "@/shared/components/ui";
import { useAppForm } from "@/shared/hooks/use-app-form";
import { getFieldErrors } from "@/shared/api/error-handler";
import { createAcceptInviteSchema } from "@/features/auth/accept-invite/schema";
import {
  applyAcceptInviteFieldErrors,
  useAcceptInvite,
} from "@/features/auth/accept-invite/use-accept-invite";

interface AcceptInviteFormProps {
  userId: string;
  token: string;
}

export function AcceptInviteForm({ userId, token }: AcceptInviteFormProps) {
  const { t, i18n } = useTranslation("auth");
  const formId = useId();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const acceptMutation = useAcceptInvite();

  const schema = useMemo(
    () => createAcceptInviteSchema(t),
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
    defaultValues: { newPassword: "", confirmPassword: "" },
    mode: "onBlur",
  });

  const busy = isSubmitting || acceptMutation.isPending;

  const onSubmit = handleSubmit(async (values) => {
    try {
      await acceptMutation.mutateAsync({
        userId,
        token,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      });
    } catch (error) {
      applyAcceptInviteFieldErrors(error, setError);
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
          {t("acceptInvite.title")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("acceptInvite.subtitle")}
        </p>
      </header>

      <FieldGroup className="gap-4">
        <FieldSet className="gap-4">
          <Field data-invalid={!!errors.newPassword || undefined}>
            <FieldLabel htmlFor={`${formId}-password`}>
              {t("acceptInvite.fields.password")}
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
                  showPassword ? t("login.hidePassword") : t("login.showPassword")
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

          <Field data-invalid={!!errors.confirmPassword || undefined}>
            <FieldLabel htmlFor={`${formId}-confirm`}>
              {t("acceptInvite.fields.confirmPassword")}
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
                  showConfirm ? t("login.hidePassword") : t("login.showPassword")
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
        </FieldSet>
      </FieldGroup>

      <Button type="submit" disabled={busy} className="w-full">
        {busy ? (
          <>
            <Loader2 className="animate-spin" aria-hidden="true" />
            {t("acceptInvite.submitting")}
          </>
        ) : (
          t("acceptInvite.submit")
        )}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        {t("acceptInvite.haveAccount")}{" "}
        <Link to="/login" className="font-medium text-primary underline-offset-4 hover:underline">
          {t("acceptInvite.loginLink")}
        </Link>
      </p>
    </form>
  );
}
