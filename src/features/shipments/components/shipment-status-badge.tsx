import { useTranslation } from "react-i18next";
import { Badge } from "@/shared/components/ui";
import { shipmentStatusLabelKey } from "@/features/shipments/lib/exchange-status-label";
import type { ShipmentKind, ShipmentStatus } from "@/features/shipments/types";

interface ShipmentStatusBadgeProps {
  status: ShipmentStatus;
  kind?: ShipmentKind;
  swappedAt?: string | null;
}

export function ShipmentStatusBadge({
  status,
  kind = "DELIVERY",
  swappedAt,
}: ShipmentStatusBadgeProps) {
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

  const labelKey = shipmentStatusLabelKey(status, kind, swappedAt);
  const label = t(labelKey, { defaultValue: t(`status.${status}`) });

  return <Badge variant={variant}>{label}</Badge>;
}
