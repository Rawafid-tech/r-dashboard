import { useEffect, useId, useMemo } from "react";
import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import {
  Badge,
  Button,
  DatePicker,
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
  Input,
} from "@/shared/components/ui";
import { useAppForm } from "@/shared/hooks/use-app-form";
import type { User } from "@/features/auth/types";
import {
  applyProfileFieldErrors,
  useUpdateProfile,
} from "@/features/account/hooks/use-update-profile";
import {
  createProfileSchema,
  type ProfileFormValues,
} from "@/features/account/schema";
import { AvatarUploader } from "@/features/media";

const DOB_END = new Date();
const DOB_START = new Date(DOB_END.getFullYear() - 100, 0, 1);
const DOB_DEFAULT_MONTH = new Date(DOB_END.getFullYear() - 25, 0, 1);

interface ProfileSettingsFormProps {
  user?: User;
}

export function ProfileSettingsForm({ user }: ProfileSettingsFormProps) {
  const { t, i18n } = useTranslation("settings");
  const formId = useId();
  const updateMutation = useUpdateProfile();

  const schema = useMemo(
    () => createProfileSchema(t),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, i18n.language],
  );

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting, isDirty },
  } = useAppForm({
    schema,
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      dateOfBirth: "",
    },
    mode: "onBlur",
  });

  useEffect(() => {
    if (!user) return;

    reset({
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      dateOfBirth: user.dateOfBirth ?? "",
    });
  }, [user, reset]);

  const busy = isSubmitting || updateMutation.isPending;

  const onSubmit = handleSubmit(async (values: ProfileFormValues) => {
    try {
      await updateMutation.mutateAsync({
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        phone: values.phone.trim(),
        ...(values.dateOfBirth ? { dateOfBirth: values.dateOfBirth } : {}),
      });
    } catch (error) {
      applyProfileFieldErrors(error, setError);
    }
  });

  return (
    <form id={formId} onSubmit={onSubmit} noValidate className="space-y-5">
      {/* Avatar Upload Section */}
      {user && (
        <div className="rounded-lg border border-border/60 bg-card p-4">
          <div className="mb-3">
            <h4 className="text-sm font-medium">{t("fields.avatar")}</h4>
            <p className="text-xs text-muted-foreground">
              {t("fields.avatarHint")}
            </p>
          </div>
          <AvatarUploader currentAvatarUrl={user.avatarUrl} size="lg" />
        </div>
      )}

      <FieldGroup>
        <FieldSet className="gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field data-invalid={!!errors.firstName || undefined}>
              <FieldLabel htmlFor={`${formId}-firstName`}>
                {t("fields.firstName")}
              </FieldLabel>
              <Input
                id={`${formId}-firstName`}
                autoComplete="given-name"
                aria-invalid={!!errors.firstName}
                aria-describedby={
                  errors.firstName ? `${formId}-firstName-error` : undefined
                }
                disabled={busy || !user}
                {...register("firstName")}
              />
              <FieldError id={`${formId}-firstName-error`}>
                {errors.firstName?.message}
              </FieldError>
            </Field>

            <Field data-invalid={!!errors.lastName || undefined}>
              <FieldLabel htmlFor={`${formId}-lastName`}>
                {t("fields.lastName")}
              </FieldLabel>
              <Input
                id={`${formId}-lastName`}
                autoComplete="family-name"
                aria-invalid={!!errors.lastName}
                aria-describedby={
                  errors.lastName ? `${formId}-lastName-error` : undefined
                }
                disabled={busy || !user}
                {...register("lastName")}
              />
              <FieldError id={`${formId}-lastName-error`}>
                {errors.lastName?.message}
              </FieldError>
            </Field>
          </div>

          <Field>
            <FieldLabel htmlFor={`${formId}-email`}>{t("fields.email")}</FieldLabel>
            <Input
              id={`${formId}-email`}
              type="email"
              value={user?.email ?? ""}
              readOnly
              disabled
              aria-readonly="true"
              aria-describedby={`${formId}-email-hint`}
              className="bg-muted/40"
            />
            <div className="flex flex-wrap items-center gap-2">
              <FieldDescription id={`${formId}-email-hint`}>
                {t("fields.emailReadOnly")}
              </FieldDescription>
              {user ? (
                <Badge variant={user.emailVerified ? "success" : "muted"}>
                  {user.emailVerified
                    ? t("badges.verified")
                    : t("badges.unverified")}
                </Badge>
              ) : null}
            </div>
          </Field>

          <Field data-invalid={!!errors.phone || undefined}>
            <FieldLabel htmlFor={`${formId}-phone`}>{t("fields.phone")}</FieldLabel>
            <Input
              id={`${formId}-phone`}
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              dir="ltr"
              className="text-start"
              aria-invalid={!!errors.phone}
              aria-describedby={`${formId}-phone-hint`}
              disabled={busy || !user}
              {...register("phone")}
            />
            <div className="flex flex-wrap items-center gap-2">
              <FieldDescription id={`${formId}-phone-hint`}>
                {t("fields.phoneResetHint")}
              </FieldDescription>
              {user ? (
                <Badge variant={user.phoneVerified ? "success" : "muted"}>
                  {user.phoneVerified
                    ? t("badges.verified")
                    : t("badges.unverified")}
                </Badge>
              ) : null}
            </div>
            <FieldError>{errors.phone?.message}</FieldError>
          </Field>

          <Field data-invalid={!!errors.dateOfBirth || undefined}>
            <FieldLabel htmlFor={`${formId}-dateOfBirth`}>
              {t("fields.dateOfBirth")}
              <span className="ms-1 font-normal text-muted-foreground">
                ({t("fields.optional")})
              </span>
            </FieldLabel>
            <Controller
              control={control}
              name="dateOfBirth"
              render={({ field }) => (
                <DatePicker
                  id={`${formId}-dateOfBirth`}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  disabled={busy || !user}
                  placeholder={t("fields.dateOfBirth")}
                  aria-invalid={!!errors.dateOfBirth}
                  captionLayout="dropdown"
                  startMonth={DOB_START}
                  endMonth={DOB_END}
                  defaultMonth={DOB_DEFAULT_MONTH}
                  disabledDates={{ after: DOB_END }}
                  clearable
                />
              )}
            />
            <FieldError>{errors.dateOfBirth?.message}</FieldError>
          </Field>
        </FieldSet>
      </FieldGroup>

      <div className="flex justify-end border-t border-border/60 pt-4">
        <Button type="submit" disabled={busy || !user || !isDirty}>
          {busy ? (
            <>
              <Loader2 className="animate-spin" />
              {t("actions.saving")}
            </>
          ) : (
            t("actions.save")
          )}
        </Button>
      </div>
    </form>
  );
}
