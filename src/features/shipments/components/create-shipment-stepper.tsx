import { useTranslation } from "react-i18next";
import { cn } from "@/shared/lib/utils";

export type CreateShipmentWizardStep = 1 | 2 | 3;

const STEP_KEYS = ["address", "details", "book"] as const;

interface CreateShipmentStepperProps {
  step: CreateShipmentWizardStep;
}

export function CreateShipmentStepper({ step }: CreateShipmentStepperProps) {
  const { t } = useTranslation("shipments");

  return (
    <div className="space-y-3 border-b border-border/60 px-6 py-4">
      <p className="text-xs font-medium text-muted-foreground" aria-live="polite">
        {t("wizard.stepper.stepOf", { current: step, total: 3 })}
      </p>
      <ol
        className="flex flex-wrap items-center gap-2"
        aria-label={t("wizard.stepper.label")}
      >
        {STEP_KEYS.map((key, index) => {
          const number = (index + 1) as CreateShipmentWizardStep;
          const isCurrent = number === step;
          const isDone = number < step;

          return (
            <li
              key={key}
              className="flex items-center gap-2"
              aria-current={isCurrent ? "step" : undefined}
            >
              {index > 0 ? (
                <span
                  className="hidden h-px w-6 bg-border sm:block"
                  aria-hidden="true"
                />
              ) : null}
              <span
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-medium",
                  isCurrent && "bg-primary text-primary-foreground",
                  isDone && "bg-primary/10 text-primary",
                  !isCurrent && !isDone && "bg-muted text-muted-foreground",
                )}
              >
                <span aria-hidden="true">{number}</span>
                <span>{t(`wizard.stepper.${key}`)}</span>
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
