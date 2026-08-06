import { SearchX, Users } from "lucide-react";
import { useTranslation } from "react-i18next";

interface UsersEmptyStateProps {
  hasSearch: boolean;
}

export function UsersEmptyState({ hasSearch }: UsersEmptyStateProps) {
  const { t } = useTranslation("users");
  const Icon = hasSearch ? SearchX : Users;

  return (
    <div
      className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-muted/15 px-6 py-14 text-center"
      role="status"
    >
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
        {hasSearch ? t("empty.searchDescription") : t("empty.description")}
      </p>
    </div>
  );
}
