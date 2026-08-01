import { RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/shared/components/ui";
import { PageHeader } from "@/shared/components/layout/page-header";

interface DashboardHeroProps {
  firstName?: string;
  companyLabel?: string;
}

export function DashboardHero({
  firstName,
  companyLabel,
}: DashboardHeroProps) {
  const { t } = useTranslation("dashboard");

  const description = (
    <>
      {companyLabel ? (
        <span className="block font-medium text-foreground">{companyLabel}</span>
      ) : null}
      {t("hero.description")}
    </>
  );

  return (
    <PageHeader
      title={t("hero.greeting", {
        name: firstName ?? t("hero.fallbackName"),
      })}
      description={description}
    />
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
      className="rounded-lg border border-destructive/25 bg-destructive/5 p-4 sm:p-5"
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
