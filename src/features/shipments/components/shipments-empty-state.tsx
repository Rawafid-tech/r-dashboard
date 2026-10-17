import { ArrowLeftRight, Package, RotateCcw } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ShipmentsEmptyStateProps {
  hasSearch: boolean;
  hasFilters: boolean;
  scope?: "shipments" | "returns" | "exchanges";
}

export function ShipmentsEmptyState({
  hasSearch,
  hasFilters,
  scope = "shipments",
}: ShipmentsEmptyStateProps) {
  const listScope = scope === "returns" || scope === "exchanges";
  const { t } = useTranslation(
    scope === "returns"
      ? "returns"
      : scope === "exchanges"
        ? "exchanges"
        : "shipments",
  );

  const title =
    hasSearch || hasFilters
      ? listScope
        ? t("list.empty.searchTitle")
        : t("empty.searchTitle")
      : listScope
        ? t("list.empty.title")
        : t("empty.title");
  const description =
    hasSearch || hasFilters
      ? listScope
        ? t("list.empty.searchDescription")
        : t("empty.searchDescription")
      : listScope
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
        ) : scope === "exchanges" ? (
          <ArrowLeftRight className="size-7" />
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
