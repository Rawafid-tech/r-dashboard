import type { Ref } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/shared/lib/utils";

export type ImportWizardStep = 1 | 2 | 3 | 4;

const STEP_KEYS = ["template", "upload", "preview", "done"] as const;

interface ImportStepperProps {
  step: ImportWizardStep;
}

export function ImportStepper({ step }: ImportStepperProps) {
  const { t } = useTranslation("products");

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium text-muted-foreground" aria-live="polite">
        {t("import.stepper.stepOf", { current: step, total: 4 })}
      </p>
      <ol
        className="flex flex-wrap items-center gap-2"
        aria-label={t("import.stepper.label")}
      >
        {STEP_KEYS.map((key, index) => {
          const number = (index + 1) as ImportWizardStep;
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
                <span>{t(`import.stepper.${key}`)}</span>
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

interface ImportStepHeadingProps {
  headingRef: Ref<HTMLHeadingElement>;
  title: string;
  description?: string;
}

export function ImportStepHeading({
  headingRef,
  title,
  description,
}: ImportStepHeadingProps) {
  return (
    <div className="space-y-1">
      <h2
        ref={headingRef}
        tabIndex={-1}
        className="text-lg font-semibold tracking-tight text-foreground outline-none"
      >
        {title}
      </h2>
      {description ? (
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      ) : null}
    </div>
  );
}
