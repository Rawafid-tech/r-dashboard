import { AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { ShipmentIssue } from "@/features/shipments/types";
import { Badge } from "@/shared/components/ui";

interface ShipmentIssueBadgeProps {
  issue: ShipmentIssue;
  className?: string;
  /** Allow long carrier reasons to wrap (e.g. shipment timeline). */
  wrapReason?: boolean;
}

export function ShipmentIssueBadge({
  issue,
  className,
  wrapReason = false,
}: ShipmentIssueBadgeProps) {
  const { t } = useTranslation("shipments");

  return (
    <Badge
      variant="warning"
      className={className}
      title={issue.reason}
    >
      <AlertTriangle className="size-3 shrink-0" aria-hidden="true" />
      <span
        className={
          wrapReason
            ? "min-w-0 text-pretty whitespace-normal"
            : "max-w-48 truncate"
        }
      >
        {issue.reason}
      </span>
      <span className="sr-only">{t("issue.badge")}</span>
    </Badge>
  );
}
