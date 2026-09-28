import { AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/shared/components/ui";

interface OrdersErrorStateProps {
  onRetry: () => void;
  isRetrying?: boolean;
}

export function OrdersErrorState({
  onRetry,
  isRetrying = false,
}: OrdersErrorStateProps) {
  const { t } = useTranslation("orders");

  return (
    <div
      className="flex flex-col items-center gap-4 rounded-xl border border-destructive/30 bg-destructive/5 px-6 py-10 text-center"
      role="alert"
    >
      <AlertCircle className="size-10 text-destructive" aria-hidden="true" />
      <div className="max-w-md space-y-1">
        <h3 className="text-base font-semibold text-foreground">
          {t("errors.loadFailed")}
        </h3>
        <p className="text-sm text-muted-foreground">{t("errors.loadFailedHint")}</p>
      </div>
      <Button
        type="button"
        variant="outline"
        disabled={isRetrying}
        onClick={onRetry}
      >
        {t("errors.retry")}
      </Button>
    </div>
  );
}
