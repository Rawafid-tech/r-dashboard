import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

interface NotificationsListPanelProps {
  children: ReactNode;
  isFetching?: boolean;
  className?: string;
}

export function NotificationsListPanel({
  children,
  isFetching = false,
  className,
}: NotificationsListPanelProps) {
  return (
    <div
      id="notifications-main"
      role="tabpanel"
      className={cn(
        "relative overflow-hidden rounded-lg border border-border bg-card",
        className,
      )}
    >
      {isFetching ? (
        <div
          className="absolute inset-x-0 top-0 z-10 h-0.5 overflow-hidden bg-primary/10"
          role="status"
          aria-live="polite"
        >
          <div className="data-table-loading-bar h-full w-1/3 rounded-full bg-primary" />
        </div>
      ) : null}
      {children}
    </div>
  );
}
