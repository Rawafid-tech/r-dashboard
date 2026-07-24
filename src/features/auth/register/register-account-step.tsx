import { useState } from "react";
import {
  Controller,
  type Control,
  type FieldErrors,
  type UseFormRegister,
} from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Eye, EyeOff } from "lucide-react";
import {
  Button,
  DatePicker,
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
  Input,
} from "@/shared/components/ui";
import type { RegisterFormValues } from "@/features/auth/register/schema";

const DOB_END = new Date();
const DOB_START = new Date(DOB_END.getFullYear() - 100, 0, 1);
const DOB_DEFAULT_MONTH = new Date(DOB_END.getFullYear() - 25, 0, 1);

interface RegisterAccountStepProps {
  formId: string;
  busy: boolean;
  register: UseFormRegister<RegisterFormValues>;
  control: Control<RegisterFormValues>;
  errors: FieldErrors<RegisterFormValues>;
}

export function RegisterAccountStep({
  formId,
  busy,
  register,
  control,
  errors,
}: RegisterAccountStepProps) {
  const { t } = useTranslation("auth");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <FieldGroup className="gap-3.5">
      <FieldSet className="gap-2.5">
        <div className="grid gap-2.5 sm:grid-cols-2">
          <Field data-invalid={!!errors.firstName || undefined}>
            <FieldLabel htmlFor={`${formId}-firstName`}>
              {t("register.fields.firstName")}
            </FieldLabel>
            <Input
              id={`${formId}-firstName`}
              autoComplete="given-name"
              placeholder={t("register.fields.firstNamePlaceholder")}
              aria-invalid={!!errors.firstName}
              aria-describedby={
                errors.firstName ? `${formId}-firstName-error` : undefined
              }
              disabled={busy}
              {...register("firstName")}
            />
            <FieldError id={`${formId}-firstName-error`}>
              {errors.firstName?.message}
            </FieldError>
          </Field>

          <Field data-invalid={!!errors.lastName || undefined}>
            <FieldLabel htmlFor={`${formId}-lastName`}>
              {t("register.fields.lastName")}
            </FieldLabel>
            <Input
              id={`${formId}-lastName`}
              autoComplete="family-name"
              placeholder={t("register.fields.lastNamePlaceholder")}
              aria-invalid={!!errors.lastName}
              aria-describedby={
                errors.lastName ? `${formId}-lastName-error` : undefined
              }
              disabled={busy}
              {...register("lastName")}
            />
            <FieldError id={`${formId}-lastName-error`}>
              {errors.lastName?.message}
            </FieldError>
          </Field>
        </div>

        <Field data-invalid={!!errors.dateOfBirth || undefined}>
          <FieldLabel htmlFor={`${formId}-dateOfBirth`}>
            {t("register.fields.dateOfBirth")}
            <span className="ms-1 font-normal text-muted-foreground">
              ({t("register.fields.optional")})
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
                disabled={busy}
                placeholder={t("register.fields.dateOfBirth")}
                aria-invalid={!!errors.dateOfBirth}
                aria-describedby={
                  errors.dateOfBirth
                    ? `${formId}-dateOfBirth-error`
                    : undefined
                }
                captionLayout="dropdown"
                startMonth={DOB_START}
                endMonth={DOB_END}
                defaultMonth={DOB_DEFAULT_MONTH}
                disabledDates={{ after: DOB_END }}
                clearable
              />
            )}
          />
          <FieldError id={`${formId}-dateOfBirth-error`}>
            {errors.dateOfBirth?.message}
          </FieldError>
        </Field>
      </FieldSet>

      <FieldSet className="gap-2.5">
        <Field data-invalid={!!errors.email || undefined}>
          <FieldLabel htmlFor={`${formId}-email`}>
            {t("register.fields.email")}
          </FieldLabel>
          <Input
            id={`${formId}-email`}
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder={t("register.fields.emailPlaceholder")}
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

        <Field data-invalid={!!errors.phone || undefined}>
          <FieldLabel htmlFor={`${formId}-phone`}>
            {t("register.fields.phone")}
          </FieldLabel>
          <Input
            id={`${formId}-phone`}
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            dir="ltr"
            className="text-start"
            placeholder={t("register.fields.phonePlaceholder")}
            title={t("register.fields.phoneHint")}
            aria-invalid={!!errors.phone}
            aria-describedby={
              errors.phone ? `${formId}-phone-error` : undefined
            }
            disabled={busy}
            {...register("phone")}
          />
          <FieldError id={`${formId}-phone-error`}>
            {errors.phone?.message}
          </FieldError>
        </Field>

        <Field data-invalid={!!errors.password || undefined}>
          <FieldLabel htmlFor={`${formId}-password`}>
            {t("register.fields.password")}
          </FieldLabel>
          <div className="relative">
            <Input
              id={`${formId}-password`}
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              className="pe-10"
              placeholder={t("register.fields.passwordPlaceholder")}
              title={t("register.fields.passwordHint")}
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
                  ? t("register.hidePassword")
                  : t("register.showPassword")
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

        <Field data-invalid={!!errors.confirmPassword || undefined}>
          <FieldLabel htmlFor={`${formId}-confirmPassword`}>
            {t("register.fields.confirmPassword")}
          </FieldLabel>
          <div className="relative">
            <Input
              id={`${formId}-confirmPassword`}
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              className="pe-10"
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
              onClick={() => setShowConfirmPassword((value) => !value)}
              aria-label={
                showConfirmPassword
                  ? t("register.hidePassword")
                  : t("register.showPassword")
              }
              tabIndex={-1}
            >
              {showConfirmPassword ? <EyeOff /> : <Eye />}
            </Button>
          </div>
          <FieldError id={`${formId}-confirmPassword-error`}>
            {errors.confirmPassword?.message}
          </FieldError>
        </Field>
      </FieldSet>
    </FieldGroup>
  );
}
