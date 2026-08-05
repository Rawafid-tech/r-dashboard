import { SearchX, Shield } from "lucide-react";
import { useTranslation } from "react-i18next";

interface RolesEmptyStateProps {
  hasSearch: boolean;
}

export function RolesEmptyState({ hasSearch }: RolesEmptyStateProps) {
  const { t } = useTranslation("roles");
  const Icon = hasSearch ? SearchX : Shield;

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-muted/15 px-6 py-14 text-center">
      <span
        className="grid size-12 place-items-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15"
        aria-hidden="true"
      >
        <Icon className="size-5" />
      </span>
      <h3 className="mt-4 text-base font-semibold text-foreground">
        {hasSearch ? t("empty.searchTitle") : t("empty.title")}
      </h3>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
        {hasSearch
          ? t("empty.searchDescription")
          : t("empty.description")}
      </p>
    </div>
  );
}
