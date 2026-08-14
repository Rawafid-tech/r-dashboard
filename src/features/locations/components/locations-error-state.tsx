import { useTranslation } from "react-i18next";
import { Button } from "@/shared/components/ui";

interface LocationsErrorStateProps {
  onRetry: () => void;
  isRetrying?: boolean;
}

export function LocationsErrorState({
  onRetry,
  isRetrying,
}: LocationsErrorStateProps) {
  const { t } = useTranslation("locations");

  return (
    <div
      role="alert"
      className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-5 sm:px-6"
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
        {t("errors.retry")}
      </Button>
    </div>
  );
}
