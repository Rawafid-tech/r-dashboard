import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

interface PageHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
  /** Render below title row (filters, tabs, etc.) */
  footer?: ReactNode;
}

export function PageHeader({
  title,
  description,
  actions,
  footer,
  className,
}: PageHeaderProps) {
  return (
    <header className={cn("space-y-4", className)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            {title}
          </h1>
          {description ? (
            <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
        ) : null}
      </div>
      {footer ? <div className="min-w-0">{footer}</div> : null}
    </header>
  );
}
