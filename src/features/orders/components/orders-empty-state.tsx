import { ClipboardList } from "lucide-react";
import { useTranslation } from "react-i18next";

interface OrdersEmptyStateProps {
  hasSearch: boolean;
  hasFilters: boolean;
}

export function OrdersEmptyState({
  hasSearch,
  hasFilters,
}: OrdersEmptyStateProps) {
  const { t } = useTranslation("orders");

  const title = hasSearch || hasFilters ? t("empty.searchTitle") : t("empty.title");
  const description =
    hasSearch || hasFilters
      ? t("empty.searchDescription")
      : t("empty.description");

  return (
    <div className="flex flex-col items-center gap-3 px-4 py-16 text-center">
      <div
        className="grid size-14 place-items-center rounded-2xl bg-muted/60 text-muted-foreground"
        aria-hidden="true"
      >
        <ClipboardList className="size-7" />
      </div>
      <div className="max-w-md space-y-1">
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
