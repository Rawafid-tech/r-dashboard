import { CreditCard } from "lucide-react";
import { useTranslation } from "react-i18next";

interface PlansEmptyStateProps {
  hasFilter?: boolean;
}

export function PlansEmptyState({ hasFilter = false }: PlansEmptyStateProps) {
  const { t } = useTranslation("admin");

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-muted/20 px-6 py-14 text-center">
      <span
        className="grid size-12 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/12"
        aria-hidden="true"
      >
        <CreditCard className="size-5" />
      </span>
      <h2 className="mt-4 text-lg font-semibold text-foreground">
        {hasFilter
          ? t("plans.empty.filterTitle")
          : t("plans.empty.title")}
      </h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        {hasFilter
          ? t("plans.empty.filterDescription")
          : t("plans.empty.description")}
      </p>
    </div>
  );
}
