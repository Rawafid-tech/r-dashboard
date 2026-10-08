import { RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/shared/components/ui";

interface RegionsErrorStateProps {
  detail?: string;
  onRetry: () => void;
  isRetrying?: boolean;
}

export function RegionsErrorState({
  detail,
  onRetry,
  isRetrying = false,
}: RegionsErrorStateProps) {
  const { t } = useTranslation("admin");

  return (
    <div
      role="alert"
      className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 sm:p-5"
    >
      <p className="font-medium text-destructive">
        {detail || t("carriers.regions.errors.loadFailed")}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        {t("carriers.regions.errors.loadFailedHint")}
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
        {t("carriers.regions.errors.retry")}
      </Button>
    </div>
  );
}
