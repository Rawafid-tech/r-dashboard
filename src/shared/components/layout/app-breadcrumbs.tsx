import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  useAdminShellBreadcrumbs,
  useMerchantShellBreadcrumbs,
  type ShellBreadcrumb,
} from "@/shared/hooks/use-shell-breadcrumbs";
import { cn } from "@/shared/lib/utils";

interface AppBreadcrumbsProps {
  items: ShellBreadcrumb[];
  className?: string;
}

export function AppBreadcrumbs({ items, className }: AppBreadcrumbsProps) {
  const { t } = useTranslation("common");

  if (items.length === 0) return null;

  return (
    <nav
      aria-label={t("breadcrumb.ariaLabel")}
      className={cn("hidden min-w-0 md:block", className)}
    >
      <ol className="flex min-w-0 items-center gap-1 text-sm">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const showLink = Boolean(item.href) && !isLast;

          return (
            <li
              key={`${item.label}-${index}`}
              className="flex min-w-0 items-center gap-1"
            >
              {index > 0 ? (
                <ChevronRight
                  className="size-3.5 shrink-0 text-muted-foreground/60 rtl:rotate-180"
                  aria-hidden="true"
                />
              ) : null}
              {showLink && item.href ? (
                <Link
                  to={item.href}
                  className="truncate text-muted-foreground transition-colors hover:text-foreground"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={cn(
                    "truncate",
                    isLast
                      ? "font-medium text-foreground"
                      : "text-muted-foreground",
                  )}
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export function MerchantAppBreadcrumbs(props: Omit<AppBreadcrumbsProps, "items">) {
  const items = useMerchantShellBreadcrumbs();
  return <AppBreadcrumbs items={items} {...props} />;
}

export function AdminAppBreadcrumbs(props: Omit<AppBreadcrumbsProps, "items">) {
  const items = useAdminShellBreadcrumbs();
  return <AppBreadcrumbs items={items} {...props} />;
}
