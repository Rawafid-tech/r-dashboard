import { Building2, SearchX } from "lucide-react";
import { useTranslation } from "react-i18next";

interface CompaniesEmptyStateProps {
  hasSearch: boolean;
}

export function CompaniesEmptyState({ hasSearch }: CompaniesEmptyStateProps) {
  const { t } = useTranslation("admin");
  const Icon = hasSearch ? SearchX : Building2;

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-muted/15 px-6 py-14 text-center">
      <span
        className="grid size-12 place-items-center rounded-2xl bg-violet-500/10 text-violet-600 ring-1 ring-violet-500/12 dark:text-violet-300"
        aria-hidden="true"
      >
        <Icon className="size-5" />
      </span>
      <h3 className="mt-4 text-base font-semibold text-foreground">
        {hasSearch
          ? t("companies.empty.searchTitle")
          : t("companies.empty.title")}
      </h3>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
        {hasSearch
          ? t("companies.empty.searchDescription")
          : t("companies.empty.description")}
      </p>
    </div>
  );
}
