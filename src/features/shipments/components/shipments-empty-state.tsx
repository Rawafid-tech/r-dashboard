import { Package, RotateCcw } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ShipmentsEmptyStateProps {
  hasSearch: boolean;
  hasFilters: boolean;
  scope?: "shipments" | "returns";
}

export function ShipmentsEmptyState({
  hasSearch,
  hasFilters,
  scope = "shipments",
}: ShipmentsEmptyStateProps) {
  const { t } = useTranslation(scope === "returns" ? "returns" : "shipments");

  const title =
    hasSearch || hasFilters
      ? scope === "returns"
        ? t("list.empty.searchTitle")
        : t("empty.searchTitle")
      : scope === "returns"
        ? t("list.empty.title")
        : t("empty.title");
  const description =
    hasSearch || hasFilters
      ? scope === "returns"
        ? t("list.empty.searchDescription")
        : t("empty.searchDescription")
      : scope === "returns"
        ? t("list.empty.description")
        : t("empty.description");

  return (
    <div className="flex flex-col items-center gap-3 px-4 py-16 text-center">
      <div
        className="grid size-14 place-items-center rounded-2xl bg-muted/60 text-muted-foreground"
        aria-hidden="true"
      >
        {scope === "returns" ? (
          <RotateCcw className="size-7" />
        ) : (
          <Package className="size-7" />
        )}
      </div>
      <div className="max-w-md space-y-1">
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
