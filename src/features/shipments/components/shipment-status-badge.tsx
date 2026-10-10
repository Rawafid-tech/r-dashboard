import { useTranslation } from "react-i18next";
import { Badge } from "@/shared/components/ui";
import type { ShipmentStatus } from "@/features/shipments/types";

interface ShipmentStatusBadgeProps {
  status: ShipmentStatus;
}

export function ShipmentStatusBadge({ status }: ShipmentStatusBadgeProps) {
  const { t } = useTranslation("shipments");

  const variant =
    status === "DELIVERED"
      ? "success"
      : status === "BOOKED"
        ? "secondary"
        : status === "IN_TRANSIT" || status === "RETURNING"
          ? "warning"
          : status === "BOOKING"
            ? "warning"
            : status === "FAILED" || status === "LOST"
              ? "destructive"
              : status === "RETURNED"
                ? "muted"
                : "muted";

  return <Badge variant={variant}>{t(`status.${status}`)}</Badge>;
}
