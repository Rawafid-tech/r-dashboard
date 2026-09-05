import { AlertCircle, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/shared/components/ui";

interface WalletErrorStateProps {
  onRetry: () => void;
  isRetrying?: boolean;
}

export function WalletErrorState({ onRetry, isRetrying }: WalletErrorStateProps) {
  const { t } = useTranslation("wallet");

  return (
    <div
      className="flex flex-col items-center justify-center rounded-xl border border-destructive/30 bg-destructive/5 px-6 py-10 text-center"
      role="alert"
    >
      <AlertCircle className="size-8 text-destructive" aria-hidden="true" />
      <p className="mt-4 font-medium text-destructive">{t("errors.loadFailed")}</p>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">
        {t("errors.loadFailedHint")}
      </p>
      <Button
        type="button"
        variant="outline"
        className="mt-5"
        onClick={onRetry}
        disabled={isRetrying}
      >
        <RefreshCw
          className={isRetrying ? "size-4 animate-spin" : "size-4"}
          aria-hidden="true"
        />
        {t("errors.retry")}
      </Button>
    </div>
  );
}
