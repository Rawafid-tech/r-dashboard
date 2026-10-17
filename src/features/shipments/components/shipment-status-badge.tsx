import { useTranslation } from "react-i18next";
import { Badge } from "@/shared/components/ui";
import type { ShipmentKind, ShipmentStatus } from "@/features/shipments/types";

interface ShipmentStatusBadgeProps {
  status: ShipmentStatus;
  kind?: ShipmentKind;
}

export function ShipmentStatusBadge({ status, kind }: ShipmentStatusBadgeProps) {
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

  const labelKey =
    kind === "RETURN_PICKUP"
      ? (`status.returnPickup.${status}` as const)
      : (`status.${status}` as const);

  const label = t(labelKey, { defaultValue: t(`status.${status}`) });

  return <Badge variant={variant}>{label}</Badge>;
}
