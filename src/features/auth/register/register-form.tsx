import { useId, useMemo, useState, startTransition } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Loader2, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/shared/components/ui";
import { useAppForm } from "@/shared/hooks/use-app-form";
import { MonthlyShipmentVolume } from "@/shared/types/enums";
import { getFieldErrors } from "@/shared/api/error-handler";
import { RegisterAccountStep } from "@/features/auth/register/register-account-step";
import { RegisterBusinessStep } from "@/features/auth/register/register-business-step";
import {
  REGISTER_STEP_FIELDS,
  createRegisterSchema,
} from "@/features/auth/register/schema";
import {
  applyRegisterFieldErrors,
  useRegister,
} from "@/features/auth/register/use-register";

export function RegisterForm() {
  const { t, i18n } = useTranslation("auth");
  const formId = useId();
  const [step, setStep] = useState<1 | 2>(1);
  const registerMutation = useRegister();

  const schema = useMemo(
    () => createRegisterSchema(t),
    // Recreate when language changes so messages stay localized
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, i18n.language],
  );

  const {
    register,
    control,
    handleSubmit,
    trigger,
    setError,
    formState: { errors, isSubmitting },
  } = useAppForm({
    schema,
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      dateOfBirth: "",
      companyName: "",
      shipFromCountry: "EG",
      monthlyShipmentVolume: MonthlyShipmentVolume.VOL_0_50,
    },
    mode: "onBlur",
  });

  const busy = isSubmitting || registerMutation.isPending;
  const isRtl = i18n.dir() === "rtl";
  const ContinueIcon = isRtl ? ArrowLeft : ArrowRight;

  async function goNext() {
    const valid = await trigger([...REGISTER_STEP_FIELDS[1]]);
    if (valid) {
      startTransition(() => setStep(2));
    }
  }

  function goBack() {
    startTransition(() => setStep(1));
  }

  const onSubmit = handleSubmit(async (values) => {
    try {
      await registerMutation.mutateAsync(values);
    } catch (error) {
      applyRegisterFieldErrors(error, setError);

      const fieldErrors = getFieldErrors(error);
      if (!fieldErrors) return;

      const accountFields = REGISTER_STEP_FIELDS[1] as readonly string[];
      if (Object.keys(fieldErrors).some((name) => accountFields.includes(name))) {
        setStep(1);
      }
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
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-medium text-primary" aria-live="polite">
            {t("register.stepOf", { current: step, total: 2 })}
            <span className="text-muted-foreground">
              {" · "}
              {step === 1
                ? t("register.steps.account")
                : t("register.steps.business")}
            </span>
          </p>
          <ol
            className="flex w-20 gap-1"
            aria-label={t("register.stepOf", { current: step, total: 2 })}
          >
            {[1, 2].map((item) => (
              <li
                key={item}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  item <= step ? "bg-primary" : "bg-muted"
                }`}
                aria-current={item === step ? "step" : undefined}
              />
            ))}
          </ol>
        </div>
        <h1
          id={`${formId}-title`}
          className="text-xl font-bold tracking-tight text-foreground"
        >
          {t("register.title")}
        </h1>
        <p className="text-xs leading-snug text-muted-foreground">
          {t("register.subtitle")}
        </p>
      </header>

      {step === 1 ? (
        <RegisterAccountStep
          formId={formId}
          busy={busy}
          register={register}
          control={control}
          errors={errors}
        />
      ) : (
        <RegisterBusinessStep
          formId={formId}
          busy={busy}
          register={register}
          control={control}
          errors={errors}
        />
      )}

      <div className="flex flex-col gap-2">
        {step === 1 ? (
          <Button
            type="button"
            size="lg"
            fullWidth
            onClick={() => void goNext()}
            disabled={busy}
          >
            {t("register.continue")}
            <ContinueIcon data-icon="inline-end" />
          </Button>
        ) : (
          <div className="flex flex-col gap-2 sm:flex-row-reverse">
            <Button
              type="submit"
              size="lg"
              fullWidth
              disabled={busy}
              className="sm:flex-1"
            >
              {busy ? (
                <>
                  <Loader2 className="animate-spin" />
                  {t("register.submitting")}
                </>
              ) : (
                t("register.submit")
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={goBack}
              disabled={busy}
              className="sm:w-auto"
            >
              {t("register.back")}
            </Button>
          </div>
        )}

        <p className="text-center text-xs text-muted-foreground">
          {t("register.haveAccount")}{" "}
          <Link
            to="/login"
            className="font-medium text-primary underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {t("register.loginLink")}
          </Link>
        </p>
      </div>
    </form>
  );
}
