import { RefreshCw, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/shared/components/ui";
import { cn } from "@/shared/lib/utils";

interface DashboardHeroProps {
  firstName?: string;
  companyLabel?: string;
  className?: string;
}

export function DashboardHero({
  firstName,
  companyLabel,
  className,
}: DashboardHeroProps) {
  const { t } = useTranslation("dashboard");

  return (
    <section
      className={cn(
        "rounded-2xl border border-border bg-card p-5 sm:p-6",
        className,
      )}
      aria-labelledby="dashboard-hero-title"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary ring-1 ring-primary/15">
            <Sparkles className="size-3.5" aria-hidden="true" />
            {t("hero.eyebrow")}
          </div>
          <h1
            id="dashboard-hero-title"
            className="text-2xl font-bold tracking-tight sm:text-3xl"
          >
            {t("hero.greeting", { name: firstName ?? t("hero.fallbackName") })}
          </h1>
          {companyLabel ? (
            <p className="mt-1 text-sm text-muted-foreground">{companyLabel}</p>
          ) : null}
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {t("hero.description")}
          </p>
        </div>
      </div>
    </section>
  );
}

interface DashboardErrorStateProps {
  onRetry: () => void;
  isRetrying?: boolean;
}

export function DashboardErrorState({
  onRetry,
  isRetrying = false,
}: DashboardErrorStateProps) {
  const { t } = useTranslation("dashboard");

  return (
    <div
      role="alert"
      className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 sm:p-5"
    >
      <p className="font-medium text-destructive">{t("errors.loadFailed")}</p>
      <p className="mt-1 text-sm text-muted-foreground">
        {t("errors.loadFailedHint")}
      </p>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-4"
        disabled={isRetrying}
        onClick={onRetry}
      >
        <RefreshCw
          className={isRetrying ? "animate-spin" : undefined}
          aria-hidden="true"
        />
        {t("errors.retry")}
      </Button>
    </div>
  );
}
