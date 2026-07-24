import { RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/shared/components/ui";

interface BillingErrorStateProps {
  onRetry: () => void;
  isRetrying?: boolean;
}

export function BillingErrorState({
  onRetry,
  isRetrying = false,
}: BillingErrorStateProps) {
  const { t } = useTranslation("billing");

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
