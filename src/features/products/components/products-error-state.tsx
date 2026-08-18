import { AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/shared/components/ui";

interface ProductsErrorStateProps {
  onRetry: () => void;
  isRetrying?: boolean;
}

export function ProductsErrorState({
  onRetry,
  isRetrying,
}: ProductsErrorStateProps) {
  const { t } = useTranslation("products");

  return (
    <div
      className="flex flex-col items-center justify-center rounded-xl border border-destructive/30 bg-destructive/5 px-6 py-10 text-center"
      role="alert"
    >
      <AlertCircle className="size-8 text-destructive" aria-hidden="true" />
      <h3 className="mt-3 text-base font-semibold text-foreground">
        {t("errors.loadFailed")}
      </h3>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">
        {t("errors.loadFailedHint")}
      </p>
      <Button
        type="button"
        variant="outline"
        className="mt-4"
        disabled={isRetrying}
        onClick={onRetry}
      >
        {t("errors.retry")}
      </Button>
    </div>
  );
}
